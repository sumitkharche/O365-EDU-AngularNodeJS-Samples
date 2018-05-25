/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import { DbContext } from './dbContext'
import { UserDataSyncService } from './userDataSyncService'

const dbContext = new DbContext();
const userDataSyncService = new UserDataSyncService(dbContext);
userDataSyncService.syncAsync()
    .then(() => dbContext.close())
    .catch(error => {
        console.log(error);
        dbContext.close()
    });
