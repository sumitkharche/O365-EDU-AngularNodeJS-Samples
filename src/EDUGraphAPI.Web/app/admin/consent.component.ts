/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { UrlHelper } from '../utils/urlHelper';
import { Router } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'consent.component.template.html',
    styleUrls: []
})

export class ConsentComponent implements OnInit {
        
    error: string;
    message: string;

    constructor(private router: Router) {    }

    ngOnInit() {
        this.initMessage();
    }

    consent() {
        window.location.href = '/api/admin/consent';
    }    

    private initMessage() {
        this.error = UrlHelper.getQueryValue('error');
        this.message = UrlHelper.getQueryValue('message');
    }
}