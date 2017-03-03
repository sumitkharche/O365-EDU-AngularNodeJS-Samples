/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import 'reflect-metadata';

const jsonMetadataKey = "jsonProperty";

export interface IJsonMetaData {
    name?: string
}

export function JsonProperty(metadata: string): any {
    return Reflect.metadata(jsonMetadataKey, <IJsonMetaData>{
        name: metadata
    });
}

export class MapUtils {

    static isPrimitive(obj) {
        switch (typeof obj) {
            case "string":
            case "number":
            case "boolean":
                return true;
        }
        return !!(obj instanceof String || obj === String ||
            obj instanceof Number || obj === Number ||
            obj instanceof Boolean || obj === Boolean);
    }

    static getClazz(target: any, propertyKey: string): any {
        return Reflect.getMetadata("design:type", target, propertyKey)
    }

    static getJsonProperty<T>(target: any, propertyKey: string): IJsonMetaData {
        return Reflect.getMetadata(jsonMetadataKey, target, propertyKey);
    }

    static deserialize<T>(clazz: { new (): T }, jsonObject) {
        if ((clazz === undefined) || (jsonObject === undefined)) return undefined;
        let obj = new clazz();
        Object.keys(obj).forEach((key) => {
            let propertyMetadataFn: (IJsonMetaData) => any = (propertyMetadata) => {
                let propertyName = propertyMetadata.name || key;
                let innerJson = undefined;
                innerJson = jsonObject ? jsonObject[propertyName] : undefined;
                let clazz = MapUtils.getClazz(obj, key);
                if (!MapUtils.isPrimitive(clazz)) {
                    return MapUtils.deserialize(clazz, innerJson);
                } else {
                    return jsonObject ? jsonObject[propertyName] : undefined;
                }
            };

            let propertyMetadata: IJsonMetaData = MapUtils.getJsonProperty(obj, key);
            if (propertyMetadata) {
                obj[key] = propertyMetadataFn(propertyMetadata);
            } else {
                if (jsonObject && jsonObject[key] !== undefined) {
                    obj[key] = jsonObject[key];
                }
            }
        });
        return obj;
    }
}