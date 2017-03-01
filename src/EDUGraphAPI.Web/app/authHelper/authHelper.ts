/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Injectable, Inject } from "@angular/core";
import { Constants } from '../constants';
import { Cookie } from '../services/cookieService';
import { Http, Headers, Response } from '@angular/http';
import { MapUtils, JsonProperty } from '../utils/jsonhelper'
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs/Rx';

@Injectable()
export class AuthHelper {

    constructor(
        private router: Router,
        private _http: Http) {
    }

    public IsLogin(): boolean {
        var token = Cookie.get(Constants.LOGIN_TOKEN);
        return token && token != "undefined";
    }

    public reLogin() {
        Cookie.delete(Constants.LOGIN_TOKEN);
        this.router.navigate(['login']);
    }

    public getGraphToken(actionUrl: string) {
        return actionUrl.indexOf("graph.windows.net") >= 0
            ? this.getAADGraphToken()
            : this.getMSGraphToken();
    }

    public getAADGraphToken(): Observable<string> {
        return this.getToken(Constants.COOKIE_TOKEN, Constants.AADGraphResource);
    }

    public getMSGraphToken(): Observable<string> {
        return this.getToken(Constants.MS_COOKIE_TOKEN, Constants.MSGraphResource);
    }

    private getToken(tokenName: string, siteURL: string): Observable<string> {
        let cookie = Cookie.get(tokenName);
        if (cookie) {
            return Observable.of(cookie);
        } else {
            var token = this.getTokenFromServer("/api/me/accessToken?resource=" + encodeURIComponent(siteURL) + "&t=" + new Date().getTime());
            token.subscribe((result) => {
                Cookie.set(tokenName, result.value, new Date(new Date(result.expiresOn).valueOf() - 5 * 60 * 1000));
            });
            return token.map(result => result.value);
        }
    }

    private getTokenFromServer(actionUrl: string): Observable<any> {
        let activeProject: ReplaySubject<any> = new ReplaySubject(1);
        this._http.get(actionUrl, { headers: new Headers() })
            .map((response: Response) => <string>response.json())
            .subscribe((resp) => {
                activeProject.next(resp);
            },
            (error) => {
                if (!this.IsLogin()) {
                    this.router.navigate(['login']);
                }
                else {
                    window.location.href = "/link/login-o365-required";
                }
                activeProject.complete();
            });
        return activeProject;
    }

    login() {
        window.location.href = "/o365login";
    }
}