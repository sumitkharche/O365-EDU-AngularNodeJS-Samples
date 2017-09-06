/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Injectable, Inject } from '@angular/core';
import { DemoHelperPage } from './demoHelperPage';
import { Http, Response } from '@angular/http';
import { Cookie } from '../services/cookieService';
import { Constants } from '../constants';

@Injectable()
export class DemoHelperService {

    constructor(private http: Http) { }

    getMappedDemoPage(pages: DemoHelperPage[]) {
        let result = new DemoHelperPage();
        let component = window.location.pathname.split('/')[1];

        let sourceCodeRepositoryUrl = this.getSourceCodeRepositoryUrl();
        if (sourceCodeRepositoryUrl.slice(-1) == '/') {
            sourceCodeRepositoryUrl = sourceCodeRepositoryUrl.slice(0, -1)
        }

        let locationHash = location.hash;

        for (var i = 0; i < pages.length; i++) {
            let page = pages[i];
            if (page.component == component) {
                page.links = page.links.filter(link => (link.tab == "" || link.tab.indexOf(locationHash) >= 0));
                for (var l = 0; l < page.links.length; l++) {
                    for (var i = 0; i < page.links[l].files.length; i++) {
                        page.links[l].collapsed = false;
                        page.links[l].files[i].url = sourceCodeRepositoryUrl + page.links[l].files[i].url;
                    }
                }
                result = page;
                break;
            }
        }
        return result;
    }

    getDemoData() {
        return this.http.get('app/demoHelper/demoHelper-pages.json')
            .map((response: Response) => {
                return this.getMappedDemoPage(response.json());
            });
    }

    private getSourceCodeRepositoryUrl() {
        var domain = Cookie.get(Constants.SourceCodeRepositoryUrl);
        if (domain && domain != "undefined")
            return domain;
        else
            return '';
    }
}