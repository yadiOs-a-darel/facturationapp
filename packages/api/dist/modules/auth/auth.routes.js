"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
<<<<<<< HEAD
const license_controller_1 = require("./license.controller");
=======
>>>>>>> 6598cdc29998dce80e444f03bb2376321731c8bb
const auth_1 = require("../../middleware/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/login', auth_controller_1.login);
exports.authRouter.post('/register-tenant', auth_controller_1.registerTenant);
<<<<<<< HEAD
exports.authRouter.post('/validate-license', license_controller_1.validateLicense);
=======
>>>>>>> 6598cdc29998dce80e444f03bb2376321731c8bb
exports.authRouter.get('/session', auth_1.authMiddleware, auth_controller_1.getSession);
exports.authRouter.post('/logout', auth_1.authMiddleware, auth_controller_1.logout);
