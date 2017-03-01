/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { ColorEntity } from '../models/common/colorEntity'
import { Constants } from '../constants';
import { UserInfo } from '../models/common/userInfo'

export class RegisterModel {
    public ConfirmPassword: string;
    public FavoriteColors: ColorEntity[] = Constants.FavoriteColors;
    public UserInfo: UserInfo = new UserInfo();
}