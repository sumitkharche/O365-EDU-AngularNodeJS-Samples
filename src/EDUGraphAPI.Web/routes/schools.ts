/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import express = require('express');
import { SchoolService } from '../services/schoolService';

var router = express.Router();

router.route('/seatingArrangements/:classId')
    .get((req, res) => {
        var classId = req.params.classId as string;
        var schoolService = new SchoolService();
        schoolService.getSeatingArrangementsAsync(classId)
            .then(arrangement => res.json(arrangement))
            .catch(error => res.json(500, { error: error }));
    })
    .post((req, res) => {
        var newItems = req.body as Array<any>;
        var classId = req.params.classId as string;
        var schoolService = new SchoolService();
        schoolService.updateSeatingArrangementsAsync(classId, newItems)
            .then((ret) => res.end())
            .catch(error => res.json(500, { error: error }));
    });

export = router;