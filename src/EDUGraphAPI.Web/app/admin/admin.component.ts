/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MapUtils } from '../utils/jsonhelper';
import { AdminService } from './admin.service';
import { UrlHelper } from '../utils/urlHelper';
import { AuthHelper } from "../authHelper/authHelper";

@Component({
    moduleId: module.id,
    selector: 'admin',
    templateUrl: 'admin.component.template.html',
    styleUrls: []
})

export class AdminComponent implements OnInit {

    IsAdminConsented: boolean;
    error: string;
    message: string;

    constructor(
        @Inject('adminService') private adminService: AdminService,
        private router: Router,
        @Inject('auth') private auth: AuthHelper) {
    }

    ngOnInit() {
        if (!this.auth.IsLogin()) {
            this.auth.reLogin();
        }
        this.adminService.getAdmin()
            .subscribe((result) => {
                if (!this.adminService.isAdmin(result)) {
                    this.auth.reLogin();
                } else {
                    this.initMessage();
                    this.IsAdminConsented = result.organization.isAdminConsented;
                }
            });
        this.initConsentResult();
    }

    private initConsentResult() {
        this.message = UrlHelper.getQueryValue('message');
    }

    consent() {
        this.adminService.consent();
    }

    unconsent() {
        const errorMessage: string = "Admin unconsent failed.";
        this.adminService.unconsent().then((succeed) => {
            if (succeed) {
                this.IsAdminConsented = false;
                this.message = "";
            }
        }).catch((result) => {
            this.error = errorMessage;
        });
    }

    linkedAccounts() {
        this.router.navigate(["linkedAccounts"]);
    }

    addAppRoleAssignments() {
        this.adminService.addAppRoleAssignments().then((message) => {
            this.message = message;
        }).catch((message) => {
            this.error = message;
        });
    }
    clearAdalCache() {
        this.adminService.clearUserTokenCache().then(() => {
            this.message = 'Login cache cleared successfully!';
        }).catch(() => {
            this.error = 'Login cache cleared Failure.';
        });
    }
    private initMessage() {
        var error_description = UrlHelper.getHashValue('error_description');
        if (error_description && error_description.length > 0) {
            this.error = error_description;
            return;
        }

        var idToken = UrlHelper.getHashValue('id_token')
        if (idToken != null && idToken.length > 0) {
            this.adminService.setIsAdminConsented().then(() => {
                this.message = 'Admin Consent has been applied.';
                this.IsAdminConsented = true;
                window.location.hash = '';
            }).catch((error) => {
                this.error = error;
            });
        }
    }
}