/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Login } from './login/login.component';
import { O365login } from './O365login/O365login.component';
import { Header } from './header/header.component';
import { DemoHelper } from './demoHelper/demoHelper.component';
import { Register } from './register/register.component';
import { AboutMe } from './aboutme/aboutme.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';

export const appRoutes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'schools', redirectTo: "schools" },
    { path: 'admin', redirectTo: "admin" },
    { path: 'header', component: Header },
    { path: 'link', redirectTo: "link" },
    { path: 'demoHelper', component: DemoHelper },
    { path: 'aboutme', component: AboutMe },
    { path: 'O365login', component: O365login},
    { path: '**', component: HomeComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);