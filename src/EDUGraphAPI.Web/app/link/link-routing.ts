/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Routes, RouterModule } from '@angular/router';
import { Link } from './link.component';
import { LinkCreateLocal } from './link.createLocal.component';
import { LinkLoginLocal } from './link.loginLocal.component';
import { LinkLoginO365Required } from './link.loginO365Required.component';

const routes: Routes = [
    {
        path: 'link',
        component: Link
    },
    {
        path: 'link/create-local',
        component: LinkCreateLocal
    },
    {
        path: 'link/login-local',
        component: LinkLoginLocal
    },
    {
        path: 'link/login-o365-required',
        component: LinkLoginO365Required
    }
];

export const routing = RouterModule.forChild(routes);

