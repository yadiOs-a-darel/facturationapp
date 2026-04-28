import { apiClient } from "../../../lib/api-client";
export async function login(payload) {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
}
export async function registerTenant(payload) {
    const { data } = await apiClient.post("/auth/register-tenant", payload);
    return data;
}
export async function logout() {
    try {
        await apiClient.post("/auth/logout");
    }
    finally {
        localStorage.removeItem("gestfacturation_token");
    }
}
export async function getSession() {
    const token = localStorage.getItem("gestfacturation_token");
    if (!token) {
        return { error: new Error("No token") };
    }
    try {
        const { data } = await apiClient.get("/auth/session");
        return { data: { user: data.user } };
    }
    catch (error) {
        return { error: error };
    }
}
