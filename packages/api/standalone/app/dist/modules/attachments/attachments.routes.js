"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../../middleware/auth");
const attachments_controller_1 = require("./attachments.controller");
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
exports.attachmentsRouter = (0, express_1.Router)();
exports.attachmentsRouter.use(auth_1.authMiddleware);
exports.attachmentsRouter.get('/invoices/:id/attachments', attachments_controller_1.listInvoiceAttachments);
exports.attachmentsRouter.post('/invoices/:id/attachments', upload.single('file'), attachments_controller_1.uploadInvoiceAttachment);
exports.attachmentsRouter.delete('/attachments/:id', attachments_controller_1.deleteAttachment);
