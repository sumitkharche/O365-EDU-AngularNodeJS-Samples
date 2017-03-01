/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { SchoolModel } from '../school/school';
import { UserModel } from '../school/user';
import { AuthorizationHelper, Prompt } from '../utils/AuthorizationHelper';
import { Constants } from '../constants';
import { GraphHelper } from '../utils/graphHelper'
import { Roles } from '../constants';
import { AuthHelper } from "../authHelper/authHelper";
import { UserService } from "../services/userService";
import { DataService } from "../services/dataService";

@Injectable()
export class AdminService {

    private getMeUrl = Constants.AADGraphResource + '/' + Constants.TenantId + "/me?api-version=1.5";
    private getAdminUrl = '/api/me';
    private aadBaseUrl = Constants.AADGraphResource + '/' + Constants.TenantId;

    constructor(
        private _http: Http,
        @Inject('auth') private authService: AuthHelper,
        @Inject('user') private userService: UserService,
        @Inject('data') private dataService: DataService) {
    }

    getAdmin(): any {
        return this.dataService.get(this.getAdminUrl)
            .map((response: Response) => <any>response.json());
    }

    getMe(): any {
        return this.dataService.get(this.getMeUrl)
            .map((response: Response) => <UserModel>response.json());
    }

    isAdmin(result): boolean {
        if (!result || !result.roles || result.roles == 'undefined' || result.roles.length == 0) {
            return false;
        }
        else {
            for (var i = 0; i < result.roles.length; i++) {
                if (result.roles[i] == Roles.Admin)
                    return true;
            }
            return false;
        }
    }

    consent() {
        var redirectUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        var url = AuthorizationHelper.getUrl(
            'id_token',
            redirectUrl,
            AuthorizationHelper.generateNonce(),
            Constants.MSGraphResource,
            Prompt.AdminConsent,
            AuthorizationHelper.generateNonce());
        window.location.href = url;
    }

    setIsAdminConsented(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.post("api/tenant", { "isAdminConsented": true })
                .subscribe((response: Response) => {
                    resolve(response.ok);
                },
                (error) => reject(error));
        });
    }

    unconsent(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.getAADGraphToken()
                .then((accessToken) => {
                    let headers = new Headers();
                    headers.append('Authorization', 'Bearer ' + accessToken);
                    const authHeaders = { headers: headers };
                    this.getServicePrincipal(authHeaders).then((servicePrincipal) => {
                        if (servicePrincipal) {
                            this.deleteServicePrincipal(authHeaders, servicePrincipal.objectId).then((result) => {
                                this.cleanUpTanent().then(() => resolve(true)).catch(() => reject(false));
                            }).catch(() => reject(false));
                        }
                        else {
                            this.cleanUpTanent().then(() => resolve(true)).catch(() => reject(false));
                        }
                    })
                        .catch(() => reject(false));
                })
                .catch(() => reject(false));
        });
    }

    getLinkedAccounts(): Observable<any> {
        return this.userService.getLinkedAccounts();
    }

    unlinkAccount(accountId): Observable<any> {
        return this.userService.unlinkAccount(accountId);
    }

    addAppRoleAssignments(): Promise<any> {
        const errorMessage = "Enabling user access failed.";
        return new Promise((resolve, reject) => {
            this.getAADGraphToken()
                .then((accessToken) => {
                    let headers = new Headers();
                    headers.append('Authorization', 'Bearer ' + accessToken);
                    const authHeaders = { headers: headers };
                    this.getServicePrincipal(authHeaders).then((servicePrincipal) => {
                        if (!servicePrincipal) {
                            reject("Could not found the service principal. Please provdie the admin consent.");
                        }
                        else {
                            this.addAppRoleAssignmentForUsers(authHeaders, null, servicePrincipal, new Array<Promise<any>>()).then((count) => {
                                const message = count == -1 ? "There're no users in your tanent." : (count > 0 ? `User access was successfully enabled for ${count} users.` : "User access was enabled for all users.");
                                resolve(message);
                            }).catch(() => reject(errorMessage));
                        }
                    })
                        .catch(() => reject(errorMessage));
                })
                .catch(() => reject(errorMessage));
        });
    }

    private getAADGraphToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.authService.getAADGraphToken().subscribe(
                accessToken => resolve(accessToken),
                error => reject(error))
        });
    }

    private getServicePrincipal(authHeaders: RequestOptionsArgs): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.get(`${this.aadBaseUrl}/servicePrincipals?api-version=1.6&$filter=appId%20eq%20'${Constants.ClientId}'`, authHeaders)
                .subscribe((response: Response) => {
                    if (response) {
                        var data = response.json();
                        if (data && (data.value instanceof Array) && data.value.length > 0) {
                            resolve(data.value[0]);
                            return;
                        }
                    }
                    resolve(null);
                },
                (error) => reject(error));
        });
    }

    private addAppRoleAssignmentForUsers(authHeaders: RequestOptionsArgs, nextLink: string, servicePrincipal: any, prevPromises: Promise<any>[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.addAppRoleAssignmentForUsers2(authHeaders, nextLink, servicePrincipal, prevPromises, resolve, reject);
        });
    }

    private addAppRoleAssignmentForUsers2(authHeaders: RequestOptionsArgs, nextLink: string, servicePrincipal: any, prevPromises: Promise<any>[], resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) {
        let url: string = `${this.aadBaseUrl}/users?api-version=1.6&$expand=appRoleAssignments`;
        if (nextLink) {
            url += "&" + GraphHelper.getSkipToken(nextLink);
        }
        this._http.get(url, authHeaders)
            .subscribe((response: Response) => {
                const data = response.json();
                if (data) {
                    if (!prevPromises) {
                        prevPromises = new Array<Promise<any>>();
                    }
                    if (data.value instanceof Array) {
                        const users = data.value;
                        users.forEach((user) => {
                            prevPromises.push(this.addAppRoleAssignment(authHeaders, user, servicePrincipal, null));
                        });
                    }

                    var nextLink2 = data["odata.nextLink"];
                    if (!nextLink2) {
                        if (prevPromises.length == 0) {
                            resolve(-1);
                        }
                        else {
                            Promise.all(prevPromises).then((results) => {
                                const count = results.reduce((a: number, b: any) => {
                                    return a + (b ? 1 : 0);
                                }, 0);
                                resolve(count);
                            }).catch((errors) => reject(errors));
                        }
                    }
                    else {
                        this.addAppRoleAssignmentForUsers2(authHeaders, nextLink2, servicePrincipal, prevPromises, resolve, reject);
                    }
                }
                else {
                    resolve(0);
                }
            },
            (error) => reject(error));
    }

    private doAddAppRoleAssignment(user: any, servicePrincipal: any, authHeaders: RequestOptionsArgs, resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) {
        const userId = user.objectId;
        const body = {
            "odata.type": "Microsoft.DirectoryServices.AppRoleAssignment",
            "creationTimestamp": new Date().toISOString(),
            "principalDisplayName": user.displayName,
            "principalId": user.objectId,
            "principalType": "User",
            "resourceId": servicePrincipal.objectId,
            "resourceDisplayName": servicePrincipal.displayName
        };
        this._http.post(`${this.aadBaseUrl}/users/${user.objectId}/appRoleAssignments?api-version=1.6`, body, authHeaders)
            .subscribe((response: Response) => {
                resolve(response.json());
            },
            (error) => reject(error));
    }

    private addAppRoleAssignment(authHeaders: RequestOptionsArgs, user: any, servicePrincipal: any, nextLink: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const userId: string = user.objectId;
            const servicePrincipalId = servicePrincipal.objectId;
            if (!user.appRoleAssignments.some((ass) => ass.resourceId === servicePrincipalId)) {
                if (!user.appRoleAssignments["odata.nextLink"]) {
                    this.doAddAppRoleAssignment(user, servicePrincipal, authHeaders, resolve, reject);
                }
                else {
                    this._http.get(`${this.aadBaseUrl}/users/${user.objectId}/appRoleAssignments?api-version=1.6&$filter=resourceId%20eq%20guid'${servicePrincipalId}'`, authHeaders)
                        .subscribe((response: Response) => {
                            const data = response.json();
                            if (!data.value.some((ass) => ass.resourceId === servicePrincipal.objectId)) {
                                this.doAddAppRoleAssignment(user, servicePrincipal, authHeaders, resolve, reject);
                            }
                        },
                        (error) => reject(error));
                }
            }
            else {
                resolve(null);
            }
        });
    }

    private deleteServicePrincipal(authHeaders: RequestOptionsArgs, servicePrincipalId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.delete(`${this.aadBaseUrl}/servicePrincipals/${servicePrincipalId}?api-version=1.6`, authHeaders)
                .subscribe((response: Response) => {
                    resolve(response.ok);
                },
                (error) => reject(error));
        });
    }

    private cleanUpTanent(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.post("api/tenant", { "isAdminConsented": false })
                .subscribe((response: Response) => {
                    this._http.post("api/tenant/unlinkAllUsers", {})
                        .subscribe((response: Response) => {
                            resolve(response.ok);
                        },
                        (error) => reject(error));
                },
                (error) => reject(error));
        });
    }
}