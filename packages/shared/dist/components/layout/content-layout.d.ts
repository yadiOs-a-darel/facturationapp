import type { ReactNode } from "react";
type ContentSize = "default" | "compact";
interface ContentLayoutProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    size?: ContentSize;
    variant?: "standalone" | "nested";
}
export declare function ContentLayout({ title, description, actions, children, size, variant, }: ContentLayoutProps): any;
export {};
