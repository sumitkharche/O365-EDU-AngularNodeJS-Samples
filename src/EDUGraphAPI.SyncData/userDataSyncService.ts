/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import { Constants } from './constants'
import * as auth from './authenticationHelper'
import { GraphServiceClient, User, PagedCollection } from './msGraph'
import { DbContext, DataSyncRecordsModel, OrganizationModel, OrganizationInstance, UserModel } from './dbContext'

export class UserDataSyncService {

    constructor(private dbContext: DbContext) { }

    syncAsync(): Promise<any> {
        let self = this;
        return this.dbContext.Organization.findAll({ where: { isAdminConsented: 1 } })
            .then(organizations => {
                if (organizations.length > 0) {
                    return organizations
                        .map(organization => () => self.syncOrganizationAsync(organization))
                        .reduce((p, task) => p.then(task), Promise.resolve())
                }
                else {
                    console.log('No consented organization found. This sync was canceled.');
                }
            })            
    }

    private syncOrganizationAsync(organization: OrganizationInstance): Promise<any> {
        let self = this;
        console.log(`Starting to sync users for the ${organization.name} organization.`);
        return self.getGraphServiceClient(organization.tenantId)
            .then(client => {
                return self.getOrCreateDataSyncRecord(organization.tenantId)
                    .then(record => {
                        let getUsers = record.deltaLink == null
                            ? client.getUsersDelta('$select=jobTitle,department,mobilePhone')
                            : client.getUsers(record.deltaLink)
                        console.log('\tExecuting Differential Query')
                        if (record.deltaLink == null) {
                            console.log('\tFirst time executing differential query; all items will return.')
                        }
                        return getUsers.then(collection => {
                            return self.updateUsersAndHanleRestPagesIteratively(client, collection)
                                .then(collection => {
                                    return record.updateAttributes({
                                        deltaLink: collection.DeltaLink
                                    });
                                });                           
                        });
                    })
            });
    }

    private updateUsersAndHanleRestPagesIteratively(client: GraphServiceClient, collection: PagedCollection<User>): Promise<PagedCollection<User>> {
        let self = this;
        console.log(`\tGet ${collection.Items.length} user(s).`);
        return collection.Items
            .map(user => () => self.updateOrDeleteUser(user))
            .reduce((p, task) => p.then(task), Promise.resolve()) 
            .then(() => {
                if (collection.NextLink != null) {
                    return client.getUsers(collection.NextLink)
                        .then(result => self.updateUsersAndHanleRestPagesIteratively(client, result));
                }
                else return collection;
            });
    }

    private getOrCreateDataSyncRecord(tenantId): Promise<any> {
        var self = this;
        return this.dbContext.DataSyncRecords.findOne({ where: { tenantId: tenantId } })
            .then(record => {
                if (record == null) {
                    return self.dbContext.DataSyncRecords.create({
                        deltaLink: null,
                        tenantId: tenantId,
                        query: 'users'
                    });
                }
                else {
                    return record;
                }
            });
    }

    private updateOrDeleteUser(user: User): Promise<void> {
        let self = this;
        return this.dbContext.User.findOne({ where: { o365UserId: user.Id } })
            .then(dbUser => {
                if (dbUser == null) {
                    console.log("\tSkipping updating user " + user.Id + " who does not exist in the local database.");
                    return;
                }
                if (user.Removed) {
                    console.log(`\tDeleting user and related data: ${dbUser.o365Email}`);
                    return self.dbContext.User.destroy({ where: { o365UserId: user.Id } });
                }
                console.log('\tUpdating user: ' + dbUser.o365Email)
                if (dbUser.JobTitle != user.JobTitle) {
                    console.log('\t\tJob title: ' + user.JobTitle)
                }
                if (dbUser.Department != user.Department) {
                    console.log('\t\tDepartment: ' + user.Department)
                }
                if (dbUser.MobilePhone != user.MobilePhone) {
                    console.log('\t\tMobile phone: ' + user.MobilePhone)
                }
                return dbUser.updateAttributes({
                    JobTitle: user.JobTitle,
                    Department: user.Department,
                    MobilePhone: user.MobilePhone
                })
            });
    }

    private getGraphServiceClient(tenantId): Promise<GraphServiceClient> {
        return auth.getAppOnlyAccessTokenAsync(tenantId, Constants.ClientId, Constants.MSGraphResource)
            .then(tokenResponse => {
                var accessToken = tokenResponse['accessToken'];
                return new GraphServiceClient(Constants.MSGraphResource, accessToken);
            });
    }
}