/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Organization } from './organization';
export class UserInfo {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    o365UserId: string;
    o365Email: string;
    favoriteColor: string;
    organization: Organization;
    roles: string[];
    remember: boolean;

    public areAccountsLinked(): boolean {
        return this.o365UserId != undefined && this.o365UserId != null && this.o365UserId != '';
    }

    public readFromJson(user: any) {
        if (user.id != undefined) this.id = user.id;
        if (user.email != undefined) this.email = user.email;
        if (user.password != undefined) this.password = user.password;
        if (user.firstName != undefined) this.firstName = user.firstName;
        if (user.lastName != undefined) this.lastName = user.lastName;
        if (user.o365UserId != undefined) this.o365UserId = user.o365UserId;
        if (user.o365Email != undefined) this.o365Email = user.o365Email
        if (user.favoriteColor != undefined) this.favoriteColor = user.favoriteColor;
    }
}