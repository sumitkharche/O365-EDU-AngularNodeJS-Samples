/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { ColorEntity } from '../models/common/colorEntity'

export class AboutMeModel {

    public UserName: string;

    public IsLinked: boolean;

    public MyFavoriteColor: string;

    public FavoriteColors: ColorEntity[];

    public Groups: string[];

    public ShowFavoriteColor: boolean;

    public SaveSucceeded: boolean = false;

    public UserRole: string;

    constructor() {
        this.UserName = undefined;
        this.IsLinked = undefined;
        this.MyFavoriteColor = undefined;
        this.FavoriteColors = undefined;
        this.Groups = undefined;
        this.ShowFavoriteColor = undefined;
        this.UserRole = undefined;
    }
}