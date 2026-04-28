interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: "default" | "secondary" | "outline" | "ghost" | "link";
    };
    className?: string;
}
export declare function EmptyState({ icon, title, description, action, className, }: EmptyStateProps): any;
export {};
