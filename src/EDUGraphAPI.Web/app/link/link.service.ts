/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Constants } from '../constants';
import { UserModel } from '../models/user';
import { AuthorizationHelper, Prompt } from '../utils/AuthorizationHelper';
import { AuthHelper } from "../authHelper/authHelper";
import { MeService } from "../services/meService";
import { UserService } from "../services/userService";

@Injectable()
export class LinkService {

    private linkUrl = 'api/link';

    constructor(
        private http: Http, @Inject('auth')
        private authService: AuthHelper,
        @Inject('me') private meService: MeService,
        @Inject('user') private userService: UserService) {
    }

    isLocalAccount() {
        return this.meService.isLocalAccount();
    }

    getCurrentUser() {
        return this.meService.getCurrentUser();
    }

    isEmpty(str: string): boolean {
        return str == undefined || str == '' || str == null;
    }

    linkLocalUser(email: string, password: string) {
        var body = {
            email: email,
            password: password
        };
        return this.http.post(this.linkUrl + "/LocalUser", body)
            .map((response: Response) => response.json());
    }

    linkMatchingLocalUser() {
        return this.http.post(this.linkUrl + "/LocalMatchingUser", null)
            .map((response: Response) => response.json());
    }

    createLocalUser(favoriteColor: string) {
        var body = {
            favoriteColor: favoriteColor
        };
        return this.http.post(this.linkUrl + "/CreateLocalUser", body)
            .map((response: Response) => response.json());
    }

    linkO365User() {
        var redirectUrl = `${window.location.protocol}//${window.location.host}/api/link/O365User`;
        var url = AuthorizationHelper.getUrl(
            'code+id_token',
            redirectUrl,
            AuthorizationHelper.generateNonce(),
            Constants.MSGraphResource,
            'login',
            AuthorizationHelper.generateNonce(),
            'form_post'
        );
        window.location.href = url;
    }

    getPostBodyWithParams(params: Object) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        let urlSearchParams = new URLSearchParams();
        for (var key in params) {
            urlSearchParams.append(key, params[key]);
        }
        let body = urlSearchParams.toString();
        return body;
    }
}