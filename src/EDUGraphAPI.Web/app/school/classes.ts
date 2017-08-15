/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { JsonProperty } from '../utils/jsonhelper'
import { UserModel } from './user'

export class ClassesModel {

    @JsonProperty("id")
    public ObjectId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType")
    public EducationObjectType: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("mail")
    public Email: string;

    @JsonProperty("securityEnabled")
    public SecurityEnabled: boolean;

    @JsonProperty("mailNickname")
    public MailNickname: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_Period")
    public Period: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_CourseNumber")
    public CourseNumber: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_CourseDescription")
    public CourseDescription: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_CourseName")
    public CourseName: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_CourseId")
    public CourseId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_TermStartDate")
    public TermStartDate: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_TermEndDate")
    public TermEndDate: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_TermName")
    public TermName: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_TermId")
    public TermId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SectionNumber")
    public SectionNumber: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SectionName")
    public SectionName: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SectionId")
    public SectionId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId")
    public SchoolId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource")
    public SyncSource: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_AnchorId")
    public AnchorId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_Status")
    public EducationStatus: string;

    @JsonProperty("members@odata.navigationLinkUrl")
    public MemberLink: string;

    public Users: UserModel[] = [];
    public Students: UserModel[] = [];
    public Teachers: UserModel[] = [];

    public get CombinedCourseNumber(): string {
        var result = this.CourseName.substring(0, 3).toUpperCase();
        var regexp = new RegExp(/\d+/);
        var dd = this.CourseNumber.match(regexp);
        if (dd != null) result += dd[0];
        return result;
    }

    public UIHoverShowDetail: boolean = false;
    public IsMyClasses: boolean = false;
    constructor() {
        this.DisplayName = undefined;
        this.ObjectId = undefined;
        this.EducationObjectType = undefined;
        this.Email = undefined;
        this.SecurityEnabled = undefined;
        this.MailNickname = undefined;
        this.Period = undefined;
        this.CourseNumber = undefined;
        this.CourseDescription = undefined;
        this.CourseName = undefined;
        this.CourseId = undefined;
        this.TermStartDate = undefined;
        this.TermEndDate = undefined;
        this.TermName = undefined;
        this.TermId = undefined;
        this.SectionNumber = undefined;
        this.SectionName = undefined;
        this.SectionId = undefined;
        this.SchoolId = undefined;
        this.SyncSource = undefined;
        this.AnchorId = undefined;
        this.EducationStatus = undefined;
        this.MemberLink = undefined;
    }
}