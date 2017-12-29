/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { MapUtils } from '../utils/jsonhelper';
import { UserModel } from '../models/user';
import { EducationRole } from '../models/education';
import { EducationUser } from '../models/educationuser';
import { EducationClass } from '../models/educationclass';
import { EducationSchool } from '../models/educationschool'
import { SchoolService } from './school.service';

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'myclasses.component.template.html',
    styleUrls: []
})

export class MyClassesComponent implements OnInit {

    schoolGuId: string;
    private sub: any;
    myClassesWithMembersArray: EducationClass[] = [];
    myClassesWithSchools: EducationClass[] = [];
    classesArray: EducationClass[] = [];
    school: EducationSchool;
    showNoData: boolean = false;
    legendText: string = "";
    noDataText: string = "";
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
                        this.noDataText = "Not enrolled in any classes.";
                    } else {
                        this.legendText = "Not Teaching";
                        this.noDataText = "Not teaching any classes.";
                    }

                });
            this.schoolService
                .getSchoolById(this.schoolGuId)
                .subscribe((result) => {
                    this.school = MapUtils.deserialize(EducationSchool, result);

                    this.schoolService.getMyClassesWithMembers()
                        .subscribe((result) => {
                            if (result.length == 0) {
                                this.showNoData = true;
                                return;
                            }
                            result.forEach((obj) => {
                                let myclasawihtMember: EducationClass = MapUtils.deserialize(EducationClass, obj);
                                obj.members.forEach((member) => {
                                    myclasawihtMember.Users.push(MapUtils.deserialize(EducationUser, member));
                                })

                                this.myClassesWithMembersArray.push(myclasawihtMember);
                            });

                            this.schoolService.getMyClassesWithSchools()
                                .subscribe((result) => {
                                    result.forEach((obj) => {
                                        var tempclass = MapUtils.deserialize(EducationClass, obj);
                                        obj.schools.forEach((shool) => {
                                            tempclass.Schools.push(MapUtils.deserialize(EducationSchool, shool));
                                        });
                                        if (tempclass.Schools.length > 0) {
                                            var tempschools = tempclass.Schools.filter(s => s.ExternalId === this.school.SchoolNumber);
                                            if (tempschools.length > 0) {
                                                this.classesArray.push(this.myClassesWithMembersArray.find(c => c.Id == tempclass.Id));
                                            }
                                        }
                                    });
                                    this.classesArray.sort((n1, n2) => {
                                        return n1.DisplayName > n2.DisplayName ? 1 : (n1.DisplayName < n2.DisplayName ? -1 : 0);
                                    });

                                    this.classesArray.forEach((classEntiy) => {
                                        classEntiy.Term.StartDate = moment.utc(classEntiy.Term.StartDate).local().format('MMMM  D YYYY');
                                        classEntiy.Term.EndDate = moment.utc(classEntiy.Term.EndDate).local().format('MMMM  D YYYY');
                                        classEntiy.Teachers = classEntiy.Users.filter(user => user.PrimaryRole == EducationRole.Teacher);
                                    });
                                });
                        });
                },
                (error) => {
                    if (error.status == 404)
                        this.showNoData = true;
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

    gotoDetail(classId: string) {
        setTimeout(() => {
            this.router.navigate(['/classdetail', this.schoolGuId, classId]);
        }, 100);
    }

    gotoAllClasses() {
        this.router.navigate(['classes', this.schoolGuId]);
    }
}