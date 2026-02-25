import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

/* ===============================
   BASE AVATAR
================================ */

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

/* ===============================
   AVATAR GROUP (NEW)
================================ */

function AvatarGroup({ className, children }) {
  return (
    <div className={cn("flex -space-x-2 items-center", className)}>
      {children}
    </div>
  )
}

function AvatarGroupCount({ className, children }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-xs font-medium",
        className
      )}
    >
      {children}
    </div>
  )
}

/* ===============================
   EXPORTS
================================ */

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
}