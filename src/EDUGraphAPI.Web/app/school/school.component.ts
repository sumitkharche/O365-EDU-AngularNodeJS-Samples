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
import { BingMapHelper } from '../utils/bingMapHelper'
import { MapUtils } from '../utils/jsonHelper'
import { UserModel } from './user'
import { Constants } from '../constants';
import { MeService } from "../services/meService";
import { Cookie } from '../services/cookieService';
@Component({
    moduleId: module.id,
    selector: 'schools-list',
    host: {
        '(document:click)': 'showMap($event)',
    },
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
                            BingMapHelper.getLatitudeAndLongitude(school.State, school.City, school.Address).then((location) => {
                                school.Latitude = location.Latitude;
                                school.Longitude = location.Longitude;
                            });
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
        if (Constants.BING_MAP_KEY) {
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

    showMap(event) {
        const target = event.target || event.srcElement || event.currentTarget;
        if ($(target).closest("#myMap").length == 1) {
            return;
        }

        const element = $(target).closest("a.bingMapLink");
        const myMap = $(".schools #myMap");
        if (element.length == 0) {
            myMap.offset({ top: 0, left: 0 }).hide();
            return;
        }

        const latitude: string = element.attr("latitude");
        const longitude: string = element.attr("longitude");
        if (latitude && longitude) {
            var map = new Microsoft.Maps.Map(myMap[0], {
                credentials: Constants.BING_MAP_KEY,
                center: new Microsoft.Maps.Location(latitude, longitude),
                mapTypeId: Microsoft.Maps.MapTypeId.road,
                showMapTypeSelector: false,
                zoom: 10
            });
            var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), null);
            map.entities.push(pushpin);

            var offset = element.offset();
            myMap.offset({ top: offset.top - 50, left: offset.left + 50 }).css({ width: "200px", height: "200px" }).show();
        }
    }
}
