/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AuthHelper } from "../authHelper/authHelper";
import { LinkService } from './link.service';
import { DataService } from '../services/DataService';
import { UserService } from "../services/userService";
import { MeService } from "../services/meService";
import { Link } from './link.component';
import { routing } from './link-routing';
import { LinkCreateLocal } from './link.createLocal.component';
import { LinkLoginLocal } from './link.loginLocal.component';
import { LinkLoginO365Required } from './link.loginO365Required.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        routing
    ],
    declarations: [
        Link,
        LinkCreateLocal,
        LinkLoginLocal,
        LinkLoginO365Required
    ],
    providers: [
        { provide: 'linkService', useClass: LinkService },
        { provide: 'auth', useClass: AuthHelper },
        { provide: 'dataService', useClass: DataService },
        { provide: 'me', useClass: MeService },
        { provide: 'user', useClass: UserService }
    ],
    bootstrap: [Link]
})

export class LinkModule { }