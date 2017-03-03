/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
export class CompareHelper {

    public static createComparer(propertyName: string, desc: boolean = false): (a: any, b: any) => number {
        var propertySelector = t => t[propertyName];
        return this.createComparer2(propertySelector, desc);
    }

    private static createComparer2<T, V>(propertySelector: (t: T) => V, desc: boolean = false): (a: T, b: T) => number {
        return (a: T, b: T) => {
            let va = propertySelector(a);
            let vb = propertySelector(b);
            if (va == vb) return 0;
            var result = va > vb ? 1 : -1;
            return desc ? 0 - result : result;
        }
    }
}