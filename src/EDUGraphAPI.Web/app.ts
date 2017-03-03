/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/
import { appAuth } from './auth/appAuth';

var http = require("http");
var https = require("https");
var cookieSession = require('cookie-session');
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var fs = require("fs");
var url = require("url");
var dbContext_1 = require("./data/dbContext");
var meRoute = require("./routes/me");
var usersRoute = require("./routes/users");
var registerRoute = require("./routes/register");
var schoolsRoute = require("./routes/schools");
var linkRoute = require("./routes/link");
var tenantRoute = require("./routes/tenant");
var adminRoute = require("./routes/admin");

var app = express();

// AAD/Local authentication
var auth = new appAuth(app);

// Angular 2
app.use("/app", express.static(path.join(__dirname, 'app')));
app.use("/dist", express.static(path.join(__dirname, 'dist')));
app.use("/node_modules", express.static(path.join(__dirname, 'node_modules'), { maxAge: 1000 * 60 * 60 * 24 }));
app.use("/fonts", express.static(path.join(__dirname, 'app/fonts'), { maxAge: 1000 * 60 * 60 * 24 }));
app.get("/styles.css", function (req, res) {
    res.sendfile(path.join(__dirname, 'styles.css'));
});
app.get("/systemjs.config.js", function (req, res) {
    res.sendfile(path.join(__dirname, 'systemjs.config.js'));
});

//-----------------------------------------------------------------------------
// Config the app, include middlewares
//-----------------------------------------------------------------------------
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));

// Initialize Passport!  Also use passport.session() middleware, to support
auth.initPassport(app);

app.use(express.static(path.join(__dirname, 'public')));

// APIs
app.use('/api/me', auth.ensureAuthenticated, meRoute);
app.use('/api/users', auth.ensureAuthenticated, usersRoute);
app.use('/api/register', registerRoute);
app.use('/api/schools', auth.ensureAuthenticated, schoolsRoute);
app.use('/api/link', auth.ensureAuthenticated, linkRoute);
app.use('/api/tenant', auth.ensureAuthenticated, tenantRoute);
app.use('/api/admin', adminRoute);

//configure aad/local auth route
auth.initAuthRoute(app);

var indexPage = app.get('env') === 'development' ? 'index.html' : 'index.prod.html';
app.get('/*', function (req, res) {
    if (req.cookies['AppClientId'] == null || req.cookies['AppClientId'] != process.env.clientId) {
        res.cookie('AppClientId', process.env.clientId);
    }
    if (req.cookies['AppBingMapKey'] == null || req.cookies['AppBingMapKey'] != process.env.BingMapKey) {
        res.cookie('AppBingMapKey', process.env.BingMapKey);
    }
    if (req.cookies['SourceCodeRepositoryUrl'] == null || req.cookies['SourceCodeRepositoryUrl'] != process.env.SourceCodeRepositoryUrl) {
        res.cookie('SourceCodeRepositoryUrl', process.env.SourceCodeRepositoryUrl);
    }
    if (req.user && req.user.tid != req.cookies['UserTenantId']) {
        res.cookie('UserTenantId', req.user.tid);
    }
    res.sendfile(path.join(__dirname, indexPage));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err['status'] || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// database
var db = new dbContext_1.DbContext();
db.sync({ force: false }).then(function () { });

// create server
var port = process.env.port || 1337;
if (app.get('env') === 'development') {
    https.createServer({
        key: fs.readFileSync('ssl/key.pem'),
        cert: fs.readFileSync('ssl/cert.pem')
    }, app).listen(port);
}
else {
    http.createServer(app).listen(port, function () {
        console.log('Express server listening on port ' + port);
    });
}