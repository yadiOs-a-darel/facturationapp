"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTenant = getMyTenant;
exports.updateMyTenantBranding = updateMyTenantBranding;
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../lib/db");
const updateBrandingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    logo: zod_1.z.string().url().nullable().optional(),
    primaryColor: zod_1.z.string().optional(),
    secondaryColor: zod_1.z.string().optional(),
    fontFamily: zod_1.z.string().optional(),
});
async function getMyTenant(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    const rows = await db_1.db
        .select()
        .from(db_1.schema.tenants)
        .where((0, drizzle_orm_1.eq)(db_1.schema.tenants.id, tenantId))
        .limit(1);
    const tenant = rows[0];
    if (!tenant) {
        return res.status(404).json({ error: 'Magasin introuvable' });
    }
    return res.json({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        fontFamily: tenant.fontFamily,
        plan: tenant.plan,
        planStatus: tenant.planStatus,
    });
}
async function updateMyTenantBranding(req, res) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    const parse = updateBrandingSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Données invalides', details: parse.error.flatten() });
    }
    const data = parse.data;
    await db_1.db
        .update(db_1.schema.tenants)
        .set(data)
        .where((0, drizzle_orm_1.eq)(db_1.schema.tenants.id, tenantId));
    const [tenant] = await db_1.db
        .select()
        .from(db_1.schema.tenants)
        .where((0, drizzle_orm_1.eq)(db_1.schema.tenants.id, tenantId))
        .limit(1);
    return res.json({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        fontFamily: tenant.fontFamily,
        plan: tenant.plan,
        planStatus: tenant.planStatus,
    });
}
