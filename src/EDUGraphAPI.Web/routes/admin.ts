/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import express = require('express');
import { TenantService } from '../services/tenantService';
import { MSGraphClient } from '../services/msGraphClient';
import { Constants } from '../constants';
import { OrganizationInstance } from '../data/dbContext';
import { AuthenticationHelper } from '../utils/authenticationHelper';
import { TokenCacheService } from '../services/tokenCacheService';

import jwt = require('jsonwebtoken');

var router = express.Router();
var tenantService = new TenantService();
var stateSessionKey = 'admin_consent_state';

function generateNonce(): string {
    var text = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

router.get('/consent', function (req, res, next) {
    var redirectUri = `https://${Constants.Host}/api/admin/consented`
    var responseType = 'code+id_token';
    var responseMode = 'form_post';
    var resource = Constants.MSGraphResource;
    var prompt = 'admin_consent';
    var state = generateNonce();
    var nonce = generateNonce();

    var url = Constants.Authority + `oauth2/authorize` +
        `?response_type=` + responseType +
        `&response_mode=` + encodeURIComponent(responseMode) +
        `&client_id=` + encodeURIComponent(Constants.ClientId) +
        `&redirect_uri=` + encodeURIComponent(redirectUri) +
        `&state=` + encodeURIComponent(state) +
        `&resource=` + encodeURIComponent(resource) +
        `&nonce=` + encodeURIComponent(nonce) +
        `&prompt=` + encodeURIComponent(prompt);

    req.session[stateSessionKey] = state;
    res.redirect(url);
});

router.post('/consented', function (req, res, next) {
    var state = req.body.state as string;
    if (req.session[stateSessionKey] != state) {
        res.status(400);
        return;
    }

    delete req.session[stateSessionKey];

    var error = req.body.error as string;
    if (error) {
        var errorDescription = req.body.error_description;
        res.redirect('/admin/consent?error=' + encodeURIComponent(errorDescription));
        return;
    }

    var idToken = jwt.decode(req.body.id_token);
    var tenantId = idToken.tid;
    var redirectUrl = '/admin/consent?message=' + encodeURIComponent('Admin Consent has been applied.');

    tenantService.getTenant(tenantId)
        .then(tenant => {
            if (tenant == null) {
                var code = req.body.code;
                AuthenticationHelper.getAccessTokenByCode(idToken.oid, code, Constants.MSGraphResource, 'api/admin/consented')
                    .then(result => {
                        var msGraphClient = new MSGraphClient(result.accessToken);
                        msGraphClient.getOrganization(tenantId)
                            .then(organization => {
                                tenantService.createTenant(tenantId, organization.displayName, true)
                                    .then(() => res.redirect(redirectUrl));
                            });
                    });
            }
            else if (tenant.isAdminConsented == false) {
                tenantService.updateTenant(tenantId, true)
                    .then(() => res.redirect(redirectUrl));
            }
            else
                res.redirect(redirectUrl);
        });
})
router.post('/clearusertokencache', function (req, res) {
    //var redirectUrl = req.query.redirectUrl || '/schools';
    res.clearCookie('authType');
    req.session = null;

    let tokenService = new TokenCacheService();
    tokenService.clearUserTokenCache()
        .then(() => {
            res.json(200)
        })
        .catch(error => {
            res.json(500, { error: error })
        });
})

export = router;