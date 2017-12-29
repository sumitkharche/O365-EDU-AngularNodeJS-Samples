/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { GraphHelper } from '../utils/graphHelper'
import { Constants } from '../constants'
import { DataService } from '../services/dataService'
import { AuthHelper } from "../authHelper/authHelper"
import { PagedCollection } from '../models/common/pagedCollection'
import { UserModel } from '../models/user'
import { Document, OneDrive } from '../models/document'
import { Conversation } from '../models/conversation'
import { SeatingArrangement } from '../models/seatingarrangements'
import { FileUploader, FileItem } from 'ng2-file-upload'
import { Assignment } from '../models/assignment';

@Injectable()
export class SchoolService {

    private files = [];
    private urlBase: string = Constants.MSGraphResource + '/beta';

    constructor(
        private http: Http,
        @Inject('auth') private authService: AuthHelper,
        @Inject('data') private dataService: DataService) {
    }

    /**
     * Retrieves all schools
     * Reference URL: https://msdn.microsoft.com/office/office365/api/school-rest-operations#get-all-schools
     */
    getSchools(): Observable<any[]> {
        return this.dataService.getArray<any>(this.urlBase + "/education/schools");
    }

    /**
	 * Retrieves a school by id
     * @param  {string} id Identification of the school
     * Reference URL: https://msdn.microsoft.com/office/office365/api/school-rest-operations#get-a-school.
	 */
    getSchoolById(id: string): Observable<any> {
        return this.dataService.getObject(this.urlBase + '/education/schools/' + id );
    }
    /**
     * Retrieves classes of a school
     * @param  {string} schoolId Identification of the school
     * @param  {string} nextLink next link in the previous response for next page
     * Reference URL: https://msdn.microsoft.com/office/office365/api/school-rest-operations#get-sections-within-a-school.
     */
    getClasses(schoolId: string, nextLink: string): Observable<PagedCollection<any>> {
        let url: string = `${this.urlBase}/education/schools/${schoolId}/classes?$top=12` +
            (nextLink ? "&" + GraphHelper.getSkipToken(nextLink) : '');
        return this.dataService.getPagedCollection<any>(url);
    }
    /**
     * Get current user's information
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/teacher-rest-operations
     */
    getMe(): Observable<any> {
        return this.dataService.getObject<any>(this.urlBase + "/me");
    }

    getJoinableUser(): Observable<any> {
        return this.dataService.getObject<any>(this.urlBase + '/education/me?$expand=schools,classes');
    }

    /**
     * Get current user's classes
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/section-rest-operations
     */
    getMyClasses(): Observable<any[]> {
        return this.dataService.getArray<any>(this.urlBase + "/education/me/classes");
    }

    getMyClassesWithMembers(): Observable<any[]> {
        return this.dataService.getArray<any>(this.urlBase + "/education/me/classes?$expand=members");
    }

    getMyClassesWithSchools(): Observable<any[]> {
        return this.dataService.getArray<any>(this.urlBase + "/education/me/classes?$expand=schools");
    }

   

    /**
     * Get members of a class
     * @param classId The Object ID of the section
     */
    getClassWithMembers(classId: string): Observable<any> {
        return this.dataService.getObject<any>(this.urlBase + "/education/classes/" + classId + "?$expand=members");
    }

    /**
     * Get users of a school
     * @param  {string} schoolId Identification of the school
     * @param  {string} nextLink next link in the previous response for next page
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/school-rest-operations#get-school-members
     */
    getUsers(schoolId: string, nextLink: string): Observable<PagedCollection<any>> {
        var url = this.urlBase + "/administrativeUnits/" + schoolId + "/members?$top=12" +
            (nextLink ? "&" + GraphHelper.getSkipToken(nextLink) : '');
        return this.dataService.getPagedCollection<any>(url);
    }


    /**
     * Get all teachers of a school
     * @param  {string} schoolId Identification of the school
     * Reference URL: https://msdn.microsoft.com/en-us/office/office365/api/school-rest-operations#get-school-members
     */
    getAllTeachers(schoolId: string): Observable<any[]> {
        var url = this.urlBase + "/users?$filter=extension_fe2174665583431c953114ff7268b7b3_Education_SyncSource_SchoolId%20eq%20'" + schoolId +
            "'%20and%20extension_fe2174665583431c953114ff7268b7b3_Education_ObjectType%20eq%20'Teacher'"
        return this.dataService.getArray<any>(url);
    }


    /**
     * Get documents of a class
     * Reference URL: https://dev.onedrive.com/items/list.htm.
     */
    getDocuments(classId: string): Observable<any[]> {
        var url = Constants.MSGraphResource + "/v1.0/groups/" + classId + "/drive/root/children";
        return this.dataService.getArray<any>(url);
    }

    getOneDriveWebURl(classId: string): Observable<string> {
        var url = Constants.MSGraphResource + "/v1.0/groups/" + classId + "/drive/root";
        return this.dataService.getObject<string>(url);
    }

    /**
     * Get conversations of a class
     * Reference URL: https://graph.microsoft.io/en-us/docs/api-reference/v1.0/api/group_list_threads.
     */
    getConversations(classId: string): Observable<any[]> {
        var url = Constants.MSGraphResource + "/v1.0/" + Constants.TenantId + "/groups/" + classId + "/conversations";
        return this.dataService.getArray<any>(url);
    }

    getSeatingArrangements(classId: string): Observable<SeatingArrangement[]> {
        var url = "/api/schools/seatingArrangements/" + classId + "?t=" + new Date().getTime();
        return this.dataService.getObject<SeatingArrangement[]>(url);
    }

    saveSeatingArrangement(classId: string, seatingArrangements: SeatingArrangement[]): any {
        var url = "/api/schools/seatingArrangements/" + classId + "?t=" + new Date().getTime();
        return this.dataService.post(url, seatingArrangements);
    }

    addUserToSectionMembers(classId: string, userId: string): Observable<any> {
        let data = { "@odata.id": "https://graph.microsoft.com/v1.0/users/" + userId };
        return this.dataService.postToGraph(`${Constants.MSGraphResource}/v1.0/groups/${classId}/members/$ref`, data);
    }

    addUserToSectionOwners(classId: string, userId: string): Observable<any> {
        let data = { "@odata.id": "https://graph.microsoft.com/v1.0/users/" + userId };
        return this.dataService.postToGraph(`${Constants.MSGraphResource}/v1.0/groups/${classId}/owners/$ref`, data);
    }

    /**
    * Get assignments of a class
    * Reference URL: TBD
    */
    getAssignmentsByClassId(classId: string): Observable<any[]> {
        return this.dataService.getArray<any>(`${this.urlBase}/education/classes/${classId}/assignments`);
    }

    createAssignment(assignment: Assignment): Observable<any> {
        let data = {
            "dueDateTime": assignment.DueDateTime,
            "displayName": assignment.DisplayName,
            "status": assignment.Status,
            "allowStudentsToAddResourcesToSubmission": true,
            "assignTo": {
                "@odata.type": "#microsoft.education.assignments.api.educationAssignmentClassRecipient"
            }
        };
        return this.dataService.postToGraph(`${this.urlBase}/education/classes/${assignment.ClassId}/assignments`, data);
    }

    publishAssignment(assignment: Assignment): Observable<any> {
        return this.dataService.postToGraph(`${this.urlBase}/education/classes/${assignment.ClassId}/assignments/${assignment.Id}/publish`, null);
    }

    getAssignmentResourceFolder(assignment: Assignment): Observable<any> {
        return this.dataService.getObject(`${this.urlBase}/education/classes/${assignment.ClassId}/assignments/${assignment.Id}/GetResourcesFolderUrl`);
    }

    addAssignmentResources(classId: string, assignmentId: string, fileName: string, fileType: string, resourceUrl: string): Observable<any> {
        let data = {
            "resource": {
                "displayName": fileName,
                "@odata.type": fileType,
                "file": {
                    "odataid": resourceUrl
                }
            }
        };
        return this.dataService.postToGraph(`${this.urlBase}/education/classes/${classId}/assignments/${assignmentId}/resources`, data);
    }

    AddSubmissionResource(classId: string, assignmentId: string, submissionId: string, fileName: string, fileType: string, resourceUrl: string): Observable<any> {
        let data = {
            "resource": {
                "displayName": fileName,
                "@odata.type": fileType,
                "file": {
                    "odataid": resourceUrl
                }
            }
        };
        return this.dataService.postToGraph(`${this.urlBase}/education/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/resources`, data);
    }

    getAssignmentSubmissions(classId: string, assignmentId: string): Observable<any[]> {
        return this.dataService.getArray<any>(`${this.urlBase}/education/classes/${classId}/assignments/${assignmentId}/submissions`);
    }

    getUserById(userId: string): Observable<any> {
        return this.dataService.getObject(`${Constants.MSGraphResource}/v1.0/users/${userId}`);
    }

    getAssignmentSubmissionByUser(classId: string, assignmentId: string, userId: string): Observable<any[]> {
        return this.dataService.getArray<any>(`${this.urlBase}/education/classes/${classId}/assignments/${assignmentId}/submissions?$filter=submittedBy/user/id eq '${userId}'`);
    }
}