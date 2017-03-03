/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

import { Injectable, Inject } from '@angular/core';
import { Constants } from '../constants';
import { ConvertHelper } from '../utils/convertHelper';
import { AuthHelper } from "../authHelper/authHelper";

@Injectable()
export class UserPhotoService {

    constructor(
        @Inject('auth') private authService: AuthHelper) {
    }

    public getUserPhotoUrl(userId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.authService.getMSGraphToken()
                .subscribe(accessToken => {
                    var url = `${Constants.MSGraphResource}/v1.0/${Constants.TenantId}/users/${userId}/photo/$value`;
                    return $.ajax({
                        url: url,
                        type: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                            "If-None-Match": ""
                        },
                        mimeType: "text/plain; charset=x-user-defined",
                        success: function (data) {
                            var dataUrl = `data:image/jpeg;base64,${ConvertHelper.BinaryToBase64(data)}`;
                            resolve(dataUrl);
                        },
                        error: function (ex) {
                            resolve("app/images/header-default.jpg");
                        }
                    });
                });
        });
    }
}