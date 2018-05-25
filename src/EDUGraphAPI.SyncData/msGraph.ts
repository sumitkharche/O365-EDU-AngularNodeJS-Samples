/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import * as https from 'https'
import * as url from 'url';

export class User {

    constructor(public Id: string,
        public Department: string,
        public JobTitle: string,
        public MobilePhone: string,
        public Removed: boolean) { }
}

export class PagedCollection<T>{

    constructor(public Items: T[],
        public NextLink: string,
        public DeltaLink: string) { }
}

export class GraphServiceClient {

    constructor(private baseUrl: string, private accessToken: string) { }

    getUsersDelta(query): Promise<PagedCollection<User>> {
        let url = this.baseUrl + '/v1.0/users/delta?' + query;
        return this.getUsers(url);
    }

    getUsers(absolute_url: string): Promise<PagedCollection<User>> {
        let self = this;
        return this.httpGetJson(absolute_url)
            .then(json => {
                let users = json.value.map(self.parseUser);
                return new PagedCollection<User>(users, json["@odata.nextLink"], json["@odata.deltaLink"])
            })
    }

    private parseUser(json: any): User {
        return new User(json['id'], json['department'], json['jobTitle'], json['mobilePhone'], json["@removed"] != null)
    }

    private httpGetJson(absoluteUrl: string): Promise<any> {
        let self = this;
        return new Promise(function (resolve, reject) {
            const u = url.parse(absoluteUrl);
            const options = {
                method: 'GET',
                host: u.host,
                path: u.path,
                headers: {
                    'Authorization': 'Bearer ' + self.accessToken
                }
            };
            https.get(options, function (res) {
                var json = '';
                res.on('data', function (chunk) {
                    json += chunk;
                });
                res.on('end', function () {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        var data = JSON.parse(json);
                        resolve(data);
                    }
                    else {
                        reject('Request failed. Statue code: ' + res.statusCode);
                    }
                });
            });
        });
    }
}