/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

import { Component, OnInit, Inject, OnDestroy, AfterViewChecked, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SchoolModel } from './school'
import { MapUtils } from '../utils/jsonhelper'
import { UserModel } from './user'
import { ClassesModel } from './classes';
import { Document, OneDrive } from './document';
import { Conversation } from './conversation';
import { SeatingArrangement } from './seatingarrangements';
import { CompareHelper } from '../utils/compareHelper';
import * as moment from 'moment';
import { MeService } from "../services/meService";
import { SchoolService } from './school.service';
import { UserPhotoService } from '../services/userPhotoService';
import { UserService } from '../services/userService';

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'classdetail.component.template.html',
    styleUrls: []
})

export class ClassDetailComponent implements OnInit, AfterContentInit {

    schoolGuId: string;
    schoolId: string;
    private sub: any;
    school: SchoolModel;
    classObjectId: string;
    me: UserModel;
    classEntity: ClassesModel;
    documents: Document[] = [];
    favoriteColor: string = "";
    oneDriveURL: string = "";
    conversations: Conversation[] = [];
    seatingArrangements: SeatingArrangement[] = [];
    newseatingArrangements: SeatingArrangement[] = [];
    seatingsCount = [];
    isEditing: boolean = false;
    dragId: string = "";
    
    sortAsc: boolean = false;
    sortDocAsc: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        @Inject('me') private meService: MeService,
        @Inject('schoolService') private schoolService: SchoolService,
        @Inject('userPhotoService') private userPhotoService: UserPhotoService,
        @Inject('user') private userService: UserService
       ) {
    }

    ngOnInit() {
        for (var i = 1; i <= 36; i++) {
            this.seatingsCount.push(i);
        }
        this.sub = this.route.params.subscribe(params => {
            this.iniData(params);
        });
    }

    iniData(params) {
        this.schoolGuId = params['id'];
        this.classObjectId = params['id2'];
        this.schoolId = params['id3'];

        this.schoolService
            .getSchoolById(this.schoolGuId)
            .subscribe((result) => {
                this.school = MapUtils.deserialize(SchoolModel, result);
            });
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
                            .getSeatingArrangements(this.classObjectId)
                            .subscribe((result) => {
                                result.forEach((obj) => {
                                    this.seatingArrangements.push(MapUtils.deserialize(SeatingArrangement, obj));
                                });
                                this.schoolService
                                    .getClassById(this.classObjectId)
                                    .subscribe((result) => {
                                        this.classEntity = MapUtils.deserialize(ClassesModel, result);
                                        this.classEntity.TermStartDate = moment.utc(this.classEntity.TermStartDate).local().format('MMM  YYYY');
                                        this.classEntity.TermEndDate = moment.utc(this.classEntity.TermEndDate).local().format('MMM YYYY');
                                        this.classEntity.IsMyClasses = true;
                                        this.classEntity.Users = [];
                                        this.schoolService
                                            .getClassMembers(this.classObjectId)
                                            .subscribe((members) => {
                                                members.value.forEach((obj) => {
                                                    var user = MapUtils.deserialize(UserModel, obj);
                                                    this.userPhotoService.getUserPhotoUrl(user.O365UserId)
                                                        .then(url => user.Photo = url);
                                                    this.classEntity.Users.push(user);
                                                    if (user.ObjectType == "Teacher") {
                                                        this.classEntity.Teachers.push(user);
                                                    }
                                                    if (user.ObjectType == "Student") {
                                                        this.userService.GetUserFavoriteColorByO365Email(user.Email)
                                                            .subscribe((color) => {
                                                                user.FavoriteColor = color;
                                                                this.classEntity.Students.push(user);
                                                                this.setSeatings();
                                                                this.sortMembers();
                                                            });
                                                        
                                                    }
                                                });
                                                
                                            });
                                    });
                            });
                    });
            });
        this.schoolService
            .getDocuments(this.classObjectId)
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
            .getOneDriveWebURl(this.classObjectId)
            .subscribe((result) => {
                this.oneDriveURL = MapUtils.deserialize(OneDrive, result).webUrl;
            });
        this.schoolService
            .getConversations(this.classObjectId)
            .subscribe((result) => {
                result.forEach((obj) => {
                    this.conversations.push(MapUtils.deserialize(Conversation, obj));
                });
            });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
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
                if (stu.O365UserId == arrangment.o365UserId) {
                    stu.SeatingArrangment = arrangment.position + "";
                    stu.SeatingClass = "seated hideitem";
                    if (stu.SeatingArrangment != "0") {
                        stu.IsSeated = true;
                        stu.ContainerClass = "deskcontainer white";
                        stu.SeatingClass = "seated";
                    }

                    if (this.me.O365UserId == stu.O365UserId) {
                        stu.ContainerClass = "deskcontainer green";
                        //stu.BackgroundColor = this.favoriteColor;
                    }
                }
            });
        });
    }

    gotoClasses(school: SchoolModel) {
        this.router.navigate(['classes', school.ObjectId, school.SchoolId]);
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
                arrangement.classId = detail.classObjectId;
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
            .saveSeatingArrangement(this.classObjectId, detail.newseatingArrangements)
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
        //new added to seat chart
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

        //deleted
        $("#hidtiles .deskcontainer").each(function (i, e) {
            var position = $(this).attr("ng-reflect-prev-position");
            if (position && position != "0") {
                $(this).attr("ng-reflect-position", position).removeClass("unsaved").removeAttr("ng-reflect-prev-position");
                var id = $(this).attr("ng-reflect-userid");
                $(".desktile[ng-reflect-position=" + position + "]").append($(this));
                $("#" + id).find(".seated").removeClass("hideitem");
            }
        });

        //move
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

        //The dragover
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
        else {
            if (this.sortAsc) {
                $("#students .table-green-header th").last().addClass("headerSortUp");
                this.sortAsc = false;
            } else {
                $("#students .table-green-header th").last().addClass("headerSortDown");
                this.sortAsc = true;
            }
            var sort = CompareHelper.createComparer("EducationGrade", this.sortAsc);
            this.classEntity.Students.sort(sort);

        }
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
            var sort = CompareHelper.createComparer("lastModifiedDateTime", this.sortDocAsc);
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