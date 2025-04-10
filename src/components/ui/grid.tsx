"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  numColumns?: number;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, numColumns = 1, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          `grid-cols-${numColumns}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Grid.displayName = "Grid"

export { Grid }
