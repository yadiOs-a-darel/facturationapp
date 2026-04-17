import { jsx as _jsx } from "react/jsx-runtime";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppRouter } from "./routes";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 2 * 60 * 1000,
            retry: 1,
        },
    },
});
const router = createAppRouter(queryClient);
export function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(RouterProvider, { router: router }) }));
}
export { queryClient };
