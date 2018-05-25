/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { MapUtils } from '../utils/jsonhelper'
import { EducationRole } from '../models/education'
import { EducationUser } from '../models/educationuser'
import { EducationClass } from '../models/educationclass'
import { UserModel } from '../models/user'
import { EducationSchool } from '../models/educationschool'
import { SchoolService } from './school.service';

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'classes.component.template.html',
    styleUrls: []
})

export class ClassesComponent implements OnInit {

    private sub: any;
    schoolGuId: string;
    classesArray: EducationClass[] = [];
    myClassesArray: EducationClass[] = [];
    school: EducationSchool;
    nextLink: string;
    isGettingData: boolean = false;
    showNoData: boolean = false;
    legendText: string = "";
    me: UserModel;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        @Inject('schoolService') private schoolService: SchoolService) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.schoolGuId = params['id'];
            this.schoolService
                .getMe()
                .subscribe((result) => {
                    this.me = MapUtils.deserialize(UserModel, result);
                    if (this.me.ObjectType == "Student") {
                        this.legendText = "Not Enrolled";
                    } else {
                        this.legendText = "Not Teaching";
                    }
                });
            this.schoolService
                .getSchoolById(this.schoolGuId)
                .subscribe((result) => {
                    this.school = MapUtils.deserialize(EducationSchool, result);
                    this.getClasses();
                });
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    showDetail(classEntity) {
        classEntity.UIHoverShowDetail = true;
    }

    hideDetail(classEntity) {
        classEntity.UIHoverShowDetail = false;
    }

    gotoMyClasses() {
        this.router.navigate(['/myclasses', this.schoolGuId]);
    }

    gotoDetail(classId: string) {
        setTimeout(() => {
            this.router.navigate(['/classdetail', this.schoolGuId, classId]);
        }, 100);
    }

    loadMore() {
        this.getClasses();
    }

    getClasses() {
        if (this.isGettingData) {
            return;
        }
        this.isGettingData = true;
        this.schoolService
            .getClasses(this.schoolGuId, this.nextLink)
            .subscribe((result) => {
                this.isGettingData = false;
                this.nextLink = result["@odata.nextLink"];
                if (this.classesArray === undefined) {
                    this.classesArray = [];
                }
                result.value.forEach((obj) => { this.classesArray.push(MapUtils.deserialize(EducationClass, obj)); });
                if (this.classesArray.length == 0) {
                    this.showNoData = true;
                }
                else {
                    this.schoolService.getMyClasses()
                        .subscribe((result) => {
                            if (this.myClassesArray === undefined) {
                                this.myClassesArray = [];
                            }
                            result.forEach((obj) => {
                                this.myClassesArray.push(MapUtils.deserialize(EducationClass, obj));
                            });
                            this.myClassesArray.forEach((obj) => {
                                this.classesArray.forEach((objofAllClasses) => {
                                    if (obj.Id == objofAllClasses.Id) {
                                            objofAllClasses.IsMyClasses = true;
                                        }
                                    });
                            });
                            this.classesArray.forEach((classEntity) => {
                                this.schoolService.getClassWithMembers(classEntity.Id)
                                    .subscribe((obj) => {
                                        let tempMembers: EducationUser[] = [];
                                        obj.members.forEach((member) => {
                                            tempMembers.push(MapUtils.deserialize(EducationUser, member));
                                        });
                                        classEntity.Users = tempMembers;
                                        classEntity.Term.StartDate = moment.utc(classEntity.Term.StartDate).local().format('MMMM  D YYYY');
                                        classEntity.Term.EndDate = moment.utc(classEntity.Term.EndDate).local().format('MMMM  D YYYY');
                                        classEntity.Teachers = classEntity.Users.filter(user => user.PrimaryRole == EducationRole.Teacher);
                                    })
                            });
                        })
                }
            },
            (error) => {
                this.isGettingData = false;
            });
    }
}