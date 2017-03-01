/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
export class GraphHelper {

    /**
     * Get the $skiptoken part from next link
     * @param nextLink
     * Reference URL: 
     */
    public static getSkipToken(nextLink: string): string {
        var regexp = new RegExp(/\$skiptoken=[^&]+/);
        var matches = nextLink.match(regexp) as Array<string>;
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return "";
    }
}