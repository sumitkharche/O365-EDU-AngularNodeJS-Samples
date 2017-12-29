/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import { JsonProperty } from '../utils/jsonhelper'
import { User } from './education';

export class Assignment {
    @JsonProperty("id")
    public Id: string;

    @JsonProperty("allowLateSubmissions")
    public AllowLateSubmissions: boolean;

    @JsonProperty("allowStudentsToAddResourcesToSubmission")
    public AllowStudentsToAddResourcesToSubmission: boolean;

    @JsonProperty("assignDateTime")
    public AssignDateTime: string;

    @JsonProperty("assignedDateTime")
    public AssignedDateTime: string;

    @JsonProperty("classId")
    public ClassId: string;

    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("dueDateTime")
    public DueDateTime: string;

    @JsonProperty("status")
    public Status: string;

    public Resources: ResourceContainer[] = [];
    public ResourceFiles: string;

    constructor() {
        this.Id = undefined;
        this.AllowLateSubmissions = undefined;
        this.DisplayName = undefined;
        this.AllowStudentsToAddResourcesToSubmission = undefined;
        this.AssignDateTime = undefined;
        this.AssignedDateTime = undefined;
        this.ClassId = undefined;
        this.DisplayName = undefined;
        this.DueDateTime = undefined;
        this.Status = undefined;
    }
}
export class EducationResource {
    @JsonProperty("displayName")
    public DisplayName: string;

    @JsonProperty("createdDateTime")
    public CreatedDateTime: string;

    constructor() {
        this.DisplayName = undefined;
        this.CreatedDateTime = undefined;
    }
}
export class ResourceContainer {

    @JsonProperty("distributeForStudentWork")
    public DistributeForStudentWork: boolean;

    @JsonProperty("id")
    public Id: string;

    @JsonProperty("resource")
    public Resource: EducationResource;

    constructor() {
        this.Id = undefined;
        this.DistributeForStudentWork = undefined;
        this.Resource = undefined;
    }
}




export class ResourcesFolder {
    @JsonProperty("odataid")
    public Odataid: string;

    @JsonProperty("value")
    public ResourceFolderURL: string;

    constructor() {
        this.Odataid = undefined;
        this.ResourceFolderURL = undefined;
    }
}

export class EducationSubmissionResource {
    @JsonProperty("id")
    public Id: string;

    @JsonProperty("resource")
    public Resource: EducationResource;

    constructor() {
        this.Id = undefined;
        this.Resource = undefined;
    }
}


export class SubmittedBy {
    @JsonProperty("user")
    public User: User;

    constructor() {
        this.User = undefined;
    }
}


export class Submission {
    @JsonProperty("id")
    public Id: string;

    @JsonProperty("status")
    public Status: string;

    @JsonProperty("submittedDateTime")
    public SubmittedDateTime: string;

    @JsonProperty("submittedBy")
    public SubmittedBy: SubmittedBy;

    @JsonProperty("resourcesFolderUrl")
    public ResourcesFolderUrl: string;

    public Resources: EducationSubmissionResource[] = [];

    constructor() {
        this.Id = undefined;
        this.Status = undefined;
        this.SubmittedDateTime = undefined;
        this.SubmittedBy = undefined;
        this.ResourcesFolderUrl = undefined;
    }
}