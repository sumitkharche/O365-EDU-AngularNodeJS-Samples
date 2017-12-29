/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import { JsonProperty } from '../utils/jsonhelper'

export class User {

    @JsonProperty("id")
    public Id: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("givenName")
    public GivenName: string;

    @JsonProperty("surname")
    public Surname: string;

    constructor() {
        this.Id = undefined;
        this.DisplayName = undefined;
        this.GivenName = undefined;
        this.Surname = undefined;
    }
}

export enum EducationRole {
    Student = "student",
    Teacher = "teacher",
    enum_sentinel = 2
}

export enum PhysicalAddressType {
    Unknown = 0,
    Home = 1,
    Business = 2,
    Other = 3
}

export class PhysicalAddress {

    @JsonProperty("type")
    public Type: PhysicalAddressType;

    @JsonProperty("postOfficeBox")
    public PostOfficeBox: string;

    @JsonProperty("street")
    public Street: string;

    @JsonProperty("state")
    public State: string;

    @JsonProperty("city")
    public City: string;

    @JsonProperty("countryOrRegion")
    public CountryOrRegion: string;

    @JsonProperty("postalCode")
    public PostalCode: string;

    constructor() {
        this.Type = undefined;
        this.PostOfficeBox = undefined;
        this.Street = undefined;
        this.State = undefined;
        this.City = undefined;
        this.CountryOrRegion = undefined;
        this.PostalCode = undefined;
    }
}

export class EducationTerm
{
    @JsonProperty("startDate")
    public StartDate: string;

    @JsonProperty("endDate")
    public EndDate: string;

    @JsonProperty("externalId")
    public ExternalId: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    constructor() {
        this.StartDate = undefined;
        this.EndDate = undefined;
        this.ExternalId = undefined;
        this.DisplayName = undefined;
    }

}


export enum EducationGender {
    Female = 0,
    Male = 1,
    Other = 2,
    enum_sentinel = 3
}

export class EducationStudent {
    @JsonProperty("graduationYear")
    public GraduationYear: string;

    @JsonProperty("grade")
    public Grade: string;

    @JsonProperty("birthDate")
    public BirthDate: string;

    @JsonProperty("gender")
    public Gender: EducationGender;

    @JsonProperty("externalId")
    public ExternalId: string;

    @JsonProperty("studentNumber")
    public StudentNumber: string;

    constructor() {
        this.GraduationYear = undefined;
        this.Grade = undefined;
        this.BirthDate = undefined;
        this.Gender = undefined;
        this.ExternalId = undefined;
        this.StudentNumber = undefined;
    }
}

export class EducationTeacher {
    @JsonProperty("externalId")
    public ExternalId: string;

    @JsonProperty("teacherNumber")
    public TeacherNumber: string;
}