import { apiClient } from "../../../lib/api-client";
import type { DashboardResponse } from "../../reports/types";

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>("/reports/dashboard");
  return data;
}