# qr-encoder

> Fonte: `src/core/ui/components/qrcode/qr-encoder.ts`

## Types / interfaces

### AtmQrErrorCorrection

```ts
export type AtmQrErrorCorrection = 'L' | 'M' | 'Q' | 'H';
```

### AtmQrMatrix

```ts
export interface AtmQrMatrix {
  /** Modules per side (version * 4 + 17). */
  size: number;
  /** `modules[y][x]` — true = dark module. */
  modules: boolean[][];
  /** True when the module belongs to one of the three finder patterns (the "eyes"). */
  isFinder(x: number, y: number): boolean;
  version: number;
  errorCorrection: AtmQrErrorCorrection;
}
```

