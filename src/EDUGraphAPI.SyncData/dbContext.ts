/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import { Constants } from './constants';
import * as fs from 'fs';
import * as Sequelize from 'sequelize';
import * as Promise from "bluebird";

export interface UserAttributes {
    id?: string;
    o365UserId?: string;
    o365Email?: string;
    JobTitle?: string;
    Department?: string;
    MobilePhone?: string;
}
export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {
}
export interface UserModel extends Sequelize.Model<UserInstance, UserAttributes> { }

export interface OrganizationAttributes {
    name?: string;
    tenantId?: string;
    isAdminConsented: boolean;
    created: Date;
}
export interface OrganizationInstance extends Sequelize.Instance<OrganizationAttributes>, OrganizationAttributes {
}
export interface OrganizationModel extends Sequelize.Model<OrganizationInstance, OrganizationAttributes> { }

export interface TokenCacheAttributes {
    userId: string;
    refreshToken: string;
    accessTokens: string;
}
export interface TokenCacheInstance extends Sequelize.Instance<TokenCacheAttributes>, TokenCacheAttributes {
}
export interface TokenCacheModel extends Sequelize.Model<TokenCacheInstance, TokenCacheAttributes> { }

export interface DataSyncRecordsAttributes {
    id?: number;
    tenantId: string;
    query: string;
    deltaLink: string;
}
export interface DataSyncRecordsInstance extends Sequelize.Instance<DataSyncRecordsAttributes>, DataSyncRecordsAttributes {
}
export interface DataSyncRecordsModel extends Sequelize.Model<DataSyncRecordsInstance, DataSyncRecordsAttributes> { }

export class DbContext {
    public sequelize: Sequelize.Sequelize;
    public User: UserModel;
    public Organization: OrganizationModel;
    public TokenCache: TokenCacheModel;
    public DataSyncRecords: DataSyncRecordsModel;

    constructor() {
        this.init();
    }

    public close() {
        this.sequelize.close();
    }

    private init() {

        var dialectOptions = {};
        if(Constants.MySQLSSLCA){
            var caPem = fs.readFileSync(Constants.MySQLSSLCA);
            dialectOptions['ssl'] = {
                ca: caPem
            }
        }
        this.sequelize = new Sequelize(Constants.MySQLDbName, Constants.MySQLUser, Constants.MySQLPassword, {
            host: Constants.MySQLHost,
            port: Constants.MySQLPort,
            dialect: 'mysql',
            dialectOptions: dialectOptions,
            pool: {
                max: 5, 
                min: 0, 
                idle: 10000 
            },
            logging: false
        });

        this.User = this.sequelize.define<UserInstance, UserAttributes>('User',
            {
                id: {
                    "type": Sequelize.UUID,
                    "allowNull": false,
                    "primaryKey": true
                },
                firstName: Sequelize.STRING,
                lastName: Sequelize.STRING,
                o365UserId: Sequelize.STRING,
                o365Email: Sequelize.STRING,
                email: Sequelize.STRING,
                passwordHash: Sequelize.STRING,
                salt: Sequelize.STRING,
                favoriteColor: Sequelize.STRING,
                JobTitle: Sequelize.STRING,
                Department: Sequelize.STRING,
                MobilePhone: Sequelize.STRING
            },
            {
                timestamps: false,
                tableName: "Users"
            });

        this.Organization = this.sequelize.define<OrganizationInstance, OrganizationAttributes>('Organization',
            {
                name: Sequelize.STRING,
                tenantId: Sequelize.STRING,
                isAdminConsented: { type: Sequelize.BOOLEAN, allowNull: false },
                created: { type: Sequelize.DATE, allowNull: false }
            },
            {
                timestamps: false,
                tableName: "Organizations"
            }); 

        this.TokenCache = this.sequelize.define<TokenCacheInstance, TokenCacheAttributes>('TokenCache',
            {
                userId: Sequelize.STRING,
                refreshToken: Sequelize.TEXT,
                accessTokens: Sequelize.TEXT,
            },
            {
                timestamps: false,
                tableName: "TokenCache"
            });

        this.DataSyncRecords = this.sequelize.define<DataSyncRecordsInstance, DataSyncRecordsAttributes>('DataSyncRecords',
            {
                tenantId: Sequelize.STRING,
                query: Sequelize.STRING,
                deltaLink: Sequelize.TEXT,
            },
            {
                timestamps: false,
                tableName: "DataSyncRecords"
            });
    }
}