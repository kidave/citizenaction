import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",

        destructive:
          "border-destructive/50 bg-destructive/5 text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",

        success:
          "border-success/50 bg-success/5 text-success *:data-[slot=alert-description]:text-success/90 *:[svg]:text-current",

        warning:
          "border-warning/50 bg-warning/5 text-warning *:data-[slot=alert-description]:text-warning/90 *:[svg]:text-current",

        info: "border-info/50 bg-info/5 text-info *:data-[slot=alert-description]:text-info/90 *:[svg]:text-current",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({ className, variant, ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "[&_a]:underline-offset-3 font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-current/90 [&_a]:underline-offset-3 text-balance text-sm md:text-pretty [&_a]:underline [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute right-2 top-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
