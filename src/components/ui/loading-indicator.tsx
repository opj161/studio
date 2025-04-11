"use client";

import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const loadingVariants = cva(
  "flex items-center gap-2 rounded-md p-2 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary/10 text-primary",
        destructive: "bg-destructive/10 text-destructive",
      },
      size: {
        sm: "text-xs py-1 px-2",
        default: "text-sm py-2 px-3",
        lg: "text-base py-3 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LoadingIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  status?: 'loading' | 'error' | 'success';
  message?: string;
  progress?: number; // 0-100
}

/**
 * Enhanced loading indicator component with support for different states and progress
 */
export function LoadingIndicator({
  className,
  variant,
  size,
  status = 'loading',
  message,
  progress,
  ...props
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(loadingVariants({ variant, size }), className)}
      {...props}
    >
      {status === 'loading' && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      
      {status === 'error' && (
        <AlertCircle className="h-4 w-4 text-destructive" />
      )}
      
      <span>
        {message || (
          status === 'loading' 
            ? 'Loading...' 
            : status === 'error'
              ? 'An error occurred'
              : 'Completed'
        )}
      </span>
      
      {typeof progress === 'number' && progress >= 0 && progress <= 100 && (
        <div className="ml-auto flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-background">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs tabular-nums">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
