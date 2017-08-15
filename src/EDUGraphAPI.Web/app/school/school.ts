/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { JsonProperty } from '../utils/jsonhelper'

export class SchoolModel {

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId")
    public SchoolId: string;

    @JsonProperty("id")
    public ObjectId: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SchoolPrincipalName")
    public PrincipalName: string;

    @JsonProperty("description")
    public Description: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SchoolPrincipalEmail")
    public Email: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_HighestGrade")
    public HighestGrade: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_LowestGrade")
    public LowestGrade: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_SchoolNumber")
    public SchoolNumber: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_Phone")
    public Phone: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_Zip")
    public Zip: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_State")
    public State: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_City")
    public City: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_Address")
    public Address: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_AnchorId")
    public AnchorId: string;

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_StateId")
    public StateId: string;

    public IsMySchool: boolean = false;

    public get CompoundAddress(): string {
        if (!this.City && !this.State && !this.Zip) {
            return "-";
        }
        let city: string = "";
        if (this.City) {
            city = `${this.City}, `
        }
        return `${city} ${" "} ${this.State} ${this.Zip}`;
    };

    @JsonProperty("extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType")
    public EducationObjectType: string;

    constructor() {
        this.SchoolId = undefined;
        this.ObjectId = undefined;
        this.DisplayName = undefined;
        this.PrincipalName = undefined;
        this.Description = undefined;
        this.Email = undefined;
        this.HighestGrade = undefined;
        this.LowestGrade = undefined;
        this.SchoolNumber = undefined;
        this.Phone = undefined;
        this.Zip = undefined;
        this.State = undefined;
        this.City = undefined;
        this.Address = undefined;
        this.AnchorId = undefined;
        this.StateId = undefined;
        this.EducationObjectType = undefined;
    }
}