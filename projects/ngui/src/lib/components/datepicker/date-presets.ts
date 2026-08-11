export interface AtmDateRange {
  start: Date | null;
  end: Date | null;
}

/** Preset ("recomendação") shown beside the single date picker calendar. */
export interface AtmDatePreset {
  label: string;
  value: () => Date;
}

/** Preset ("recomendação") shown beside the range picker calendar. */
export interface AtmDateRangePreset {
  label: string;
  value: () => AtmDateRange;
}

function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function shiftDays(base: Date, days: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
}

/** Default presets used by atm-date-range-picker (pass [presets]="[]" to hide). */
export const ATM_RANGE_PRESETS: AtmDateRangePreset[] = [
  { label: 'Hoje', value: () => ({ start: today(), end: today() }) },
  {
    label: 'Ontem',
    value: () => ({ start: shiftDays(today(), -1), end: shiftDays(today(), -1) }),
  },
  { label: 'Últimos 7 dias', value: () => ({ start: shiftDays(today(), -6), end: today() }) },
  { label: 'Últimos 30 dias', value: () => ({ start: shiftDays(today(), -29), end: today() }) },
  {
    label: 'Este mês',
    value: () => {
      const t = today();
      return { start: new Date(t.getFullYear(), t.getMonth(), 1), end: t };
    },
  },
  {
    label: 'Mês passado',
    value: () => {
      const t = today();
      return {
        start: new Date(t.getFullYear(), t.getMonth() - 1, 1),
        end: new Date(t.getFullYear(), t.getMonth(), 0),
      };
    },
  },
  {
    label: 'Últimos 3 meses',
    value: () => {
      const t = today();
      return { start: new Date(t.getFullYear(), t.getMonth() - 3, t.getDate()), end: t };
    },
  },
  {
    label: 'Últimos 6 meses',
    value: () => {
      const t = today();
      return { start: new Date(t.getFullYear(), t.getMonth() - 6, t.getDate()), end: t };
    },
  },
];

/** Convenience presets for atm-date-picker (opt-in via [presets]). */
export const ATM_DATE_PRESETS: AtmDatePreset[] = [
  { label: 'Hoje', value: () => today() },
  { label: 'Ontem', value: () => shiftDays(today(), -1) },
  { label: 'Amanhã', value: () => shiftDays(today(), 1) },
  { label: 'Em 7 dias', value: () => shiftDays(today(), 7) },
  { label: 'Em 30 dias', value: () => shiftDays(today(), 30) },
];
