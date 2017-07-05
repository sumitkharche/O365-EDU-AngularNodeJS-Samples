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
      
    // Cookie names
    public static readonly O365Username = "O365Username";
    public static readonly O365Email = "O365Email";

    // Database 
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