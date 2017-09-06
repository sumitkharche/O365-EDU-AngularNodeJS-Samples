/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, Input } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'tab',
    templateUrl: 'tab.html'
})

export class Tab {
    @Input('tabTitle') title: string;
    @Input('tabHash') hash: string;
    @Input() active = false;
}