import type { ReactNode } from "react";
interface PageHeaderProps {
    title: string;
    description?: string;
    subtitle?: string;
    action?: ReactNode;
    children?: ReactNode;
    backLink?: {
        to: string;
        label?: string;
    };
    className?: string;
}
export declare function PageHeader({ title, description, subtitle, action, children, backLink, className, }: PageHeaderProps): any;
export {};
