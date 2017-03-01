/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { MapUtils } from './utils/jsonhelper';
import { UrlHelper } from './utils/urlHelper';
import { AuthHelper } from "./authHelper/authHelper";
import { MeService } from "./services/meService";

@Component({
    moduleId: module.id,
    selector: 'app',
    templateUrl: 'app.component.template.html',
    styleUrls: ['../app/app.component.css']
})

export class AppComponent implements OnInit {

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        @Inject('auth') private auth: AuthHelper,
        @Inject('me') private meService: MeService) {
    }

    ngOnInit() {
    }

    integrateJson() {
        MapUtils.deserialize(Object, {});
    }
}