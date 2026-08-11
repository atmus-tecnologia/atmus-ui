# date-presets

> Fonte: `src/core/ui/components/datepicker/date-presets.ts`

## Types / interfaces

### AtmDateRange

```ts
export interface AtmDateRange {
  start: Date | null;
  end: Date | null;
}
```

### AtmDatePreset

```ts
export interface AtmDatePreset {
  label: string;
  value: () => Date;
}
```

### AtmDateRangePreset

```ts
export interface AtmDateRangePreset {
  label: string;
  value: () => AtmDateRange;
}
```

