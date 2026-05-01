"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const reports_controller_1 = require("./reports.controller");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.use(auth_1.authMiddleware);
exports.reportsRouter.get('/dashboard', reports_controller_1.dashboardReport);
