/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import { Constants } from './constants'
import { X509Certificate } from './X509Certificate'
import { AuthenticationContext, TokenResponse, ErrorResponse } from 'adal-node';

const x509Cert = new X509Certificate(Constants.ClientCertPath, Constants.ClientCertPassword);
const certificate = x509Cert.getPrivateKey();
const thumbprint = x509Cert.getThumbprint();

export function getAppOnlyAccessTokenAsync(tenantId: string, clientId: string, resource: string): Promise<TokenResponse | ErrorResponse> {

    var authorityUrl = Constants.AadInstance + tenantId;
    var context = new AuthenticationContext(authorityUrl);

    return new Promise(function (resolve, reject) {
        context.acquireTokenWithClientCertificate(resource, clientId, certificate, thumbprint, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
}