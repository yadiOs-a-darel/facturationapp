import { useQuery } from "@tanstack/react-query";
import { reportsKeys } from "../../../lib/query";
import { fetchDashboard } from "../api/client";
export function useDashboard() {
    return useQuery({
        queryKey: reportsKeys.dashboard,
        queryFn: () => fetchDashboard(),
        staleTime: 5 * 60 * 1000,
    });
}
