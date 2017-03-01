import { Constants } from '../constants';
import { DbContext, TokenCacheInstance, TokenCacheAttributes } from '../data/dbContext';
import { TokenCacheService } from '../services/TokenCacheService';
import * as Promise from "bluebird";

var AuthenticationContext = require('adal-node').AuthenticationContext;

export class AuthenticationHelper {

    static getAccessTokenByCode(userId: string, code: string, resource: string, redirectUrl: string): Promise<any> {
        return this.getTokenWithAuthorizationCode(code, resource, redirectUrl)
            .then(authResult => {
                var tokenCacheService = new TokenCacheService();
                return tokenCacheService.createOrUpdate(userId, resource, authResult)
                    .thenReturn(authResult);
            });
    }

    static getAccessToken(userId: string, resource: string): Promise<any> {
        return this.getTokenCore(userId, resource)
    }

    private static getTokenCore(userId: string, resource: string): Promise<any> {
        var tokenCacheService = new TokenCacheService();
        return tokenCacheService.get(userId).then(tokenCache => {
            if (tokenCache != null) {
                var accessTokens = JSON.parse(tokenCache.accessTokens);
                var accessToken = accessTokens[resource];
                if (accessToken == undefined || new Date(accessToken.expiresOn).valueOf() < (Date.now() + 60 * 5 * 1000)) {
                    return this.getTokenWithRefreshToken(tokenCache.refreshToken, resource)
                        .then(result => {
                            return tokenCacheService.update(tokenCache, resource, result)
                        })
                        .then(tokenCache => {
                            return JSON.parse(tokenCache.accessTokens)[resource]
                        });
                }
                else
                    return accessToken;
            }
            else {
                throw "Could not get access token as there is no refresh token. Re-login is required.";
            }
        });
    }

    private static getTokenWithAuthorizationCode(code: string, resouce: string, redirectUrl: string): Promise<any> {
        var redirectUri = `https://${Constants.Host}/${redirectUrl}`;
        return new Promise((resolve, reject) => {
            var authenticationContext = new AuthenticationContext(Constants.Authority);
            authenticationContext.acquireTokenWithAuthorizationCode(
                code,
                redirectUri,
                resouce,
                Constants.ClientId,
                Constants.ClientSecret,
                function (err, response) {
                    if (err) reject(err.message);
                    else resolve(response);
                }
            );
        });
    }

    private static getTokenWithRefreshToken(refreshToken: string, resource: string): Promise<any> {
        return new Promise((resolve, reject) => {
            var authenticationContext = new AuthenticationContext(Constants.Authority);
            authenticationContext.acquireTokenWithRefreshToken(
                refreshToken,
                Constants.ClientId,
                Constants.ClientSecret,
                resource,
                function (err, response) {
                    if (err) reject(err.message);
                    else resolve(response);
                }
            );
        });
    }
}