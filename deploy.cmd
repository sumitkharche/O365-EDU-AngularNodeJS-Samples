:: Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
:: See LICENSE in the project root for license information.

@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

IF EXIST "%~dp0%\src\EDUGraphAPI.Web\deploy.cmd" (
  call %~dp0%\src\EDUGraphAPI.Web\deploy.cmd
)

IF EXIST "%~dp0%\src\EDUGraphAPI.SyncData\deploy.cmd" (
  call %~dp0%\src\EDUGraphAPI.SyncData\deploy.cmd
)
