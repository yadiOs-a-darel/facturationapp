import { apiClient } from "../../../lib/api-client";
export async function fetchDashboard() {
    const { data } = await apiClient.get("/reports/dashboard");
    return data;
}
