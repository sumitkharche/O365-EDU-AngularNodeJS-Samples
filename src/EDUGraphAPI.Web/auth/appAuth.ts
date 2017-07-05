/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
var express = require("express");
var passport = require("passport");
import https = require('https');
import { TokenCacheService } from '../services/tokenCacheService';
import { Constants } from '../constants';
import { UserService } from '../services/userService';

var tokenCache = new TokenCacheService();

export class appAuth {
    private app: any = null;

    //AAD authentication strategy
    private OIDCStrategy = require('../node_modules/passport-azure-ad/lib/index').OIDCStrategy;

    //Local authentication strategy
    private LocalStrategy = require('passport-local').Strategy;

    /******************************************************************************
    * Set up passport in the app
    ******************************************************************************/
    //-----------------------------------------------------------------------------
    // To support persistent login sessions, Passport needs to be able to
    // serialize users into and deserialize users out of the session.  Typically,
    // this will be as simple as storing the user ID when serializing, and finding
    // the user by ID when deserializing.
    //-----------------------------------------------------------------------------
    constructor(app: any) {
        this.app = app;

        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });

        passport.use('O365', this.constructOIDCStrategy());

        passport.use('Local', this.constructLocalStrategy());
    }

    //-----------------------------------------------------------------------------
    // Use the OIDCStrategy within Passport.
    // 
    // Strategies in passport require a `verify` function, which accepts credentials
    // (in this case, the `oid` claim in id_token), and invoke a callback to find
    // the corresponding user object.
    // 
    // The following are the accepted prototypes for the `verify` function
    // (1) function(iss, sub, done)
    // (2) function(iss, sub, profile, done)
    // (3) function(iss, sub, profile, access_token, refresh_token, done)
    // (4) function(iss, sub, profile, access_token, refresh_token, params, done)
    // (5) function(iss, sub, profile, jwtClaims, access_token, refresh_token, params, done)
    // (6) prototype (1)-(5) with an additional `req` parameter as the first parameter
    //
    // To do prototype (6), passReqToCallback must be set to true in the config.
    //-----------------------------------------------------------------------------
    constructOIDCStrategy() {
        return new this.OIDCStrategy({
            identityMetadata: Constants.IdentityMetadata,
            clientID: Constants.ClientId,
            responseType: 'code',
            responseMode: 'form_post',
            redirectUrl: this.app.get('env') === 'development'
                ? 'https://localhost:44380/auth/openid/return'
                : 'https://' + Constants.Host + '/auth/openid/return',
            allowHttpForRedirectUrl: true,
            clientSecret: Constants.ClientSecret,
            validateIssuer: false,
            isB2C: false,
            passReqToCallback: true,
            loggingLevel: 'info',
            nonceLifetime: null,
        }, function (req, iss, sub, profile, jwtClaims, access_token, refresh_token, params, done) {
            if (!profile.oid) {
                return done(new Error("No oid found"), null);
            }
            profile.tid = profile._json.tid;
            profile.authType = 'O365';
            req.res.cookie('authType', 'O365');

            var tokenCacheService = new TokenCacheService();
            tokenCacheService.createOrUpdate(profile.oid, Constants.AADGraphResource, {
                refreshToken: refresh_token,
                accessToken: access_token,
                expiresOn: new Date(parseInt(params.expires_on) * 1000)
            }).then(item => {
                done(null, profile);
            });
        });
    }

    //-----------------------------------------------------------------------------
    // Use the LocalStrategy within Passport.
    //-----------------------------------------------------------------------------
    constructLocalStrategy() {
        return new this.LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            },
            function (username, password, done) {
                let userSrv = new UserService();
                userSrv.validUser(username, password)
                    .then((user) => {
                        if (user) {
                            let organization = user['organization'];
                            done(null, {
                                'id': user['id'],
                                'oid': user['o365UserId'],
                                'tid': organization ? organization.tenantId : '',
                                'authType': "Local"
                            });
                        } else {
                            done(null);
                        }
                    })
                    .catch(err => {
                        done(null);
                    });
            });
    }

    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else if (req.baseUrl.startsWith("/api/")) {
            res.send(401, 'missing authorization header');
        }
        res.redirect('/');
    }

    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    public initPassport(app: any) {
        app.use(passport.initialize());
        app.use(passport.session());
    }

    //-----------------------------------------------------------------------------
    // Set up the route controller
    //
    // 1. For 'login' route and 'returnURL' route, use `passport.authenticate`. 
    // This way the passport middleware can redirect the user to login page, receive
    // id_token etc from returnURL.
    //
    // 2. For the routes you want to check if user is already logged in, use 
    // `ensureAuthenticated`. It checks if there is an user stored in session, if not
    // it will call `passport.authenticate` to ask for user to log in.
    //-----------------------------------------------------------------------------
    public initAuthRoute(app: any) {

        app.post('/auth/login/local', passport.authenticate('Local'),
            function (req, res) {
                if (req.body.remember) {
                    res.cookie('authType', 'Local', { maxAge: 30 * 24 * 60 * 60 * 1000 });
                } else {
                    res.cookie('authType', 'Local');
                }
                res.json({ status: 'validate successfully' });
            });

        app.get('/auth/login/o365', function (req, res, next) {
            var email = req.cookies[Constants.O365Email];
            passport.authenticate('O365', {
                resourceURL: Constants.AADGraphResource,
                customState: 'my_state',
                failureRedirect: '/',
                login_hint: email
            })(req, res, next);
        });

        // 'GET returnURL'
        // `passport.authenticate` will try to authenticate the content returned in
        // query (such as authorization code). If authentication fails, user will be
        // redirected to '/' (home page); otherwise, it passes to the next middleware.
        app.get('/auth/openid/return', passport.authenticate('O365', { failureRedirect: '/' }), function (req, res) {
            res.redirect('/');
        });

        // 'POST returnURL'
        // `passport.authenticate` will try to authenticate the content returned in
        // body (such as authorization code). If authentication fails, user will be
        // redirected to '/' (home page); otherwise, it passes to the next middleware.
        app.post('/auth/openid/return', passport.authenticate('O365', { failureRedirect: '/' }), function (req, res) {
            res.redirect('/');
        });

        // 'logout' route, logout from passport, and destroy the session with AAD.
        app.get('/logout', function (req, res) {
            let authType = req.cookies['authType'];
            res.clearCookie('authType');
            req.logOut();
            req.session = null;
            if (authType == 'O365')
                res.redirect(Constants.Authority + 'oauth2/logout?post_logout_redirect_uri=' + req.protocol + '://' + req.get('host'));
            else
                res.redirect('/');
        });
    }
}