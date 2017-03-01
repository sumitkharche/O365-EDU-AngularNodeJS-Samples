/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import * as request from 'superagent';
import * as Promise from "bluebird";
import { Constants, O365ProductLicenses, Roles} from '../constants';

export class MSGraphClient {

    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    public getO365User(tenantId: string): Promise<any> {
        let o365UserInfo = {
            user: null,
            roles: [],
            organization: null
        };
       return this.getMe()
            .then((user) => {
                o365UserInfo.user = user
                return this.getRoles(user)
            })
            .then((roles) => {
                o365UserInfo.roles = roles;
                if (tenantId == null) {
                    o365UserInfo.organization = null;
                    return o365UserInfo;
                }
                return this.getOrganization(tenantId)
            })
            .then((org) => {
                o365UserInfo.organization = org;
                return o365UserInfo;
            })
    }

    public getMe(): Promise<any> {
        return new Promise((resolve, reject) => {
            request
                .get(Constants.MSGraphResource + "/v1.0/me/?$select=id,givenName,surname,userPrincipalName,assignedLicenses")
                .set('Authorization', 'Bearer ' + this.accessToken)
                .end((err, res) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(res.body);
                })
        })
    }

    public getOrganization(tenantID: string): Promise<any> {
        return new Promise((resolve, reject) => {
            request
                .get(Constants.MSGraphResource + "/v1.0/organization/" + tenantID +"?$select=id,displayName")
                .set('Authorization', 'Bearer ' + this.accessToken)
                .end((err, res) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(res.body);
                })
        });
    }

    private getDirectoryAdminRole(): Promise<any> {
        return new Promise((resolve, reject) => {
            request
                .get(Constants.MSGraphResource + "/v1.0/directoryRoles/" + "?$expand=members")
                .set('Authorization', 'Bearer ' + this.accessToken)
                .end((err, res) => {
                    if (err) {
                        return reject(err)
                    }
                    let directoryRole = res.body.value as Array<any>;
                    resolve(directoryRole.find(dr =>  dr.displayName == Constants.AADCompanyAdminRoleName ));
                })
        })
    }

    private getRoles(user: any): Promise<string[]> {
        let roles: string[] = [];
        return this.getDirectoryAdminRole()
            .then((directoryAdminRole) => {
                if (directoryAdminRole.members.findIndex(i => i.id == user.id) != -1) {
                    roles.push(Roles.Admin);
                }
                if (user.assignedLicenses.findIndex(i => i.skuId == O365ProductLicenses.Faculty || i.skuId == O365ProductLicenses.FacultyPro) != -1)
                    roles.push(Roles.Faculty);
                if (user.assignedLicenses.findIndex(i => i.skuId == O365ProductLicenses.Student || i.skuId == O365ProductLicenses.StudentPro) != -1)
                    roles.push(Roles.Student);
                return roles;
            })
    }
}