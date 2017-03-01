/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import express = require('express');
import { TenantService } from '../services/tenantService';
import { UserService } from '../services/userService';

var router = express.Router();
var tenantService = new TenantService();
var userService = new UserService();

router.post('/', function (req, res) {
    var u = req.user;
    var org = req.body;
    let bO365User = u.authType == 'O365';
    let userId = bO365User ? u.oid : u.id;
    userService.validUserIsAdmin(bO365User, userId)
        .then((isAdmin) => {
            if (isAdmin) {
                if (u.authType == 'O365') {
                    let tenantId = u._json.tid;
                    return tenantId
                }
                else {
                    return userService.getUserTenantId(userId)
                }
            }
            else {
                throw "Invalid operation. Permission Denied.";
            }
        })
        .then(tId => {
            return tenantService.updateTenant(tId, org.isAdminConsented);
        })
        .then(org => res.json(org))
        .catch(error => res.json(500, { error: error }))
});

router.post('/unlinkAllUsers', function (req, res) {
    var u = req.user;
    let bO365User = u.authType == 'O365';
    let userId = bO365User ? u.oid : u.id;
    userService.validUserIsAdmin(bO365User, userId)
        .then((isAdmin) => {
            if (isAdmin) {
                if (u.authType == 'O365') {
                    let tenantId = u._json.tid;
                    return tenantId
                }
                else {
                    return userService.getUserTenantId(userId)
                }
            }
            else {
                throw "Invalid operation. Permission Denied.";
            }
        })
        .then(tId => {
            return tenantService.updateTenant(tId, false);
        })
        .then((org) => {
            return tenantService.unlinkTenantAllAccounts(org);
        })
        .then(() => res.json(200))
        .catch(error => res.json(500, { error: error }))
});


export = router;