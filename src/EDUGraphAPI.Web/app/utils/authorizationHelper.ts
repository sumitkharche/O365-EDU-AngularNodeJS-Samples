/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Constants } from "../constants";

export class AuthorizationHelper {

    public static getUrl(responseType: string, redirectUrl: string, state: string, resource: string, prompt: string, nonce: string, responseMode: string = null): string {
        var url = Constants.Authority + `oauth2/authorize` +
            `?response_type=` + responseType +
            `&client_id=` + encodeURIComponent(Constants.ClientId) +
            `&redirect_uri=` + encodeURIComponent(redirectUrl) +
            `&state=` + encodeURIComponent(state) +
            `&resource=` + encodeURIComponent(resource) +
            `&nonce=` + encodeURIComponent(nonce) +
            `&prompt=` + encodeURIComponent(prompt);

        if (responseMode != null && responseMode != '')
            url += `&response_mode=` + encodeURIComponent(responseMode);

        return url;
    }

    public static generateNonce(): string {
        var text = "";
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 32; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return text;
    }
}

export class Prompt {
    public static readonly Consent = "consent";
    public static readonly Login = "login";
    public static readonly AdminConsent = "admin_consent";
}