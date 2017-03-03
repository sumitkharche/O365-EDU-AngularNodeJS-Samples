/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LinkService } from './link.service';
import { UserInfo } from '../models/common/userinfo';
import { CreateLocalModel } from './link';
import { ColorEntity } from '../models/common/colorEntity';
import { Constants } from '../constants';
import { MeService } from "../services/meService";
import { UserService } from "../services/userService";

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'link.createLocal.component.template.html'
})

export class LinkCreateLocal implements OnInit {

    localModel: CreateLocalModel;
    favoriteColors: ColorEntity[];
    checkPwdRequired: boolean = true;
    checkConfirmPwdRequired: boolean = true;
    checkPwdEqualConfirmPwd: boolean = true;
    serverCheckValid: boolean = true;
    errorMsgs: string[];

    constructor(
        private router: Router,
        @Inject('linkService') private linkService: LinkService,
        @Inject('me') private meService: MeService,
        @Inject('user') private userService: UserService) { }

    ngOnInit() {
        this.localModel = new CreateLocalModel();
        this.favoriteColors = Constants.FavoriteColors;
        this.localModel.favoriteColor = this.favoriteColors[0].Value;
    }

    checkValid() {
        return true;
    }

    createLocal() {
        if (!this.checkValid()) return;
        this.linkService.createLocalUser(this.localModel.favoriteColor)
            .subscribe((result) => {
                if (result == 200) {
                    this.router.navigate(["schools"]);
                }
            },
            (err) => {
                this.errorMsgs = [err.json().error]; this.serverCheckValid = false;
            });
    }
}