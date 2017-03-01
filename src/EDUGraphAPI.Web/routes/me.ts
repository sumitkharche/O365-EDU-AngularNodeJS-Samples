/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import express = require('express');
import jwt = require('jsonwebtoken');
import { Constants } from '../constants';
import { UserService } from '../services/userService';
import { TokenCacheService } from '../services/tokenCacheService';
import { AuthenticationHelper } from '../utils/authenticationHelper'
import { TokenUtils } from '../utils/tokenUtils'

var router = express.Router();
var userService = new UserService();

router.get('/', function (req, res) {
    var u = req.user;
    if (u.authType == 'O365') {
        var retUser;
        userService.getUserModel({ o365UserId: u.oid })
            .then(user => {
                if (user == null) {
                    return userService.getO365User(u.oid, u._json.tid)
                        .then(user => {
                            user.areAccountsLinked = false;
                            user.authType = u.authType;
                            retUser = user;
                            return userService.validUserHasSameEmail(retUser.o365Email);
                        })
                        .then((ret) => {
                            retUser.hasSameNameLocalAccount = ret;
                            return retUser;
                        })
                }
                else {
                    user.areAccountsLinked = true;
                    user.authType = u.authType;
                    return user;
                }
            })
            .then(usermodel => { res.json(usermodel); })
            .catch(error => res.json(500, { error: error }));
    }
    else {
        userService.getUserModel({ id: u.id })
            .then(user => {
                user.authType = u.authType;
                user.areAccountsLinked =
                    user.o365UserId != null && user.o365UserId != ''
                    && user.o365Email != null && user.o365Email != '';
                res.json(user);
            })
            .catch(error => res.json(500, { error: error }));
    }
})

router.post('/favoriteColor', function (req, res) {
    var user = req.body;
    userService.updateFavoriteColor(user.id, user.favoriteColor)
        .then(user => res.json(user))
        .catch(error => res.json(500, { error: error }));
});

router.get('/accessToken', function (req, res) {
    if (!req.isAuthenticated()) {
        res.json(401, { error: "401 unauthorized" });
        return;
    }

    let userId = req.user.oid;
    if (userId == null) {
        res.json(null);
        return;
    }

    AuthenticationHelper.getAccessToken(userId, req.query["resource"])
        .then(accessToken => res.json(accessToken))
        .catch(error => res.json(500, { error: error }));
});

router.post('/O365UserLogin', function (req, res) {
    var redirectUrl = req.query.redirectUrl || '/schools';
    var idToken = jwt.decode(req.body.id_token);
    var tentantId = idToken.tid;
    var code = req.body.code;

    let accessToken: string;
    let tokenService = new TokenCacheService();
    var localUser = req.user;
    localUser.oid = idToken.oid;
    localUser.tid = tentantId;

    AuthenticationHelper.getAccessTokenByCode(req.user.oid, code, Constants.MSGraphResource, 'api/me/O365UserLogin')
        .then(tokenObject => {
            res.redirect(redirectUrl);
        })
        .catch(error => {
            let errorMsg: String = '';
            if (typeof error == 'string' || error instanceof String) {
                errorMsg = error;
            }
            else if (error != null && error.hasOwnProperty('message')) {
                errorMsg = error.message
            }
            else {
                errorMsg = 'unknown error'
            }
            res.redirect('/link/login-o365-required?error=' + encodeURI(errorMsg as string));
        });
})

export = router;