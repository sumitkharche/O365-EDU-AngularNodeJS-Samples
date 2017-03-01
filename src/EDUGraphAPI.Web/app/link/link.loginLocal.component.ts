/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LinkService } from './link.service';
import { UserInfo } from '../models/common/userinfo';
import { LoginLocalModel } from './link';
import { ColorEntity } from '../models/common/colorEntity';
import { Constants } from '../constants';
import { MeService } from "../services/meService";
import { UserService } from "../services/userService";

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'link.loginLocal.component.template.html'
})

export class LinkLoginLocal implements OnInit {
    userInfo: UserInfo;
    loginLocalModel: LoginLocalModel;
    checkPwdRequired: boolean = true;
    checkEmailRequired: boolean = true;
    errorMsgs: string[];
    serverCheckValid: boolean = true;

    constructor(
        private router: Router,
        @Inject('linkService') private linkService: LinkService,
        @Inject('me') private meService: MeService,
        @Inject('user') private userService: UserService) { }

    ngOnInit() {
        this.initCurrentUser();
        this.loginLocalModel = new LoginLocalModel();
    }

    initCurrentUser() {
        this.userInfo = new UserInfo();
        this.linkService.getCurrentUser()
            .subscribe((user) => {
                this.userInfo.readFromJson(user);
            });
    }

    checkValid() {
        this.checkPwdRequired = !this.linkService.isEmpty(this.loginLocalModel.password);
        this.checkEmailRequired = !this.linkService.isEmpty(this.loginLocalModel.email);
        return this.checkPwdRequired && this.checkEmailRequired;
    }

    loginLocal() {
        if (!this.checkValid())
            return;
        this.linkService.linkLocalUser(this.loginLocalModel.email, this.loginLocalModel.password)
            .subscribe(
            (result) => this.router.navigate(["schools"]),
            (err) => { this.errorMsgs = [err.json().error]; this.serverCheckValid = false; });
    }
}