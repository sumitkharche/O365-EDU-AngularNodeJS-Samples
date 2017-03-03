/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import * as uuid from "node-uuid";
import * as Promise from "bluebird";
import * as bcrypt from 'bcryptjs';
import { DbContext, UserInstance } from '../data/dbContext';
import { TokenCacheService } from '../services/TokenCacheService';
import { MSGraphClient } from "../services/msGraphClient";
import { AuthenticationHelper } from '../utils/authenticationHelper';
import { Roles } from '../constants';
import { Constants } from '../constants';

export class UserService {

    private dbContext = new DbContext();

    public creatUser(email: string, password: string, firstName: string, lastName: string, favoriteColor: string): Promise<UserInstance> {
        email = email.toLowerCase();
        return this.dbContext.User
            .findOne({ where: { email: email } })
            .then(user => {
                if (user == null) {
                    let passwordSalt = bcrypt.genSaltSync();
                    let passwordHash = password != null
                        ? bcrypt.hashSync(password, passwordSalt)
                        : null;
                    return this.dbContext.User.create(
                        {
                            id: uuid.v4(),
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            passwordHash: passwordHash,
                            salt: passwordSalt,
                            favoriteColor: favoriteColor
                        });
                }
                else
                    throw (`Email ${email} is used by others`);

            });
    }

    public validUser(email: string, password: string): Promise<any> {
        email = email.toLowerCase();
        let retUser;
        return this.dbContext.User
            .findOne({ where: { email: email } })
            .then((user) => {
                let isValid = user != null && bcrypt.hashSync(password, user.salt) == user.passwordHash;
                if (isValid) {
                    retUser = user;
                    return user;
                }
                else
                    throw 'Invalid Username or password';
            })
            .then((user: UserInstance) => {
                return user.getOrganization();
            })
            .then((organization) => {
                if (organization != null)
                    retUser.organization = {
                        tenantId: organization.tenantId,
                        name: organization.name,
                        isAdminConsented: organization.isAdminConsented
                    };

                return retUser;
            })
    }

    public validUserIsAdmin(bO365User: boolean, userId: string): Promise<boolean> {
        if (bO365User) {
            return this.dbContext.User.findOne({ where: { o365UserId: userId } })
                .then((user) => {
                    if (user != null) {
                        return this.getUserRoles(user.id)
                            .then((roles) => {
                                return (roles.findIndex(role => role == Roles.Admin) != -1)
                            })
                    }
                    else {
                        return this.getO365User(userId, null)
                            .then((o365UserInfo) => {
                                let roles = o365UserInfo.roles as Array<any>;
                                return (roles.findIndex(role => role == Roles.Admin) != -1)
                            })
                    }
                })

        }
        else {
            return this.getUserRoles(userId)
                .then((roles) => {
                    return (roles.findIndex(role => role == Roles.Admin) != -1)
                })
        }
    }

    public validUserHasSameEmail(email: string): Promise<boolean> {
        email = email.toLowerCase();
        return this.dbContext.User
            .findOne({ where: { email: email } })
            .then(user => {
                return user != null;
            });
    }

    public getUserTenantId(userId: string): Promise<string> {
        return this.getUserById(userId)
            .then((user) => {
                if (user == null) {
                    throw `User ${userId} does not existed`;
                }
                else {
                    return user.getOrganization();
                }
            })
            .then(organization => {
                if (organization == null)
                    throw `Tenant does not existed`;
                else
                    return organization.tenantId;
            })
    }

    public getIsAdminConsented(tenantId: string): Promise<boolean> {
        return this.dbContext.Organization.findOne({ where: { tenantId: tenantId } })
            .then(org => {
                if (org != null)
                    return org.isAdminConsented;
                return false;
            })
    }

    public getUserModel(where: any): Promise<any> {
        return this.dbContext.User.findOne({ where: where })
            .then(user => {
                if (user == null) {
                    return null;
                }
                var result = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    o365UserId: user.o365UserId,
                    o365Email: user.o365Email,
                    favoriteColor: user.favoriteColor,
                    organization: null,
                    roles: []
                }
                var p1 = user.getOrganization()
                    .then(organization => {
                        if (organization != null) {
                            result.organization = {
                                tenantId: organization.tenantId,
                                name: organization.name,
                                isAdminConsented: organization.isAdminConsented
                            }
                        }
                    });
                var p2 = user.getUserRoles()
                    .then(userRoles => userRoles.forEach(i => result.roles.push(i.name)));
                return Promise.all([p1, p2])
                    .then((ret) => {
                        return result;
                    })
            });
    }

    public getLinkedUsers(tenantId: string): Promise<UserInstance[]> {
        return this.dbContext.Organization.findOne({ where: { tenantId: tenantId } })
            .then(org => {
                return org["id"];
            }).then(orgId => {
                return this.dbContext.User.findAll({
                    where: {
                        $and: [
                            {
                                o365UserId: { $ne: null },
                                o365Email: { $ne: null },
                                OrganizationId: { $eq: orgId }
                            },
                            {
                                o365UserId: { $ne: '' },
                                o365Email: { $ne: '' }
                            }]
                    }
                });
            });
    }

    public updateFavoriteColor(userId: string, color: string): Promise<UserInstance> {
        return this.getUserById(userId)
            .then((u) => {
                if (u != null) {
                    u.favoriteColor = color;
                    return u.save();
                }
                else {
                    throw `User ${userId} does not existed`;
                }
            })
    }

    public unlinkUser(userId: string): Promise<UserInstance> {
        return this.getUserById(userId)
            .then(user => {
                if (user != null) {
                    user.o365UserId = null;
                    user.o365Email = null;
                    return user.save();
                }
                else
                    throw (`User ${userId} does not existed`);
            });
    }

    public getO365User(o365UserId: string, tenantId: string): Promise<any> {
        return AuthenticationHelper.getAccessToken(o365UserId, Constants.MSGraphResource)
            .then((accessToken) => {
                let msgraphClient: MSGraphClient = new MSGraphClient(accessToken.value);
                return msgraphClient.getO365User(tenantId)
            })
            .then((o365UserInfo) => {
                return this.getIsAdminConsented(o365UserInfo.organization.id).then(result => {
                    let userInfo = this.convertO365UserToLocal(o365UserInfo);
                    userInfo.organization.isAdminConsented = result;
                    return userInfo;
                });

            })
    }

    public linkLocalUser(o365User: any, localEmail: string, localPassword: string): Promise<any> {
        localEmail = localEmail.toLowerCase();
        let localUserId: string;
        return this.dbContext.User
            .findOne({ where: { email: localEmail } })
            .then(user => {
                if (user != null && bcrypt.hashSync(localPassword, user.salt) == user.passwordHash) {
                    if (user.o365UserId != null && user.o365UserId.length > 0) {
                        throw "The local account has already been linked to another Office 365 account.";
                    }
                    else {
                        localUserId = user.id;
                        return this.getO365User(o365User.oid, o365User.tid)
                    }
                }
                else {
                    throw "Invalid login attempt."
                }
            })
            .then((o365UserInfo) => {
                return this.updateUser(localUserId, o365UserInfo);
            })
    }

    public linkMatchingLocalUser(o365User: any): Promise<any> {
        o365User.upn = o365User.upn.toLowerCase()
        let localUserId: string;
        return this.dbContext.User
            .findOne({ where: { email: o365User.upn } })
            .then(user => {
                if (user == null) {
                    throw "No local user matching your Office 365 account."
                }
                else if (user.o365UserId != null && user.o365UserId.length > 0) {
                    throw "The local account has already been linked to another Office 365 account.";
                }
                else {
                    localUserId = user.id;
                    return this.getO365User(o365User.oid, o365User.tid)
                }
            })
            .then((o365UserInfo) => {
                return this.updateUser(localUserId, o365UserInfo);
            })
    }

    public linkCreateLocalUser(o365User: any, favoriteColor: string): Promise<any> {
        let localUserId: string;
        return this.creatUser(o365User.upn, null, null, null, favoriteColor).
            then((localUser) => {
                localUserId = localUser.id;
                return this.getO365User(o365User.oid, o365User._json.tid)
            })
            .then((o365UserInfo) => {
                return this.updateUser(localUserId, o365UserInfo);
            })
    }

    public linkO365User(accessToken: string, oid: string, o365email: string, localUserId: string, tenantId: string): Promise<any> {
        let updateUserInfo;
        return this.validHasO365User(oid)
            .then(bExist => {
                if (bExist) {
                    throw `Failed to link accounts. The Office 365 account  ${o365email} is already linked to another local account.`;
                }
                else {
                    return;
                }
            })
            .then(() => {
                let msgraphClient: MSGraphClient = new MSGraphClient(accessToken)
                return msgraphClient.getO365User(tenantId);
            })
            .then((o365UserInfo) => {
                updateUserInfo = this.convertO365UserToLocal(o365UserInfo);
                return this.updateUser(localUserId, updateUserInfo);
            })
    }

    public GetUserFavoriteColorByO365Email(o365Email: string): Promise<string> {
        o365Email = o365Email.toLowerCase();
        return this.dbContext.User
            .findOne({ where: { o365Email: o365Email } })
            .then(user => {
                if (user != null)
                    return user.favoriteColor;
                return "";
            });
    }

    private updateUser(userId: string, user: any): Promise<any> {
        return this.getUserById(userId).then(u => {
            let promises = new Array<Promise<any>>();

            if (user.firstName != undefined) u.firstName = user.firstName;
            if (user.lastName != undefined) u.lastName = user.lastName;
            if (user.o365UserId != undefined) u.o365UserId = user.o365UserId;
            if (user.o365Email != undefined) u.o365Email = user.o365Email.toLowerCase();
            if (user.favoriteColor != undefined) u.favoriteColor = user.favoriteColor;
            promises.push(u.save());

            if (user.organization && user.organization.tenantId) {
                this.dbContext.Organization
                    .findOne({ where: { tenantId: user.organization.tenantId } })
                    .then(organization => {
                        let p: Promise<any>;
                        if (organization == null) {
                            user.organization.created = new Date();
                            p = u.createOrganization(user.organization);
                        }
                        else
                            p = u.setOrganization(organization);
                        promises.push(p);
                    })
            }

            var newRoleNames = user.roles as string[];
            if (newRoleNames != null) {
                u.getUserRoles().then(oldRoles => {
                    newRoleNames.forEach(newRoleName => {
                        if (oldRoles.findIndex(i => i.name == newRoleName) < 0) {
                            let p = u.createUserRole({ name: newRoleName });
                            promises.push(p);
                        }
                    });
                    oldRoles.forEach(oldRole => {
                        if (newRoleNames.findIndex(i => i == oldRole.name) < 0) {
                            let p = u.removeUserRole(oldRole);
                            promises.push(p);
                        }
                    });
                });
            }

            return Promise.all(promises);
        });
    }

    private convertO365UserToLocal(o365UserInfo: any): any {
        let userInfo = {
            firstName: o365UserInfo.user.givenName,
            lastName: o365UserInfo.user.surname,
            o365UserId: o365UserInfo.user.id,
            o365Email: o365UserInfo.user.mail == null ? o365UserInfo.user.userPrincipalName : o365UserInfo.user.mail,
            organization: o365UserInfo.organization == null ? null : {
                tenantId: o365UserInfo.organization.id,
                name: o365UserInfo.organization.displayName,
                //isAdminConsented: isAdminConsented
            },
            roles: o365UserInfo.roles
        };
        return userInfo
    }

    private validHasO365User(oid: string): Promise<boolean> {
        return this.dbContext.User
            .find({ where: { o365UserId: oid } })
            .then(user => {
                return user != null;
            });
    }

    private getUserById(userId: string): Promise<UserInstance> {
        return this.dbContext.User.findById(userId);
    }

    private getUserRoles(userId: string): Promise<any> {
        return this.getUserById(userId)
            .then((user) => {
                return user.getUserRoles();
            })
            .then((roles) => {
                let retRoles = [];
                roles.forEach(i => retRoles.push(i.name));
                return retRoles;
            })
    }
}