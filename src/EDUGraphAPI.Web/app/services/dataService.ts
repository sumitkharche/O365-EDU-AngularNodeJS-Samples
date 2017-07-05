/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import { Injectable, Inject } from '@angular/core';
import { PagedCollection } from '../models/common/pagedCollection';
import { Http, Response, Headers } from '@angular/http';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { SchoolModel } from '../school/school';
import { AuthHelper } from "../authHelper/authHelper";

export class Item {
    public objectType: string;
    public objectId: string;
    public displayName: string;
}

@Injectable()
export class DataService {

    constructor(
        private _http: Http,
        @Inject('auth') private authService: AuthHelper) {
    }

    getHeader(token: string) {
        let header = new Headers();
        header.append('Authorization', 'Bearer ' + token);
        return header;
    }

    getHeaderWithoutToken() {
        let header = new Headers();
        return header;
    }

    public get(actionUrl: string) {
        let activeProject: ReplaySubject<any> = new ReplaySubject(1);
        this.authService.getGraphToken(actionUrl)
            .subscribe(accessToken => {
                this._http.get(actionUrl, { headers: this.getHeader(accessToken) })
                    .subscribe((data) => {
                        activeProject.next(data);
                    },
                    (error) => {
                        activeProject.error(error);
                    });
            },
            (error) => {
                activeProject.error(error);
            });

        return activeProject;
    }

    public getObject<T>(actionUrl: string): Observable<T> {
        let activeProject: ReplaySubject<any> = new ReplaySubject(1);
        this.authService.getGraphToken(actionUrl)
            .subscribe(accessToken => {
                this._http.get(actionUrl, { headers: this.getHeader(accessToken) })
                    .subscribe(
                    data => activeProject.next(<T>data.json()),
                    error => activeProject.error(error));
            },
            error => activeProject.error(error));
        return activeProject;
    }

    public getPagedCollection<T>(actionUrl: string): Observable<PagedCollection<T>> {
        return this.getObject<PagedCollection<T>>(actionUrl);
    }

    public getArray<T>(actionUrl: string): Observable<T[]> {
        return this.getObject<any>(actionUrl)
            .map(data => {
                return <T[]>data['value'];
            });
    }

    public post(actionUrl: string, data: any) {
        return this._http.post(actionUrl, data, { headers: this.getHeaderWithoutToken() });
    }

    public getWithoutToken(actionUrl: string) {
        return this._http.get(actionUrl);
    }

    private handleError(error: Response) {
        return Observable.throw(error.json().error || 'Server error');
    }
}