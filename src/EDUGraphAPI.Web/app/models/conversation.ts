/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { JsonProperty } from '../utils/jsonhelper'

export class Conversation {

    @JsonProperty("topic")
    public topic: string;

    @JsonProperty("preview")
    public preview: string;

    @JsonProperty("id")
    public id: string;

    constructor() {
        this.topic = undefined;
        this.preview = undefined;
        this.id = undefined;
    }
}