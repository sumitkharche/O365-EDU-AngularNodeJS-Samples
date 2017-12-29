/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import { JsonProperty } from '../utils/jsonhelper'
import { EducationStudent, EducationTeacher } from './education'
import { EducationClass } from './educationclass'
import { EducationSchool } from './educationschool'
import { User } from './education';

export class EducationUser extends User {
    @JsonProperty("primaryRole")
    public PrimaryRole: string;

    @JsonProperty("student")
    public Student: EducationStudent;

    @JsonProperty("teacher")
    public Teacher: EducationTeacher;


    public Photo: string;
    public IsSeated: boolean = false;
    public SeatingClass: string = "seated hideitem";
    public ContainerClass: string = "deskcontainer unsaved";
    public BackgroundColor: string = "";
    public SeatingArrangment: string = "0";
    public FavoriteColor: string = "";


    public Classes: EducationClass[] = [];
    public Schools: EducationSchool[] = [];

    constructor() {
        super();
        this.PrimaryRole = undefined;
        this.Student = undefined;
        this.Teacher = undefined;

        this.Photo = undefined;
        this.FavoriteColor = undefined;

    }
}
