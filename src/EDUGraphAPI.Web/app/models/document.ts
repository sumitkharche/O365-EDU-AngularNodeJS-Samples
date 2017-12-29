/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { JsonProperty } from '../utils/jsonhelper'

export class Document {
    @JsonProperty("name")
    public Name: string;

    @JsonProperty("webUrl")
    public webUrl: string;

    @JsonProperty("lastModifiedDateTime")
    public lastModifiedDateTime: string;

    public LastModifiedBy: string = "";

    constructor() {
        this.Name = undefined;
        this.webUrl = undefined;
        this.lastModifiedDateTime = undefined;
        this.LastModifiedBy = "";
    }
}

export class OneDrive {

    @JsonProperty("webUrl")
    public webUrl: string;

    constructor() {
        this.webUrl = undefined;
    }
}