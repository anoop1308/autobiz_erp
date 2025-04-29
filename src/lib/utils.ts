import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  const slug = name.trim().replace(/\s+/g, '-').toLowerCase();

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  return `${slug}-${uniqueSuffix}`;
}
