/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, Input, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../constants';
import { UserInfo } from '../models/common/userinfo';
import { AuthHelper } from "../authHelper/authHelper";
import { MeService } from "../services/meService";
import { Cookie } from "../services/cookieService";
import { SchoolService } from '../school/school.service';
import { UserModel } from '../models/user';
import { MapUtils } from '../utils/jsonHelper';
import { UserPhotoService } from '../services/userPhotoService';

@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: 'header.component.template.html',
})

export class Header implements OnInit {

    @Input() isAuthenticated: boolean;

    ifShowContextMenu: boolean;
    fullName: string;
    isAdmin: boolean;
    userRole: string = "";
    me: UserModel;
    userPhoto: string = "";
    showO365UserInfo: boolean = true;

    constructor(
        private router: Router,
        @Inject('me') private meService: MeService,
        @Inject('auth') private authService: AuthHelper,
        @Inject('userPhotoService') private userPhotoService: UserPhotoService,
        @Inject('schoolService') private schoolService: SchoolService) {
    }

    ngOnInit() {
        this.ifShowContextMenu = false;
        this.router.events.subscribe((url: any) => {
            if (url.url.toLowerCase() == "/link/login-o365-required") {
                this.showO365UserInfo = false;
            }
        });
        this.initFullName();

    }

    urlParts() {
        var parts = window.location.pathname.split('/');
        var result = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] != '')
                result.push(parts[i]);
        }
        return result;
    }

    getSchoolId() {
        let urlParts = this.urlParts();
        if (urlParts.length == 2 && (urlParts[0].toLowerCase() == "classes" || urlParts[0].toLowerCase() == "users" || urlParts[0].toLowerCase() == "myclasses"))
            return urlParts[1];
        if (urlParts.length == 3 && (urlParts[0].toLowerCase() == "classdetail"))
            return urlParts[1];
        return '';
    }

    isClassesPage() {
        let urlParts = this.urlParts();
        return urlParts.length > 0 && (urlParts[0].toLowerCase() == "classes" || urlParts[0].toLowerCase() == "classdetail");
    }

    isTeacherStudentsPage() {
        let urlParts = this.urlParts();
        if (urlParts.length == 0 || (urlParts[0].toLowerCase() != "users"))
            return false;
        if (urlParts.length >= 2 && urlParts[0].toLowerCase() == "users")
            return true;
        return false;
    }

    isMyClassesPage() {
        let urlParts = this.urlParts();
        return urlParts.length > 0 && (urlParts[0].toLowerCase() == "myclasses");
    }

    ifShowClassesTeacherStudents() {
        return this.isClassesPage() || this.isTeacherStudentsPage() || this.isMyClassesPage();
    }

    showContextMenu() {
        let isLogin = false;
        let urlParts = this.urlParts();
        for (var i = 0; i < urlParts.length; i++) {
            if (urlParts[i].toLowerCase() == "login")
                isLogin = true;
        }
        if (isLogin)
            return;
        this.ifShowContextMenu = !(this.ifShowContextMenu);
    }

    initFullName() {
        if (this.authService.IsLogin()) {
            this.meService.getCurrentUser()
                .subscribe((user) => {
                    this.fullName = (user.areAccountsLinked || user.authType == 'O365')
                        ? (user.firstName + " " + user.lastName)
                        : user.email
                    this.isAdmin = this.isUserAdmin(user);
                    if (user.o365UserId && this.showO365UserInfo) {
                        this.userPhotoService.getUserPhotoUrl(user.o365UserId)
                            .then(url => this.userPhoto = url);
                    }
                    if (this.isAdmin)
                        this.userRole = "Admin";
                    else {
                        if (this.showO365UserInfo) {
                            this.schoolService
                                .getMe()
                                .subscribe((result) => {
                                    this.me = MapUtils.deserialize(UserModel, result);
                                    this.userRole = this.me.ObjectType;
                                });
                        }
                    }
                });
        }
    }

    isUserAdmin(user: UserInfo): boolean {
        let result = false;
        let roles = user.roles;
        if (roles == undefined || roles == null || roles.length == 0)
            return result;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].toLowerCase() == "admin") {
                result = true;
                break;
            }
        }
        return result;
    }

    doLogOff(): void {
        console.log('logOff');
        Cookie.delete(Constants.AADGraphAccessToken);
        Cookie.delete(Constants.MSGraphAccessToken);
        window.location.href = '/logout';
    }
}