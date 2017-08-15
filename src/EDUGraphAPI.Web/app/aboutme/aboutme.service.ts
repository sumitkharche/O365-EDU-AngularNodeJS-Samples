/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Constants } from '../constants';
import { AboutMeModel } from './aboutme';
import { ClassesModel } from '../school/classes';
import { ColorEntity } from '../models/common/colorEntity';
import { MeService } from "../services/meService";
import { DataService } from "../services/dataService";

@Injectable()
export class AboutMeService {

    private graphUrlBase: string = Constants.MSGraphResource + '/v1.0';

    constructor(private http: Http,
        @Inject('me') private meService: MeService,
        @Inject('data') private dataService: DataService) {
    }

    getMe(): any {
        return this.meService.getCurrentUser();
    }

    getMyClasses(): any {
        return this.dataService.get(this.graphUrlBase + "/me/memberOf")
            .map((response: Response): ClassesModel[] => {
                var classes: ClassesModel[] = new Array<ClassesModel>();
                var groups: any[] = <any[]>response.json().value;
                groups.forEach((group) => {
                    if (group["extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType"] === "Section") {
                        classes.push(group);
                    }
                });
                return classes;
            });
    }

    updateFavoriteColor(color: string): Promise<any> {
        return this.meService.updateFavoriteColor(color);
    }
}