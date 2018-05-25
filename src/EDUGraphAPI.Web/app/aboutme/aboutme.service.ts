/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Constants } from '../constants';
import { AboutMeModel } from './aboutme';
import { ColorEntity } from '../models/common/colorEntity';
import { MeService } from "../services/meService";
import { DataService } from "../services/dataService";

@Injectable()
export class AboutMeService {

    private graphUrlBase: string = Constants.MSGraphResource + '/beta';

    constructor(private http: Http,
        @Inject('me') private meService: MeService,
        @Inject('data') private dataService: DataService) {
    }

    getMe(): any {
        return this.meService.getCurrentUser();
    }

    updateFavoriteColor(color: string): Promise<any> {
        return this.meService.updateFavoriteColor(color);
    }
}