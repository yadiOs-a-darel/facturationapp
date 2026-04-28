import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  backLink?: { to: string; label?: string };
  className?: string;
}

export function PageHeader({
  title,
  description,
  subtitle,
  action,
  children,
  backLink,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {backLink && (
        <Link
          to={backLink.to}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {backLink.label || "Retour"}
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {(description || subtitle) && (
            <p className="text-sm text-muted-foreground">{description || subtitle}</p>
          )}
        </div>
        {(action || children) && (
          <div className="flex items-center gap-2">{action || children}</div>
        )}
      </div>
      <Separator />
    </div>
  );
}
