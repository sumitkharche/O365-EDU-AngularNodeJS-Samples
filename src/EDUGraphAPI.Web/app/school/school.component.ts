/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EducationSchool } from '../models/educationschool'
import { SchoolService } from './school.service';
import { MapUtils } from '../utils/jsonHelper'
import { UserModel } from '../models/user';
import { EducationUser } from '../models/educationuser'
import { Constants } from '../constants';
import { MeService } from "../services/meService";
import { Cookie } from '../services/cookieService';

@Component({
    moduleId: module.id,
    selector: 'schools-list',
    host: {},
    templateUrl: 'school.component.template.html',
    styleUrls: []
})

export class SchoolComponent implements OnInit {

    schools: EducationSchool[];
    me: UserModel;
    mySchool: EducationSchool;
    areAccountsLinked: boolean;
    isLocalAccount: boolean;
    showNoData: boolean = false;
    joinableuser: EducationUser;

    constructor(
        private router: Router,
        @Inject('me') private meService: MeService,
        @Inject('schoolService') private schoolService: SchoolService) {
    }

    ngOnInit() {
        this.schoolService
            .getMe()
            .subscribe((result) => {
                this.me = MapUtils.deserialize(UserModel, result);
                if (this.me) {
                    Cookie.SetCookiesForO365Users(this.me.DisplayName, this.me.Email);
                    this.schoolService
                        .getJoinableUser()
                        .subscribe((user) => {
                            this.joinableuser = MapUtils.deserialize(EducationUser, user);
                            user.schools.forEach((school) => {
                                this.joinableuser.Schools.push(MapUtils.deserialize(EducationSchool, school))
                            });
                            this.schoolService
                                .getSchools()
                                .subscribe((result) => {
                                    this.schools = [];
                                    result.forEach((school) => { this.schools.push(MapUtils.deserialize(EducationSchool, school)); })
                                    if (this.schools.length == 0) {
                                        this.showNoData = true;
                                    }

                                    if (this.joinableuser.Schools.length > 0) {
                                        this.schools.forEach((school) => {
                                            if (this.joinableuser.Schools[0].Id == school.Id) {
                                                school.IsMySchool = true;
                                                this.mySchool = school;
                                            }
                                            if (school.Address != null && (!school.Address.Street || school.Address.Street == "")
                                                && (!school.Address.PostalCode || school.Address.PostalCode == "")) {
                                                school.Address.Street = "-";
                                            }
                                            if (!school.PrincipalName || school.PrincipalName == "") {
                                                school.PrincipalName = "-";
                                            }
                                        });
                                    }

                                    this.schools.sort((n1, n2) => {
                                        if (n1.IsMySchool) {
                                            return -1;
                                        }
                                        if (n2.IsMySchool) {
                                            return 1;
                                        }
                                        return n1.DisplayName > n2.DisplayName ? 1 : (n1.DisplayName < n2.DisplayName ? -1 : 0);
                                    });
                                });
                        });
                }
            });
        this.initLocalAndLinkedState();
    }

    initLocalAndLinkedState() {
        this.meService.getCurrentUser()
            .subscribe((user) => {
                this.areAccountsLinked = user.areAccountsLinked;
            });

        this.isLocalAccount = this.meService.isLocalAccount();
    }

    gotoClasses(school: EducationSchool) {
        setTimeout(() => {
            this.router.navigate(['myclasses', school.Id]);
        }, 100);
    }

}