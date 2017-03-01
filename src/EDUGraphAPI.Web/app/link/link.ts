/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { ColorEntity } from '../models/common/colorEntity'
import { Constants } from '../constants';

export class CreateLocalModel {

    public password: string;

    public confirmPassword: string;

    public favoriteColors: ColorEntity[] = Constants.FavoriteColors;

    public favoriteColor: string;
}

export class LoginLocalModel {

    public email: string;

    public password: string;
}
