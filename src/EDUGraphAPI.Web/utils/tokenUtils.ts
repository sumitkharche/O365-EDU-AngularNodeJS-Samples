/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import * as request from 'superagent';
import { Constants } from '../constants';

export class TokenUtils {

    static getTokenByCode(code: string, tenantId: string, resource: string, redirectUrl: string): Promise<any> {
        return new Promise<string>((resolve, reject) => {
            var url = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token';
            var redirectUri = `https://${Constants.Host}/${redirectUrl}`
            request.post(url)
                .accept('application/json')
                .send('resource=' + encodeURI(resource))
                .send('client_id=' + Constants.ClientId)
                .send('client_secret=' + Constants.ClientSecret)
                .send('grant_type=authorization_code')
                .send('code=' + code)
                .send('redirect_uri=' + encodeURI(redirectUri))
                .end((err, res) => {
                    if (err != null) reject(err);
                    else resolve(res.body);
                });
        });
    }

    static getTokenByRefreshToken(refreshToken: string, resource: string): Promise<any> {
        return new Promise<string>((resolve, reject) => {
            var url = 'https://login.microsoftonline.com/common/oauth2/token';
            request.post(url)
                .accept('application/json')
                .send('resource=' + encodeURI(resource))
                .send('client_id=' + Constants.ClientId)
                .send('client_secret=' + Constants.ClientSecret)
                .send('grant_type=refresh_token')
                .send('refresh_token=' + refreshToken)
                .end((err, res) => {
                    if (err != null) reject(err);
                    else resolve(res.body);
                });
        });
    }
}