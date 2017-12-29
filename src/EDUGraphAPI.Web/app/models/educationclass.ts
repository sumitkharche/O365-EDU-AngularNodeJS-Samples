/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { JsonProperty } from '../utils/jsonhelper';
import { UserModel } from '../models/user';
import { EducationTerm } from './education';
import { EducationUser } from './educationuser';
import { EducationSchool } from './educationschool';

export class EducationClass {

    @JsonProperty("id")
    public Id: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("mailNickname")
    public MailNickname: string;

    @JsonProperty("period")
    public Period: string;

    @JsonProperty("classCode")
    public ClassCode: string;

    @JsonProperty("externalName")
    public ExternalName: string;

    @JsonProperty("externalId")
    public ExternalId: string;

    @JsonProperty("term")
    public Term: EducationTerm;

    public Users: EducationUser[] = [];
    public Schools: EducationSchool[] = [];

    public Students: EducationUser[] = [];
    public Teachers: EducationUser[] = [];

    //public get CombinedCourseNumber(): string {
    //    var result = this.CourseName.substring(0, 3).toUpperCase();
    //    var regexp = new RegExp(/\d+/);
    //    var dd = this.CourseNumber.match(regexp);
    //    if (dd != null) result += dd[0];
    //    return result;
    //}

    public UIHoverShowDetail: boolean = false;
    public IsMyClasses: boolean = false;

    constructor() {
        this.Id = undefined;
        this.DisplayName = undefined;
        this.MailNickname = undefined;
        this.Period = undefined;
        this.ClassCode = undefined;
        this.ExternalName = undefined;
        this.ExternalId = undefined;
        this.Term = undefined;
    }
}