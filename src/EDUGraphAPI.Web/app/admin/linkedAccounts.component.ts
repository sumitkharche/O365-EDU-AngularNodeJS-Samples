/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MapUtils } from '../utils/jsonhelper';
import { UserInfo } from '../models/common/userInfo'
import { AdminService } from './admin.service';
import { AuthHelper } from "../authHelper/authHelper";

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'linkedAccounts.component.template.html',
    styleUrls: []
})

export class LinkedAccountsComponent implements OnInit {

    accounts: UserInfo[] = new Array<UserInfo>();

    constructor(
        private router: Router,
        @Inject('auth') private auth: AuthHelper,
        @Inject('adminService') private adminService: AdminService) {
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
                    this.adminService.getLinkedAccounts()
                        .subscribe((users) => {
                            users.forEach((user) => {
                                let account: UserInfo = new UserInfo();
                                account.readFromJson(user);
                                this.accounts.push(account);
                            });
                        });
                }
            });
    }

    unlink(account: UserInfo, index: number) {
        if (confirm(`Are you sure you want to unlink ${account.email} with Office 365 account ${account.o365Email}?`)) {
            this.adminService.unlinkAccount(account.id)
                .subscribe((status) => {
                    if (status === true) {
                        this.accounts.splice(index, 1);
                    }
                });
        }
    }

    gotoAdmin() {
        this.router.navigate(["admin"]);
    }
}