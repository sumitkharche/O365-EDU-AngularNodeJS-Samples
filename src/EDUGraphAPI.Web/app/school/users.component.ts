/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SchoolModel } from './school'
import { UserModel, StudentModel, TeacherModel } from './user'
import { MapUtils } from '../utils/jsonhelper'
import { SchoolService } from './school.service';
import { UserPhotoService } from '../services/userPhotoService';

class UsersViewModel {

    private static cache = {};
    private userPhotoService: any;
    private id: string;

    constructor(id: string, userPhotoService: any) {
        this.id = id;
        this.userPhotoService = userPhotoService;
    }

    users: UserModel[] = new Array<UserModel>();
    nextLink: string;
    curPage: number = 1;
    isGettingData: boolean = false;
    showNoData: boolean = false;

    getData(usersGetter: (id: string, nextLink: string) => any) {
        if (this.isGettingData) {
            return;
        }
        this.isGettingData = true;
        usersGetter(this.id, this.nextLink)
            .subscribe((result) => {
                if (this.nextLink) {
                    this.curPage += 1;
                }
                this.isGettingData = false;
                this.nextLink = result["@odata.nextLink"];
                result.value.forEach((obj) => {
                    const model: UserModel = MapUtils.deserialize(UserModel, obj);
                    this.users.push(model);
                    const userId: string = model.O365UserId;
                    var cachedItem = UsersViewModel.cache[userId];
                    if (!cachedItem) {
                        cachedItem = UsersViewModel.cache[userId] = { queue: new Array<UserModel>(model) };
                        this.userPhotoService.getUserPhotoUrl(userId)
                            .then(url => {
                                cachedItem["data"] = url;
                                cachedItem.queue.forEach(user => { user.Photo = url; });
                            });
                    }
                    else if (!cachedItem.data) {
                        cachedItem.queue.push(model);
                    }
                    else {
                        model.Photo = cachedItem.data;
                    }
                });
                this.showNoData = this.users.length == 0;
            },
            (error) => {
                this.isGettingData = false;
            });
    }

    changePage(usersGetter: (id: string, nextLink: string) => any, isNext: boolean) {
        if (isNext) {
            if (this.curPage * 12 < this.users.length) {
                this.curPage += 1;
            }
            else if (this.nextLink) {
                this.getData(usersGetter);
            }
        }
        else {
            if (this.curPage > 1) {
                this.curPage -= 1;
            }
        }
    }
}

@Component({
    moduleId: module.id,
    selector: '',
    templateUrl: 'users.component.template.html',
    styleUrls: []
})

export class UsersComponent implements OnInit {

    private sub: any;

    school: SchoolModel;
    view: string = "users";
    usersModel: UsersViewModel;
    studentsModel: UsersViewModel;
    teachersModel: UsersViewModel;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        @Inject('schoolService') private schoolService: SchoolService,
        @Inject('userPhotoService') private userPhotoService: UserPhotoService) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            const objectId: string = params['id'];
            const Id: string = params['id2'];
            this.schoolService
                .getSchoolById(objectId)
                .subscribe((result) => {
                    this.school = MapUtils.deserialize(SchoolModel, result);
                });
            if (!this.usersModel) {
                this.usersModel = new UsersViewModel(objectId, this.userPhotoService);
            }
            if (!this.studentsModel) {
                this.studentsModel = new UsersViewModel(Id, this.userPhotoService);
            }
            if (!this.teachersModel) {
                this.teachersModel = new UsersViewModel(Id, this.userPhotoService);
            }
            this.usersModel.getData(this.schoolService.getUsers.bind(this.schoolService));
            this.studentsModel.getData(this.schoolService.getStudents.bind(this.schoolService));
            this.teachersModel.getData(this.schoolService.getTeachers.bind(this.schoolService));
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    switchView(view: string) {
        this.view = view;
    }

    changePage(userType: string, model: UsersViewModel, isNext: boolean) {
        let usersGetter: (id: string, nextLink: string) => any;
        switch (userType) {
            case "users":
                usersGetter = this.schoolService.getUsers.bind(this.schoolService);
                break;
            case "teachers":
                usersGetter = this.schoolService.getTeachers.bind(this.schoolService);
                break;
            case "students":
                usersGetter = this.schoolService.getStudents.bind(this.schoolService);
                break;
            default:
                return;
        }
        model.changePage(usersGetter, isNext);
    }
}