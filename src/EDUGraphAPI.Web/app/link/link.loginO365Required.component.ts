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
import { UrlHelper } from '../utils/urlHelper';
import { Cookie } from '../services/cookieService';

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'link.loginO365Required.component.template.html'
})

export class LinkLoginO365Required implements OnInit {

    userInfo: UserInfo;
    error: string;

    constructor(
        private router: Router,
        @Inject('linkService') private linkService: LinkService,
        @Inject('me') private meService: MeService,
        @Inject('user') private userService: UserService) { }

    ngOnInit() {
        this.initCurrentUser();
        this.initMessage();
    }

    initCurrentUser() {
        this.userInfo = new UserInfo();
        this.linkService.getCurrentUser()
            .subscribe((user) => {
                this.userInfo.readFromJson(user);
            });
    }

    reLoginO365() {
        var userName = this.userInfo.firstName + ' ' + this.userInfo.lastName;
        Cookie.SetCookiesForO365Users(userName, this.userInfo.o365Email);
        window.location.href = '/o365Login';
    }

    initMessage() {
        var msg = UrlHelper.getUrlQueryValue(window.location.href, 'error')
        if (msg != null && msg.length > 0) {
            this.error = msg;
        }
    }
}