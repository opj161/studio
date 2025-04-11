import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a string is a valid base64 image Data URI.
 */
export const isDataURI = (uri: string): boolean => /^data:image\/[a-zA-Z]+;base64,/.test(uri);
