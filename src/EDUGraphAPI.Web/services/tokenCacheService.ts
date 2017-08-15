/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { DbContext, TokenCacheInstance } from '../data/dbContext';
import * as Promise from "bluebird";
import { Constants } from '../constants';

// In this sample, tokens are cached in clear text in database. For real projects, they should be encrypted.
export class TokenCacheService {

    private dbContext = new DbContext();

    public get(userId: string): Promise<TokenCacheInstance> {
        return this.dbContext.TokenCache.findOne({ where: { userId: userId } });
    }

    public createOrUpdate(userId: string, resource: string, authResult: any): Promise<TokenCacheInstance> {
        return this.dbContext.TokenCache.findOne({ where: { userId: userId } })
            .then(tokenCache => {
                if (tokenCache == null) return this.create(userId, resource, authResult);
                else return this.update(tokenCache, resource, authResult);
            });
    }

    public update(tokenCache: TokenCacheInstance, resource: string, authResult: any): Promise<TokenCacheInstance> {
        let accessTokens = JSON.parse(tokenCache.accessTokens);
        accessTokens[resource] = {
            expiresOn: authResult.expiresOn,
            value: authResult.accessToken
        }
        tokenCache.refreshToken = authResult.refreshToken;
        tokenCache.accessTokens = JSON.stringify(accessTokens);
        return tokenCache.save();
    }

    public create(userId: string, resource: string, authResult: any): Promise<TokenCacheInstance> {
        let accessTokens = {};
        accessTokens[resource] = {
            expiresOn: authResult.expiresOn,
            value: authResult.accessToken
        };
        return this.dbContext.TokenCache.create({
            userId: userId,
            refreshToken: authResult.refreshToken,
            accessTokens: JSON.stringify(accessTokens)
        })
    }

    public clearUserTokenCache(): Promise<any> {
        return this.dbContext.TokenCache.all()
            .then(caches => {
                let promises = new Array<Promise<any>>();
                caches.forEach(cach => {
                    promises.push(cach.destroy());
                })
                return Promise.all(promises);
            });
    }
}