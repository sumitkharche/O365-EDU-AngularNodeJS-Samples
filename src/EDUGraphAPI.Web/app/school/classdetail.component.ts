/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

import { Component, OnInit, Inject, OnDestroy, AfterViewChecked, AfterContentInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { MapUtils } from '../utils/jsonhelper'
import { CompareHelper } from '../utils/compareHelper'
import * as moment from 'moment'
import { FileUploader, FileItem } from 'ng2-file-upload'
import { Constants } from '../constants'
import { MeService } from "../services/meService"
import { SchoolService } from './school.service'
import { UserPhotoService } from '../services/userPhotoService'
import { AuthHelper } from "../authHelper/authHelper";
import { UserService } from '../services/userService'
import { UserModel } from '../models/user'
import { EducationRole } from '../models/education'
import { EducationSchool } from '../models/educationschool'
import { EducationUser } from '../models/educationuser'
import { EducationClass } from '../models/educationclass'
import { Document, OneDrive } from '../models/document'
import { Conversation } from '../models/conversation'
import { Assignment, ResourceContainer, ResourcesFolder, EducationResource, Submission, EducationSubmissionResource } from '../models/assignment'
import { SeatingArrangement } from '../models/seatingarrangements';


@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'classdetail.component.template.html',
    styleUrls: []
})

export class ClassDetailComponent implements OnInit, AfterContentInit {

    schoolGuId: string;
    classId: string;
    private sub: any;
    school: EducationSchool;
    me: UserModel;
    classEntity: EducationClass;
    schoolTeachers: UserModel[] = [];
    documents: Document[] = [];
    favoriteColor: string = "";
    oneDriveURL: string = "";
    conversations: Conversation[] = [];
    seatingArrangements: SeatingArrangement[] = [];
    newseatingArrangements: SeatingArrangement[] = [];
    assignments: Assignment[] = [];
    seatingsCount = [];
    isEditing: boolean = false;
    dragId: string = "";

    sortAsc: boolean = false;
    sortDocAsc: boolean = false;
    showSchoolteachers: boolean = false;


    uploader: FileUploader;
    uploaderType: string;
    assignmentDetail: Assignment = new Assignment();
    duetimeArray: string[] = ["12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "11:59 PM",];
    dueTime: string;
    assignmentShowAlert: boolean = false;
    assignmentAlertMessage: string = "";
    disableActionButton: boolean = false;
    disabCancelButton: boolean = false;
    submissions: Submission[];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        @Inject('me') private meService: MeService,
        @Inject('schoolService') private schoolService: SchoolService,
        @Inject('userPhotoService') private userPhotoService: UserPhotoService,
        @Inject('user') private userService: UserService,
        @Inject('auth') private authService: AuthHelper
    ) {
    }

    ngOnInit() {
        for (var i = 1; i <= 36; i++) {
            this.seatingsCount.push(i);
        }
        this.sub = this.route.params.subscribe(params => {
            this.iniData(params);
        });

        this.initAssignments();
    }

    initAssignments() {
        this.uploader = new FileUploader({ url: "TBD", removeAfterUpload: true, queueLimit: 5 });
        this.uploader.onAfterAddingFile = (fileItem: FileItem) => {
            if (this.uploaderType == "Assignment") {
                if (this.uploader.queue.filter(item => item.file.name == fileItem.file.name).length > 1
                    || this.assignmentDetail.Resources.filter(resource => resource.Resource.DisplayName == fileItem.file.name).length > 0) {
                    this.uploader.removeFromQueue(fileItem);
                    this.assignmentAlertMessage = "A file named " + fileItem.file.name + " is already attached.";
                    this.switchAlert(true);
                    setTimeout(() => {
                        this.switchAlert(false);
                    }, 2000);
                }
                else if (this.assignmentDetail.Resources.length + this.uploader.queue.length > 5) {
                    this.uploader.removeFromQueue(fileItem);
                }
            }
            else {
                if (this.uploader.queue.filter(item => item.file.name == fileItem.file.name).length > 1
                    || this.submissions[0].Resources.filter(resource => resource.Resource.DisplayName == fileItem.file.name).length > 0) {
                    this.uploader.removeFromQueue(fileItem);
                    this.assignmentAlertMessage = "A file named " + fileItem.file.name + " is already attached.";
                    this.switchAlert(true);
                    setTimeout(() => {
                        this.switchAlert(false);
                    }, 2000);
                }
                else if (this.submissions[0].Resources.length + this.uploader.queue.length > 5) {
                    this.uploader.removeFromQueue(fileItem);
                }
            }
        };
        this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: any) => {
            var responsePath = JSON.parse(response);
            console.log(response, responsePath);
            console.log("test onErrorItem");
        };
        this.dueTime = '12:00 AM';
        $("#duedate").datepicker();
    }

    iniData(params) {
        this.schoolGuId = params['id'];
        this.classId = params['id2'];

        this.schoolService
            .getSchoolById(this.schoolGuId)
            .subscribe((result) => {
                this.school = MapUtils.deserialize(EducationSchool, result);
                this.schoolService
                    .getMe()
                    .subscribe((result) => {
                        this.me = MapUtils.deserialize(UserModel, result);
                        this.meService.getCurrentUser()
                            .subscribe((user) => {
                                this.favoriteColor = user.favoriteColor;
                                if (this.me.ObjectType == 'Teacher') {
                                    $(".teacherdesk").css("background-color", user.favoriteColor);

                                } else {
                                    $(".greenicon").css("background-color", user.favoriteColor);
                                }
                                this.schoolService
                                    .getSeatingArrangements(this.classId)
                                    .subscribe((result) => {
                                        result.forEach((obj) => {
                                            this.seatingArrangements.push(MapUtils.deserialize(SeatingArrangement, obj));
                                        });
                                        this.schoolService
                                            .getClassWithMembers(this.classId)
                                            .subscribe((result) => {
                                                this.classEntity = MapUtils.deserialize(EducationClass, result);
                                                this.classEntity.Term.StartDate = moment.utc(this.classEntity.Term.StartDate).local().format('MMMM  DD YYYY');
                                                this.classEntity.Term.EndDate = moment.utc(this.classEntity.Term.EndDate).local().format('MMMM  DD YYYY');
                                                this.classEntity.IsMyClasses = true;
                                                result.members.forEach((member) => {
                                                    var user = MapUtils.deserialize(EducationUser, member);
                                                    this.userPhotoService.getUserPhotoUrl(user.Id)
                                                        .then(url => user.Photo = url);
                                                    if (user.PrimaryRole == EducationRole.Student) {
                                                        this.userService.GetUserFavoriteColorByO365Id(user.Id)
                                                            .subscribe((color) => {
                                                                user.FavoriteColor = color;
                                                            });
                                                    }
                                                    this.classEntity.Users.push(user);
                                                    if (user.PrimaryRole == EducationRole.Teacher) {
                                                        this.classEntity.Teachers.push(user)
                                                    }
                                                    if (user.PrimaryRole == EducationRole.Student) {
                                                        this.classEntity.Students.push(user)
                                                    }

                                                });
                                                this.setSeatings();
                                                this.sortMembers();
                                                if (this.me.ObjectType == 'Teacher') {
                                                    this.schoolService.getAllTeachers(this.school.SchoolNumber)
                                                        .subscribe((teachers) => {
                                                            teachers.forEach((obj) => {
                                                                var teacher = MapUtils.deserialize(UserModel, obj);
                                                                if (this.classEntity.Teachers.filter(t => t.Id == teacher.O365UserId).length == 0) {
                                                                    this.userPhotoService.getUserPhotoUrl(teacher.O365UserId)
                                                                        .then(url => teacher.Photo = url);
                                                                    this.schoolTeachers.push(teacher);
                                                                }
                                                            });
                                                        });
                                                }
                                            });
                                    });
                            });
                    });
            });
        this.schoolService
            .getDocuments(this.classId)
            .subscribe((result) => {
                result.forEach((obj) => {
                    var doc = MapUtils.deserialize(Document, obj);
                    doc.lastModifiedDateTime = moment(doc.lastModifiedDateTime).utc(true)
                        .local().format('MM/DD/YYYY hh: mm: ss A');
                    doc.LastModifiedBy = obj.lastModifiedBy.user.displayName + "";
                    this.documents.push(doc);
                });
            });
        this.schoolService
            .getOneDriveWebURl(this.classId)
            .subscribe((result) => {
                this.oneDriveURL = MapUtils.deserialize(OneDrive, result).webUrl;
            });
        this.schoolService
            .getConversations(this.classId)
            .subscribe((result) => {
                result.forEach((obj) => {
                    this.conversations.push(MapUtils.deserialize(Conversation, obj));
                });
            });
        this.schoolService
            .getAssignmentsByClassId(this.classId)
            .subscribe((result) => {
                result.forEach((obj) => {
                    let assignment: Assignment = MapUtils.deserialize(Assignment, obj);
                    assignment.Resources = [];
                    if (obj.resources.length > 0) {
                        obj.resources.forEach((obj) => {
                            let resource: ResourceContainer = MapUtils.deserialize(ResourceContainer, obj);
                            resource.Resource = MapUtils.deserialize(EducationResource, obj.resource);
                            assignment.Resources.push(resource);
                        });
                    }
                    assignment.DueDateTime = !assignment.DueDateTime? "":moment.utc(assignment.DueDateTime).local().format('M/DD/YYYY');
                    this.assignments.push(assignment);
                });
            });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    //asignment
    switchAlert(value) {
        this.assignmentShowAlert = value;
    }
    createNewAssignment(status: string) {
        this.disableActionButton = true;

        this.assignmentDetail.AllowStudentsToAddResourcesToSubmission = true;
        this.assignmentDetail.ClassId = this.classId;
        this.assignmentDetail.DueDateTime = moment($("#duedate").val() + " " + this.dueTime).utc().format("YYYY-MM-DDTHH:mm:ss")+"Z";
        this.assignmentDetail.Status = "draft";
        this.schoolService.createAssignment(this.assignmentDetail)
            .subscribe((obj) => {
                this.assignmentDetail = MapUtils.deserialize(Assignment, obj);
                if (status == "assigned") {
                    this.schoolService.publishAssignment(this.assignmentDetail)
                        .subscribe((obj) => {
                            this.uploadAssignmentFiles();
                        })
                }
                else {
                    this.uploadAssignmentFiles();
                }
            })
    }
    uploadAssignmentFiles() {
        if (this.uploader.queue.length > 0) {
            this.schoolService.getAssignmentResourceFolder(this.assignmentDetail)
                .subscribe((obj) => {
                    let resourcesFolder: ResourcesFolder = MapUtils.deserialize(ResourcesFolder, obj);
                    let ids: string[] = this.getIdsFromResourceFolder(resourcesFolder.ResourceFolderURL);
                    if (ids.length > 1) {
                        this.authService.getGraphToken(Constants.MSGraphResource)
                            .subscribe(accessToken => {
                                let fileCount = this.uploader.queue.length;
                                let fileStep = 0;
                                this.uploader.queue.forEach((item: FileItem) => {
                                    item.headers = [{ name: 'Authorization', value: 'Bearer ' + accessToken }, { name: 'Content-Type', value: 'application/json' }];
                                    item.method = "PUT";
                                    item.withCredentials = false;
                                    item.url = `${Constants.MSGraphResource}/v1.0/drives/${ids[0]}/items/${ids[1]}:/${item.file.name}:/content`;

                                    item.onSuccess = (response: string, status: number, headers: any) => {
                                        var file = JSON.parse(response);
                                        if (file) {
                                            this.schoolService.addAssignmentResources(this.classId,
                                                this.assignmentDetail.Id,
                                                file.name,
                                                this.getFileType(file.name),
                                                `${Constants.MSGraphResource}/v1.0/drives/${file.parentReference.driveId}/items/${file.id}`)
                                                .subscribe((obj) => {
                                                    console.log("queue length " + this.uploader.queue.length);
                                                    fileStep++
                                                    if (fileStep >= fileCount) {
                                                        window.location.reload();
                                                    }
                                                });
                                        }
                                    };

                                })
                                this.uploader.uploadAll();
                            });
                    }
                });
        }
        else {
            window.location.reload();
        }
    }
    getFileType(filename: string): string {
        if (filename.toLowerCase().endsWith(".docx")) {
            return "#microsoft.graph.educationWordResource";
        }
        else if (filename.toLowerCase().endsWith(".xlsx")) {
            return "#microsoft.graph.educationExcelResource";
        }
        else {
            return "#microsoft.graph.educationFileResource";
        }
    }
    getIdsFromResourceFolder(resourceFolder:string):string[] {
        let array: string[] = resourceFolder.split('/');
        let result: string[] = [];
        if (array.length >= 3) {
            result.push(array[array.length - 3]);
            result.push(array[array.length - 1]);
        }
        return result;
    }
    showNewAssignment() {
        this.disableActionButton = false;
        this.disabCancelButton = false;

        this.assignmentDetail = new Assignment();
        this.uploader.clearQueue();
        this.uploaderType = "Assignment";

        $("#new-assignment-form").modal("show");
        
    }

    showAssignmentDetail(assignment: Assignment) {
        this.disableActionButton = false;
        this.disabCancelButton = false;

        this.assignmentDetail = assignment;
        this.uploader.clearQueue();
        this.uploaderType = "Assignment";

        $("#assignment-detail-form").modal("show");

        if (this.me.ObjectType == 'Student') {
            this.uploaderType = "Submission";
            this.getAssignmentResourcesSubmission()
            if (!this.assignmentDetail.AllowLateSubmissions && moment.utc(this.assignmentDetail.DueDateTime).local() < moment()) {
                this.disableActionButton = true;
            }
        }
    }

    showAssignmentSubmissions(assignment: Assignment) {
        this.assignmentDetail = assignment;
        $("#assignment-submissions-form").modal("show");
        this.getAssignmentSubmissions();
    }

    updateAssignment(status: string) {
        this.disableActionButton = true;
        if (this.assignmentDetail.Status == "draft" && status == "assigned") {
            this.schoolService.publishAssignment(this.assignmentDetail)
                .subscribe((obj) => {
                    this.uploadAssignmentFiles();
                })
        }
        else {
            this.uploadAssignmentFiles();
        }
    }
    getAssignmentSubmissions() {
        this.submissions = [];
        this.schoolService.getAssignmentSubmissions(this.classId, this.assignmentDetail.Id)
            .subscribe((obj) => {
                obj.forEach((item) => {
                    let submission: Submission = MapUtils.deserialize(Submission, item);
                    this.schoolService.getUserById(submission.SubmittedBy.User.Id)
                        .subscribe((obj) => {
                            submission.SubmittedBy.User.DisplayName = obj.displayName;
                        })
                    submission.Resources = [];
                    item.resources.forEach((resource) => {
                        submission.Resources.push(MapUtils.deserialize(EducationSubmissionResource, resource));
                    });
                    submission.SubmittedDateTime = !submission.SubmittedDateTime ? "None" : moment.utc(submission.SubmittedDateTime).local().format('M/DD/YYYY')
                    this.submissions.push(submission);
                });
            });
    }

    getAssignmentResourcesSubmission() {
        this.submissions = []
        this.schoolService.getAssignmentSubmissionByUser(this.classId, this.assignmentDetail.Id, this.me.O365UserId)
            .subscribe((result) => {
                result.forEach((item) => {
                    let submission: Submission = MapUtils.deserialize(Submission, item);
                    submission.Resources = [];
                    item.resources.forEach((resource) => {
                        submission.Resources.push(MapUtils.deserialize(EducationSubmissionResource, resource));
                    });
                    this.submissions.push(submission);
                })
            });
    }
    newAssignmentSubmissionResource() {
        this.disabCancelButton = true;
        this.disableActionButton = true;

        if (this.submissions.length > 0) {
            this.uploadSubmissionFiles();
        }
        
    }

    uploadSubmissionFiles() {
        if (this.uploader.queue.length > 0) {

            let ids: string[] = this.getIdsFromResourceFolder(this.submissions[0].ResourcesFolderUrl);
            if (ids.length > 1) {
                this.authService.getGraphToken(Constants.MSGraphResource)
                    .subscribe(accessToken => {
                        let fileCount = this.uploader.queue.length;
                        let fileStep = 0;
                        this.uploader.queue.forEach((item: FileItem) => {
                            item.headers = [{ name: 'Authorization', value: 'Bearer ' + accessToken }, { name: 'Content-Type', value: 'application/json' }];
                            item.method = "PUT";
                            item.withCredentials = false;
                            item.url = `${Constants.MSGraphResource}/v1.0/drives/${ids[0]}/items/${ids[1]}:/${item.file.name}:/content`;

                            item.onSuccess = (response: string, status: number, headers: any) => {
                                var file = JSON.parse(response);
                                if (file) {
                                    this.schoolService.AddSubmissionResource(this.classId,
                                        this.assignmentDetail.Id,
                                        this.submissions[0].Id,
                                        file.name,
                                        this.getFileType(file.name),
                                        `${Constants.MSGraphResource}/v1.0/drives/${file.parentReference.driveId}/items/${file.id}`)
                                        .subscribe((obj) => {
                                            console.log("queue length " + this.uploader.queue.length);
                                            fileStep++
                                            if (fileStep >= fileCount) {
                                                window.location.reload();
                                            }
                                        });
                                }
                            };

                        })
                        this.uploader.uploadAll();
                    });
            }
        }
        else {
            window.location.reload();
        }
    }


    switchSchoolteachers(value) {
        this.showSchoolteachers = value;
    }
    sortMembers() {
        this.classEntity.Students.sort((n1, n2) => {
            if (n1.DisplayName > n2.DisplayName) {
                return 1;
            }
            if (n1.DisplayName < n2.DisplayName) {
                return -1;
            }
            return 0;
        })
    }

    setSeatings() {
        this.classEntity.Students.forEach((stu) => {
            this.seatingArrangements.forEach((arrangment) => {
                if (stu.Id == arrangment.o365UserId) {
                    stu.SeatingArrangment = arrangment.position + "";
                    stu.SeatingClass = "seated hideitem";
                    if (stu.SeatingArrangment != "0") {
                        stu.IsSeated = true;
                        stu.ContainerClass = "deskcontainer white";
                        stu.SeatingClass = "seated";
                    }

                    if (this.me.O365UserId == stu.Id) {
                        stu.ContainerClass = "deskcontainer green";
                    }
                }
            });
        });
    }

    gotoClasses(school: EducationSchool) {
        this.router.navigate(['classes', school.Id, school.Id]);
    }

    addCoTeacher(userId: string) {
        this.schoolService.addUserToSectionMembers(this.classId, userId)
            .subscribe((data) => {
                this.schoolService.addUserToSectionOwners(this.classId, userId)
                    .subscribe((data) => {
                        window.location.reload();
                    })
            })

    }
    ngAfterContentInit() {
        var interval = setInterval(() => {
            if (this.classEntity && this.classEntity.Students && this.classEntity.Students.length > 0) {
                this.iniTiles();
                clearInterval(interval);
            }
        }, 1000);

        var interval2 = setInterval(() => {
            var leftHeight = $("#dvleft").height();
            var rightHeight = $("#dvright").height();
            if (leftHeight > 0 && rightHeight > 0) {
                if (leftHeight > rightHeight) {
                    $("#dvright").height(leftHeight);
                } else {
                    $("#dvleft").height(rightHeight);
                }
                clearInterval(interval2);
            }
        }, 1000);
    }

    iniTiles() {
        $(".deskcontainer:not([ng-reflect-position='0']").each(function () {
            var position = $(this).attr("ng-reflect-position");
            var tile = $(".desktile[ng-reflect-position='" + position + "']")
            $(this).appendTo(tile);
        });

    }

    editseats() {
        this.isEditing = true;
        this.enableDragAndDrop();
        $(".deskclose").show();
        $(".deskcontainer").attr("draggable", "true");
    }

    saveeditseats() {
        var detail = this;
        detail.newseatingArrangements = [];
        detail.isEditing = false;
        $(".deskclose").hide();
        $(".deskcontainer").attr("draggable", "false");
        $(".lstproducts li").attr("draggable", "false");
        $(".deskcontainer").each(function () {
            var userid = $(this).attr("ng-reflect-userid");
            if (userid) {
                var position = $(this).attr("ng-reflect-position");
                var arrangement = new SeatingArrangement();
                arrangement.classId = detail.classId;
                arrangement.o365UserId = userid;
                arrangement.position = position;
                detail.newseatingArrangements.push(arrangement);
                if (position == "0") {
                    $("#" + userid).find(".seated").addClass("hideitem");
                }
            }
        });
        $("#hidtiles .deskcontainer").each(function (i, e) {
            $(this).attr("ng-reflect-prev-position", "0");
        });

        $(".desktile .deskcontainer").each(function (i, e) {
            $(this).removeClass("unsaved").removeAttr("ng-reflect-prev-position");
        });
        this.schoolService
            .saveSeatingArrangement(this.classId, detail.newseatingArrangements)
            .subscribe();
        $(".deskcontainer.unsaved").removeClass("unsaved");
        $(".desktile .deskcontainer[ng-reflect-prev-position]").removeAttr("ng-reflect-prev-position");
        $('<div id="saveResult"><div>Seating map changes saved.</div></div>')
            .insertBefore($('#dvleft'))
            .fadeIn("slow", function () { $(this).delay(3000).fadeOut("slow"); });
    }

    canceleditseats() {
        this.exitEdit();
        this.cancelEditDesk();
    }

    exitEdit() {
        this.isEditing = false;
        $(".deskclose").hide();
        this.disableDragAndDrop();
    }

    cancelEditDesk() {
        // new added to seat chart
        $(".desktile .deskcontainer.unsaved").each(function () {
            var prevId = $(this).attr("ng-reflect-prev-position");
            if (!prevId || prevId == "0") {
                $(this).attr("ng-reflect-position", 0)
                var id = $(this).attr("ng-reflect-userid");
                $("#" + id).find(".seated").addClass("hideitem");
                $("#hidtiles").append($(this));
            } else {
                var tile = $(".desktile[ng-reflect-position='" + prevId + "']");
                $(this).removeAttr("ng-reflect-prev-position").removeClass("unsaved").attr("ng-reflect-position", prevId);
                tile.append($(this));
            }

        });

        // deleted
        $("#hidtiles .deskcontainer").each(function (i, e) {
            var position = $(this).attr("ng-reflect-prev-position");
            if (position && position != "0") {
                $(this).attr("ng-reflect-position", position).removeClass("unsaved").removeAttr("ng-reflect-prev-position");
                var id = $(this).attr("ng-reflect-userid");
                $(".desktile[ng-reflect-position=" + position + "]").append($(this));
                $("#" + id).find(".seated").removeClass("hideitem");
            }
        });

        // moved
        $(".desktile .deskcontainer[ng-reflect-prev-position]").each(function (i, e) {
            var prevPosition = $(this).attr("ng-reflect-prev-position");
            if (prevPosition == $(this).attr("ng-reflect-position")) {
                return;
            }
            $(this).attr("ng-reflect-position", prevPosition).removeAttr("ng-reflect-prev-position");
            $(".desktile[ng-reflect-position=" + prevPosition + "]").append($(this));
        });
        $("#lstproducts li").attr("draggable", "false");
        $(".deskcontainer").attr("draggable", "false");

    }

    enableDragAndDrop() {
        var lstProducts = $('#lstproducts li');
        var detail = this;
        $.each(lstProducts, function (idx, val) {
            var id = $(this).attr("id");
            var position = $(".deskcontainer[ng-reflect-userid='" + id + "']").attr("ng-reflect-position");
            if (position == '0') {
                detail.enableDragOnLeft(this, true);
            } else {
                if (position) {
                    detail.enableDragOnLeft($(this), false).find(".seated").removeClass("hideitem");
                }
            }

        });

        $(".deskcontainer").on('dragstart', function (evt) {
            var id = $(this).attr("ng-reflect-userid");
            if (id) {
                detail.dragId = id;
            }
            $("#" + id).addClass("greenlist");
            var prevPosition = $(this).attr("ng-reflect-prev-position");
            if (!prevPosition) {
                $(this).attr("ng-reflect-prev-position", $(this).attr("ng-reflect-position"));
            }
        });

        $(".desktile").on('drop', function (evt) {
            evt.preventDefault();
            var id = detail.dragId;
            detail.dragId = "";
            if (id.length == 0) {
                id = $(this).find(".deskcontainer").attr("ng-reflect-userid");
            }
            var container = $(this).find(".deskcontainer");
            if (container.length > 0)
                return;
            $(".greenTileTooltip").remove();
            detail.enableDragOnLeft($("#" + id), false).removeClass("greenlist").find(".seated").removeClass("hideitem");
            $(".deskcontainer[ng-reflect-userid='" + id + "']").addClass("white").addClass("unsaved").appendTo($(this));
            var pos = $(this).find(".deskcontainer").attr("ng-reflect-prev-position");
            if (!pos) {
                $(this).find(".deskcontainer").attr({ "ng-reflect-prev-position": $(this).find(".deskcontainer").attr("ng-reflect-position") });
            }
            var position = $(this).attr("ng-reflect-position");
            $(this).find(".deskcontainer").attr("ng-reflect-position", position);

        });

        $(".desktile").on('dragenter', function (evt) {
            evt.preventDefault();
            if ($(this).find(".deskcontainer").length == 0 && $('#lstproducts li.greenlist').length > 0) {
                var tooltip = $(".desktile .greenTileTooltip");
                if (tooltip.length == 0) {
                    tooltip = $("<div class='greenTileTooltip'>Place student here</div>")
                }
                tooltip.appendTo($(this));
            }
        }).on("dragend", function (evt) {
            evt.preventDefault();
            $(".greenTileTooltip").remove();
            $(".greenlist").removeClass("greenlist");
            detail.dragId = "";
        });

        $("#dvright").on('dragover', function (evt) {
            evt.preventDefault();
        });

        $(".deskclose").unbind().click(function (evt) {
            evt.preventDefault();
            var parent = $(this).closest(".deskcontainer");
            var id = parent.attr("ng-reflect-userid");
            var user = $("#" + id);
            user.find(".seated").addClass("hideitem");
            detail.enableDragOnLeft(user, true);
            var position = parent.attr("ng-reflect-position");
            var pos = parent.attr("ng-reflect-prev-position");
            if (pos) {
                parent.attr({ "ng-reflect-position": 0 });
            } else {
                parent.attr({ "ng-reflect-prev-position": position, "ng-reflect-position": 0 });
            }
            $("#hidtiles").append(parent);
        });
    }

    disableDragAndDrop() {
        $('#lstproducts li, .deskcontainer').off('dragstart');
        $(".desktile").off('dragenter drop dragend');
        $("#dvright").off('dragover');
        $(".deskclose").off('click');
    }

    enableDragOnLeft(item, enable) {
        item = $(item);
        var detail = this;
        if (typeof (enable) === undefined || enable == true) {
            item.attr("draggable", true);
            item.on('dragstart', function (evt) {
                $(this).addClass("greenlist");
                var id = $(this).attr("id");
                detail.dragId = id;
                evt.originalEvent.dataTransfer.setData("text", "userid:" + id);
            }).on('dragend', function () {
                $(this).removeClass("greenlist");
                $(".greenTileTooltip").remove();
            });
        }
        else {
            item.off("dragstart dragend");
        }
        return item;
    }

    sortStu(sortby: string) {
        $("#students .table-green-header th").removeClass("headerSortDown").removeClass("headerSortUp");
        if (sortby == 'name') {
            if (this.sortAsc) {
                $("#students .table-green-header th").first().addClass("headerSortDown");
                this.sortAsc = false;
            } else {
                $("#students .table-green-header th").first().addClass("headerSortUp");
                this.sortAsc = true;
            }
            var sort = CompareHelper.createComparer("DisplayName", this.sortAsc);
            this.classEntity.Students.sort(sort);
        }
        //else {
        //    if (this.sortAsc) {
        //        $("#students .table-green-header th").last().addClass("headerSortUp");
        //        this.sortAsc = false;
        //    } else {
        //        $("#students .table-green-header th").last().addClass("headerSortDown");
        //        this.sortAsc = true;
        //    }
        //    var sort = CompareHelper.createComparer("EducationGrade", this.sortAsc);
        //    this.classEntity.Students.sort(sort);

        //}
    }

    sortDoc(sortby: string) {
        $("#studoc .table-green-header th").removeClass("headerSortDown").removeClass("headerSortUp");
        if (sortby == 'name') {
            if (this.sortDocAsc) {
                $("#studoc .table-green-header th:eq(2)").addClass("headerSortDown");
                this.sortDocAsc = false;
            } else {
                $("#studoc .table-green-header th:eq(2)").addClass("headerSortUp");
                this.sortDocAsc = true;
            }
            var sort = CompareHelper.createComparer("Name", this.sortDocAsc);
            this.documents.sort(sort);

        }
        else if (sortby == 'modified') {
            if (this.sortDocAsc) {
                $("#studoc .table-green-header th:eq(3)").addClass("headerSortDown");
                this.sortDocAsc = false;
            } else {
                $("#studoc .table-green-header th:eq(3)").addClass("headerSortUp");
                this.sortDocAsc = true;
            }
            var sort = CompareHelper.createDateComparer("lastModifiedDateTime", this.sortDocAsc);
            this.documents.sort(sort);
        }
        else {
            if (this.sortDocAsc) {
                $("#studoc .table-green-header th:eq(4)").addClass("headerSortDown");
                this.sortDocAsc = false;
            } else {
                $("#studoc .table-green-header th:eq(4)").addClass("headerSortUp");
                this.sortDocAsc = true;
            }
            var sort = CompareHelper.createComparer("LastModifiedBy", this.sortDocAsc);
            this.documents.sort(sort);

        }
    }

    setSelected(event) {
        $(event.target || event.srcElement || event.currentTarget).closest("tr.tr-content").addClass("selected").siblings().removeClass("selected");
    }
}