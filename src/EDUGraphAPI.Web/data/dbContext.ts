/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import * as Sequelize from 'sequelize';
import * as Promise from "bluebird";
import { Constants } from '../constants';

export interface UserAttributes {
    id?: string;
    firstName?: string;
    lastName?: string;
    o365UserId?: string;
    o365Email?: string;
    email?: string;
    passwordHash?: string;
    salt?: string;
    favoriteColor?: string;
}
export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {
    getOrganization: Sequelize.BelongsToGetAssociationMixin<OrganizationInstance>;
    setOrganization: Sequelize.BelongsToSetAssociationMixin<OrganizationInstance, number>;
    createOrganization: Sequelize.BelongsToCreateAssociationMixin<OrganizationAttributes>;
    getUserRoles: Sequelize.HasManyGetAssociationsMixin<UserRoleInstance>;
    createUserRole: Sequelize.HasManyCreateAssociationMixin<UserRoleAttributes>;
    removeUserRole: Sequelize.HasManyRemoveAssociationMixin<UserRoleAttributes, number>;
}
export interface UserModel extends Sequelize.Model<UserInstance, UserAttributes> { }


export interface OrganizationAttributes {
    name?: string;
    tenantId?: string;
    isAdminConsented: boolean;
    created: Date;
}
export interface OrganizationInstance extends Sequelize.Instance<OrganizationAttributes>, OrganizationAttributes {
    getUsers: Sequelize.HasManyGetAssociationsMixin<UserInstance>;
    removeUsers: Sequelize.HasManyRemoveAssociationsMixin<UserInstance, string>;
}
export interface OrganizationModel extends Sequelize.Model<OrganizationInstance, OrganizationAttributes> { }


export interface UserRoleAttributes {
    id?: number;
    name?: string;
}
export interface UserRoleInstance extends Sequelize.Instance<UserRoleAttributes>, UserRoleAttributes {
}
export interface UserRoleModel extends Sequelize.Model<UserRoleInstance, UserRoleAttributes> { }


export interface ClassroomSeatingArrangementAttributes {
    position: number;
    o365UserId?: string;
    classId?: string;
}
export interface ClassroomSeatingArrangementInstance extends Sequelize.Instance<ClassroomSeatingArrangementAttributes>, ClassroomSeatingArrangementAttributes {
}
export interface ClassroomSeatingArrangementModel extends Sequelize.Model<ClassroomSeatingArrangementInstance, ClassroomSeatingArrangementAttributes> { }


export interface TokenCacheAttributes {
    userId: string;
    refreshToken: string;
    accessTokens: string;
}
export interface TokenCacheInstance extends Sequelize.Instance<TokenCacheAttributes>, TokenCacheAttributes {
}
export interface TokenCacheModel extends Sequelize.Model<TokenCacheInstance, TokenCacheAttributes> { }

export class DbContext {
    public sequelize: Sequelize.Sequelize;
    public User: UserModel;
    public Organization: OrganizationModel;
    public UserRole: UserRoleModel;
    public ClassroomSeatingArrangement: ClassroomSeatingArrangementModel;
    public TokenCache: TokenCacheModel;

    constructor() {
        this.init();
    }

    public sync(options?: Sequelize.SyncOptions): Promise<any> {
        return this.sequelize.sync(options);
    }

    private init() {
        this.sequelize = new Sequelize("", "", "", {
            dialect: 'sqlite',
            storage: Constants.SQLiteDB
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
                favoriteColor: Sequelize.STRING
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
        this.User.belongsTo(this.Organization);
        this.Organization.hasMany(this.User);

        this.UserRole = this.sequelize.define<UserRoleInstance, UserRoleAttributes>('UserRole',
            {
                name: { type: Sequelize.STRING, allowNull: false }
            },
            {
                timestamps: false,
                tableName: "UserRoles"
            });
        this.User.hasMany(this.UserRole);

        this.ClassroomSeatingArrangement = this.sequelize.define<ClassroomSeatingArrangementInstance, ClassroomSeatingArrangementAttributes>('ClassroomSeatingArrangement',
            {
                position: { type: Sequelize.INTEGER, allowNull: false },
                o365UserId: Sequelize.STRING,
                classId: Sequelize.STRING
            },
            {
                timestamps: false,
                tableName: "ClassroomSeatingArrangements"
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
    }
}