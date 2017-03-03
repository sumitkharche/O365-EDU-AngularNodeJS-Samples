/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { ColorEntity } from './models/common/colorEntity'
import { Cookie } from './services/cookieService';

export class Constants {
    public static readonly ClientId = Cookie.get("AppClientId");
    public static readonly TenantId = Cookie.get("UserTenantId");
    public static readonly AADInstance = "https://login.microsoftonline.com/";
    public static readonly Authority = Constants.AADInstance + "common/";
    public static readonly TokenProcessorUrl = "https://localhost:44380/node_modules/kurvejs/dist/login.html";
    public static readonly MSGraphResource = "https://graph.microsoft.com";
    public static readonly AADGraphResource = "https://graph.windows.net";
    public static readonly BingMapKey: string = Cookie.get("AppBingMapKey");
    public static readonly FavoriteColors: ColorEntity[] = [new ColorEntity("Blue", "#2F19FF"), new ColorEntity("Green", "#127605"), new ColorEntity("Grey", "#535353")];
    public static readonly SourceCodeRepositoryUrl = "SourceCodeRepositoryUrl";
    // Cookie names
    public static readonly AuthType = "authType";
    public static readonly AADGraphAccessToken: string = "AADGraphAccessToken";
    public static readonly MSGraphAccessToken: string = "MSGraphAccessToken";
    public static readonly O365Username = "O365Username";
    public static readonly O365Email = "O365Email";
}

export class Roles {
    public static readonly Admin = "Admin";
    public static readonly Faculty = "Faculty";
    public static readonly Student = "Student";
}