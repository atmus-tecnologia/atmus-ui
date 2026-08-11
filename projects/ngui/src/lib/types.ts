/** Standard size scale used by every Atmus UI component. */
export type AtmSize = 'large' | 'medium' | 'slim';

/** Semantic colors mapped to the :root theme tokens. */
export type AtmColor = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** Visual weight variants for buttons / chips / badges. */
export type AtmVariant = 'solid' | 'soft' | 'outline' | 'ghost';

/** Height per size — single source of truth for field-like components. */
export const ATM_SIZE_HEIGHT: Record<AtmSize, string> = {
  large: 'h-12',
  medium: 'h-10',
  slim: 'h-8',
};

/** Text size per size. */
export const ATM_SIZE_TEXT: Record<AtmSize, string> = {
  large: 'text-base',
  medium: 'text-sm',
  slim: 'text-xs',
};

/** Horizontal padding per size. */
export const ATM_SIZE_PX: Record<AtmSize, string> = {
  large: 'px-4',
  medium: 'px-3.5',
  slim: 'px-2.5',
};

let uid = 0;
/** Generates unique ids for aria wiring. */
export function atmUid(prefix = 'atm'): string {
  return `${prefix}-${++uid}`;
}
