"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const tenants_routes_1 = require("./modules/tenants/tenants.routes");
const customers_routes_1 = require("./modules/customers/customers.routes");
const products_routes_1 = require("./modules/products/products.routes");
const invoices_routes_1 = require("./modules/invoices/invoices.routes");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*',
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'gestfacturation-api' });
});
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/tenants', tenants_routes_1.tenantRouter);
app.use('/api/customers', customers_routes_1.customersRouter);
app.use('/api/products', products_routes_1.productsRouter);
app.use('/api/invoices', invoices_routes_1.invoicesRouter);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API GestFacturation démarrée sur http://localhost:${PORT}`);
});
