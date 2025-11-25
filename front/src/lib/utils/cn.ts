import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 *
 * @example
 * ```typescript
 * cn('base-class', condition && 'conditional-class', props.className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

