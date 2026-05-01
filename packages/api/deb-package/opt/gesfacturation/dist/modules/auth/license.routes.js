"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseRouter = void 0;
const express_1 = require("express");
const license_controller_1 = require("./license.controller");
const auth_1 = require("../../middleware/auth");
exports.licenseRouter = (0, express_1.Router)();
// Valider une licence (public - avant authentification)
exports.licenseRouter.post('/validate-license', license_controller_1.validateLicense);
// Générer une licence (protégé - SUPER_ADMIN uniquement)
exports.licenseRouter.post('/generate-license', auth_1.authMiddleware, license_controller_1.generateLicense);
