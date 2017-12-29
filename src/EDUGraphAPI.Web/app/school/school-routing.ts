/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Routes, RouterModule } from '@angular/router';
import { SchoolComponent } from './school.component'
import { ClassesComponent } from './classes.component'
import { MyClassesComponent } from './myclasses.component'
import { ClassDetailComponent } from './classdetail.component';

const routes: Routes = [
    {
        path: 'schools',
        component: SchoolComponent
    },
    {
        path: 'classes/:id',
        component: ClassesComponent
    },
    {
        path: 'myclasses/:id',
        component: MyClassesComponent
    },
    {
        path: 'classdetail/:id/:id2',
        component: ClassDetailComponent
    }
];

export const routing = RouterModule.forChild(routes);