/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AuthHelper } from "../authHelper/authHelper";
import { AdminService } from './admin.service';
import { DataService } from '../services/DataService';
import { AdminComponent } from './admin.component';
import { ConsentComponent } from './consent.component';
import { LinkedAccountsComponent } from './linkedAccounts.component';
import { routing } from './admin-routing';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        routing
    ],
    declarations: [
        AdminComponent,
        ConsentComponent,
        LinkedAccountsComponent
    ],
    providers: [
        { provide: 'adminService', useClass: AdminService },
        { provide: 'auth', useClass: AuthHelper },
        { provide: 'dataService', useClass: DataService },
    ],
    bootstrap: [AdminComponent]
})

export class AdminModule {
}