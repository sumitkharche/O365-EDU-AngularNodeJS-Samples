/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { JsonProperty } from '../utils/jsonhelper';
import {  PhysicalAddress } from './education';

export class EducationSchool{

    @JsonProperty("id")
    public Id: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("principalName")
    public PrincipalName: string;

    @JsonProperty("externalId")
    public ExternalId: string;

    @JsonProperty("highestGrade")
    public HighestGrade: string;

    @JsonProperty("lowestGrade")
    public LowestGrade: string;

    @JsonProperty("schoolNumber")
    public SchoolNumber: string;

    @JsonProperty("address")
    public Address: PhysicalAddress;

    public IsMySchool: boolean = false;

    public get CompoundAddress(): string {
        if (!this.Address.State && !this.Address.PostalCode && !this.Address.City) {
            return "-";
        }
        let city: string = "";
        if (this.Address.City) {
            city = `${this.Address.City}, `
        }
        return `${city} ${" "} ${this.Address.State ? this.Address.State : "No State"} ${this.Address.PostalCode ? this.Address.PostalCode :"No postal code"}`;
    };


    constructor() {
        this.Id = undefined;
        this.DisplayName = undefined;
        this.PrincipalName = undefined;
        this.ExternalId = undefined;
        this.HighestGrade = undefined;
        this.LowestGrade = undefined;
        this.SchoolNumber = undefined;
        this.Address = undefined;
    }
}