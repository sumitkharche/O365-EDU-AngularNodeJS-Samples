/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import * as Sequelize from 'sequelize';
import * as Promise from "bluebird";
import { DbContext, ClassroomSeatingArrangementAttributes } from '../data/dbContext';

export class SchoolService {

    private dbContext = new DbContext();

    public getSeatingArrangementsAsync(classId: string): Promise<ClassroomSeatingArrangementAttributes[]> {
        return this.dbContext.ClassroomSeatingArrangement
            .findAll({ where: { classId: classId } });
    }

    public updateSeatingArrangementsAsync(classId: string, newItems: ClassroomSeatingArrangementAttributes[]): Promise<any> {
        return this.dbContext.ClassroomSeatingArrangement
            .findAll({ where: { classId: classId } })
            .then(oldItems => {
                let promises = new Array<Promise<any>>();
                newItems.forEach(newItem => {
                    var oldItemIndex = oldItems.findIndex(i => i.o365UserId == newItem.o365UserId);
                    if (oldItemIndex >= 0) {
                        var oldItem = oldItems[oldItemIndex];
                        oldItem.position = newItem.position;
                        promises.push(oldItem.save());
                    }
                    else {
                        newItem.classId = classId;
                        promises.push(this.dbContext.ClassroomSeatingArrangement.create(newItem));
                    }
                });
                oldItems.forEach(oldItem => {
                    if (newItems.findIndex(i => i.o365UserId == oldItem.o365UserId) < 0) {
                        promises.push(oldItem.destroy());
                    }
                });
                return Promise.all(promises);
            })
    }

}