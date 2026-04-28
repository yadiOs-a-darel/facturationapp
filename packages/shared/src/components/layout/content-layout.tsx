import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type ContentSize = "default" | "compact";

const sizeStyles: Record<ContentSize, string> = {
  default: "max-w-5xl px-6",
  compact: "max-w-4xl px-12",
};

interface ContentLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  size?: ContentSize;
  variant?: "standalone" | "nested";
}

export function ContentLayout({
  title,
  description,
  actions,
  children,
  size = "default",
  variant = "standalone",
}: ContentLayoutProps) {
  const header = (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
    </div>
  );

  if (variant === "nested") {
    return (
      <>
        {header}
        {children}
      </>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
      <div className={cn("mx-auto pt-4 pb-12", sizeStyles[size])}>
        {header}
        {children}
      </div>
    </div>
  );
}