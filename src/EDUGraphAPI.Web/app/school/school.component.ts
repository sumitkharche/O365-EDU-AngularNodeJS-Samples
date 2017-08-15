/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

/// <reference path="../../node_modules/bingmaps/scripts/MicrosoftMaps/Microsoft.Maps.d.ts" />
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SchoolModel } from './school'
import { SchoolService } from './school.service';
import { MapUtils } from '../utils/jsonHelper'
import { UserModel } from './user'
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

    schools: SchoolModel[];
    me: UserModel;
    mySchool: SchoolModel;
    areAccountsLinked: boolean;
    isLocalAccount: boolean;
    showNoData: boolean = false;
    showBingMapIcon: boolean = false;

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
                Cookie.SetCookiesForO365Users(this.me.DisplayName, this.me.Email);
                this.schoolService
                    .getSchools()
                    .subscribe((result) => {
                        this.schools = [];
                        result.forEach((school) => { this.schools.push(MapUtils.deserialize(SchoolModel, school)); })
                        if (this.schools.length == 0) {
                            this.showNoData = true;
                        }
                        this.schools.forEach((school) => {
                            if (this.me.SchoolId == school.SchoolId) {
                                school.IsMySchool = true;
                                this.mySchool = school;
                            }
                            if (!school.PrincipalName || school.PrincipalName == "") {
                                school.PrincipalName = "-";
                            }
                        });
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
        this.initLocalAndLinkedState();
        if (Constants.BingMapKey) {
            this.showBingMapIcon = true;
        }
    }

    initLocalAndLinkedState() {
        this.meService.getCurrentUser()
            .subscribe((user) => {
                this.areAccountsLinked = user.areAccountsLinked;
            });

        this.isLocalAccount = this.meService.isLocalAccount();
    }

    gotoClasses(school: SchoolModel) {
        setTimeout(() => {
            this.router.navigate(['myclasses', school.ObjectId, school.SchoolId]);
        }, 100);
    }

    gotoUsers(school: SchoolModel) {
        setTimeout(() => {
            this.router.navigate(['users', school.ObjectId, school.SchoolId]);
        }, 100);
    }

}