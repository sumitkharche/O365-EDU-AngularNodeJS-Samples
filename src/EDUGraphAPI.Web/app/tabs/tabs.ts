/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { Tab } from './tab';

@Component({
    moduleId: module.id,
    selector: 'tabs',
    templateUrl: 'tabs.html',
    styleUrls: ['../../app/tabs/tabs.css'],
})

export class Tabs implements AfterContentInit {

    @ContentChildren(Tab) tabs: QueryList<Tab>;

    ngAfterContentInit() {
        let locationHash = location.hash;
        if (locationHash) {
            let foundTabs = this.tabs.filter((tab) => tab.hash == locationHash);
            if (foundTabs.length > 0) {
                this.selectTab(foundTabs[0]);
                return;
            }
        }

        let activeTabs = this.tabs.filter((tab) => tab.active);
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    selectTab(tab: Tab) {
        location.hash = tab.hash;
        this.tabs.toArray().forEach(tab => tab.active = false);
        tab.active = true;

    }
}