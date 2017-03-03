/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
export class ColorEntity {

    public DisplayName: string;
    public Value: string;

    constructor(displayName: string, value: string) {
        this.DisplayName = displayName;
        this.Value = value;
    }
}