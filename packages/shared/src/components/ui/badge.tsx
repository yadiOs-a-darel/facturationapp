import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-success text-success-foreground shadow-xs hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow-xs hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground shadow-xs hover:bg-info/80",
      },
      size: {
        sm: "h-5 text-xs px-2",
        md: "h-6 text-xs px-2.5",
        lg: "h-7 text-sm px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
