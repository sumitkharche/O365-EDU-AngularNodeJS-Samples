/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
export class Constants {

    public static readonly Host: string = process.env.WEBSITE_HOSTNAME as string;

    public static readonly ClientId: string = process.env.clientId as string;
    public static readonly ClientSecret: string = process.env.clientSecret as string;

    public static readonly AADInstance: string = "https://login.microsoftonline.com/";
    public static readonly Authority: string = Constants.AADInstance + "common/";
    public static readonly IdentityMetadata: string = Constants.Authority + '.well-known/openid-configuration';

    public static readonly MSGraphResource: string = "https://graph.microsoft.com";
    public static readonly AADGraphResource: string = "https://graph.windows.net";

    public static readonly SourceCodeRepositoryUrl: string = process.env.sourceCodeRepositoryUrl as string;

    public static readonly AADCompanyAdminRoleName: string = "Company Administrator";

    //Required, must be 'code', 'code id_token', 'id_token code' or 'id_token' 
    public static readonly ResponseType: string = 'code';

    // Required
    public static readonly ResponseMode: string = 'form_post';

    // Required, the reply URL registered in AAD for your app
    public static readonly RedirectUrl: string = '/auth/openid/return';

    // Required if we use http for redirectUrl
    public static readonly AllowHttpForRedirectUrl: boolean = true;

    // Required  to set to false if you don't want to validate issuer
    public static readonly ValidateIssuer: boolean = false;

    // Required to set to true if the `verify` function has 'req' as the first parameter
    public static readonly PassReqToCallback: boolean = true;

    // Optional, 'error', 'warn' or 'info'
    public static readonly LoggingLevel: string = 'info';

    // Optional. The lifetime of nonce in session, the default value is 3600 (seconds).
    public static readonly NonceLifetime: number = null;

    // The url you need to go to destroy the session with AAD
    public static readonly DestroySessionUrl: string = Constants.Authority + 'oauth2/logout?post_logout_redirect_uri=';

    public static readonly  UsernameCookie = "O365CookieUsername";
    public static readonly  EmailCookie = "O365CookieEmail";


    //SQL config 
    public static readonly SQLiteDB: string = process.env.SQLiteDB as string;

}

export class O365ProductLicenses {
    /// <summary>
    /// Microsoft Classroom Preview
    /// </summary>
    public static readonly Classroom: string = "80f12768-d8d9-4e93-99a8-fa2464374d34";
    /// <summary>
    /// Office 365 Education for faculty
    /// </summary>
    public static readonly Faculty: string = "94763226-9b3c-4e75-a931-5c89701abe66";
    /// <summary>
    /// Office 365 Education for students
    /// </summary>
    public static readonly Student: string = "314c4481-f395-4525-be8b-2ec4bb1e9d91";
    /// <summary>
    /// Office 365 Education for faculty
    /// </summary>
    public static readonly FacultyPro: string = "78e66a63-337a-4a9a-8959-41c6654dfb56";
    /// <summary>
    /// Office 365 Education for students
    /// </summary>
    public static readonly StudentPro: string = "e82ae690-a2d5-4d76-8d30-7c6e01e6022e";
}

export class Roles {
    public static readonly Admin: string = "Admin";
    public static readonly Faculty: string = "Faculty";
    public static readonly Student: string = "Student";
}