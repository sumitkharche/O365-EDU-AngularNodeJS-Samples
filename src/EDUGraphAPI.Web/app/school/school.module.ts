/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AuthHelper } from "../authHelper/authHelper";
import { SchoolService } from './school.service';
import { DataService } from '../services/dataService';
import { UserPhotoService } from '../services/userPhotoService';
import { SchoolComponent } from './school.component';
import { routing } from './school-routing';
import { ClassesComponent } from './classes.component';
import { MyClassesComponent } from './myclasses.component';
import { ClassDetailComponent } from './classdetail.component';
import { Tabs } from '../tabs/tabs';
import { Tab } from '../tabs/tab';
import { CustomPosition, CustomUserId, CustomRealHeader, CustomPrevPosition } from './customdirectives';
import { FileSelectDirective } from 'ng2-file-upload';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        routing
    ],
    declarations: [
        SchoolComponent,
        ClassesComponent,
        MyClassesComponent,
        ClassDetailComponent,
        Tabs,
        Tab,
        CustomPosition,
        CustomUserId,
        CustomRealHeader,
        CustomPrevPosition,
        FileSelectDirective
    ],
    providers: [
        { provide: 'schoolService', useClass: SchoolService },
        { provide: 'auth', useClass: AuthHelper },
        { provide: 'dataService', useClass: DataService },
        { provide: 'userPhotoService', useClass: UserPhotoService }
    ],
    bootstrap: [SchoolComponent]
})

export class SchoolModule { }