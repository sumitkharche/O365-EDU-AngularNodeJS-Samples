/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ConsentComponent } from './consent.component';
import { LinkedAccountsComponent } from './linkedAccounts.component'

const routes: Routes = [
    { path: 'admin', component: AdminComponent },
    { path: 'admin/consent', component: ConsentComponent },
    { path: 'linkedAccounts', component: LinkedAccountsComponent },
];

export const routing = RouterModule.forChild(routes);