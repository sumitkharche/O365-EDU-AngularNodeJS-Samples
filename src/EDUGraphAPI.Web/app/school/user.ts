/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { JsonProperty } from '../utils/jsonhelper'

export class UserModel {

    @JsonProperty("mail")
    public Email: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType")
    public ObjectType: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_Grade")
    public EducationGrade: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId")
    public SchoolId: string;

    @JsonProperty("objectId")
    public O365UserId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_TeacherId")
    public TeacherId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_StudentId")
    public StudentId: string;

    public Photo: string;
    public IsSeated: boolean = false;
    public SeatingClass: string = "seated hideitem";
    public ContainerClass: string = "deskcontainer unsaved";
    public BackgroundColor: string = "";
    public SeatingArrangment: string = "0";
    public FavoriteColor: string = "";

    constructor() {
        this.Email = undefined;
        this.ObjectType = undefined;
        this.DisplayName = undefined;
        this.EducationGrade = undefined;
        this.SchoolId = undefined;
        this.O365UserId = undefined;
        this.TeacherId = undefined;
        this.StudentId = undefined;
        this.Photo = undefined;
        this.FavoriteColor = undefined;
    }
}

export class StudentModel extends UserModel {

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_StudentId")
    public StudentId: string;

    constructor() {
        super();
        this.StudentId = undefined;
    }
}

export class TeacherModel extends UserModel {

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_TeacherId")
    public TeacherId: string;

    constructor() {
        super();
        this.TeacherId = undefined;
    }
}