import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import * as React from "react";
import { createQueryClient } from "../lib/query";
import { createAppRouter } from "./routes";
export function App() {
    const [queryClient] = React.useState(() => createQueryClient());
    const [router] = React.useState(() => createAppRouter(queryClient));
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(RouterProvider, { router: router }) }));
}
