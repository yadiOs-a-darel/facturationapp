"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.registerTenant = registerTenant;
exports.getSession = getSession;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const crypto_1 = require("crypto");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../lib/db");
const license_validator_1 = require("../../lib/license-validator");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const registerTenantSchema = zod_1.z.object({
    tenantName: zod_1.z.string().min(2),
    tenantSlug: zod_1.z.string().min(2),
    adminEmail: zod_1.z.string().email(),
    adminPassword: zod_1.z.string().min(6),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    licenseKey: zod_1.z.string().min(1),
});
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
async function login(req, res) {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const { email, password } = parse.data;
    const rows = await db_1.db
        .select({
        user: db_1.schema.users,
        tenant: db_1.schema.tenants,
    })
        .from(db_1.schema.users)
        .innerJoin(db_1.schema.tenants, (0, drizzle_orm_1.eq)(db_1.schema.users.tenantId, db_1.schema.tenants.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.schema.users.email, email), (0, drizzle_orm_1.eq)(db_1.schema.users.isActive, true)))
        .limit(1);
    const row = rows[0];
    if (!row) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const { user, tenant } = row;
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const token = jsonwebtoken_1.default.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
    }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logo: tenant.logo,
            primaryColor: tenant.primaryColor,
            secondaryColor: tenant.secondaryColor,
            fontFamily: tenant.fontFamily,
        },
    });
}
async function registerTenant(req, res) {
    const parse = registerTenantSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const { tenantName, tenantSlug, adminEmail, adminPassword, firstName, lastName, licenseKey } = parse.data;
    // Valider la licence
    if (!licenseKey || !(0, license_validator_1.validateLicenseKey)(licenseKey)) {
        return res.status(401).json({ error: 'Clé de licence invalide' });
    }
    const passwordHash = await bcryptjs_1.default.hash(adminPassword, 10);
    const tenantId = (0, crypto_1.randomUUID)();
    const adminUserId = (0, crypto_1.randomUUID)();
    const now = new Date();
    await db_1.db.transaction(async (tx) => {
        await tx.insert(db_1.schema.tenants).values({
            id: tenantId,
            name: tenantName,
            slug: tenantSlug,
            primaryColor: '#1976d2',
            secondaryColor: '#ffffff',
            fontFamily: 'Inter',
            country: 'DZ',
            plan: 'BASIC',
            planStatus: 'TRIAL',
            licenseKey,
            licenseValidatedAt: now,
            maxUsers: 3,
            maxProducts: 500,
            createdAt: now,
            updatedAt: now,
        });
        await tx.insert(db_1.schema.users).values({
            id: adminUserId,
            tenantId,
            email: adminEmail,
            passwordHash,
            firstName,
            lastName,
            role: 'SUPER_ADMIN',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    });
    const adminUser = {
        id: adminUserId,
        email: adminEmail,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
    };
    const token = jsonwebtoken_1.default.sign({
        sub: adminUser.id,
        tenantId,
        role: adminUser.role,
    }, JWT_SECRET, { expiresIn: '8h' });
    return res.status(201).json({
        token,
        tenant: {
            id: tenantId,
            name: tenantName,
            slug: tenantSlug,
        },
        user: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role,
        },
    });
}
async function getSession(req, res) {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    const rows = await db_1.db
        .select({
        user: db_1.schema.users,
        tenant: db_1.schema.tenants,
    })
        .from(db_1.schema.users)
        .innerJoin(db_1.schema.tenants, (0, drizzle_orm_1.eq)(db_1.schema.users.tenantId, db_1.schema.tenants.id))
        .where((0, drizzle_orm_1.eq)(db_1.schema.users.id, userId))
        .limit(1);
    const row = rows[0];
    if (!row) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    const { user, tenant } = row;
    return res.json({
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logo: tenant.logo,
            primaryColor: tenant.primaryColor,
            secondaryColor: tenant.secondaryColor,
            fontFamily: tenant.fontFamily,
        },
    });
}
async function logout(_req, res) {
    return res.json({ success: true });
}
