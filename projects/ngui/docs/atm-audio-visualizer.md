# atm-audio-visualizer

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/audio-visualizer/audio-visualizer.component.ts`

## Purpose

Visualizador de áudio (waveform/bars).

## Notes from source

Visual styles of the audio intensity visualizer. */
export type AtmAudioVisualizerVariant = 'bars' | 'wave' | 'ring';

const CANVAS_HEIGHT: Record<AtmSize, number> = { large: 160, medium: 112, slim: 72 };
const BUTTON_SIZE: Record<AtmSize, string> = {
  large: 'size-12 text-lg',
  medium: 'size-10 text-base',
  slim: 'size-8 text-xs',
};
const TIME_TEXT: Record<AtmSize, string> = {
  large: 'text-sm',
  medium: 'text-xs',
  slim: 'text-[10px]',
};
const COLOR_VAR: Record<AtmColor, string> = {
  primary: '--atm-primary',
  success: '--atm-success',
  warning: '--atm-warning',
  danger: '--atm-danger',
  info: '--atm-info',
  neutral: '--atm-ink-muted',
};

/** Number of smoothed intensity buckets kept between frames. */
const BINS = 64;

/**
Audio intensity visualizer with three animated styles (bars, wave, ring).
Sources:
- `src`    — audio URL (or blob URL). Renders a play/pause control + time.
             For remote URLs the server must allow CORS, otherwise the
             Web Audio analyser cannot read the samples.
- `stream` — live `MediaStream` (e.g. `getUserMedia`), great for recorders.
             Nothing is routed to the speakers (no feedback).
While idle it renders a subtle breathing animation so the component
always looks alive.

## Identity

- **Class**: `AtmAudioVisualizer`
- **Selector**: `atm-audio-visualizer`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `src` | string \| null | no | null |
| `stream` | MediaStream \| null | no | null |
| `variant` | AtmAudioVisualizerVariant | no | 'bars' |
| `size` | AtmSize | no | 'medium' |
| `color` | AtmColor | no | 'primary' |
| `showControls` | boolean | no | true |
| `loop` | boolean | no | false |
| `ariaLabel` | string | no | 'Visualização de intensidade de áudio' |

## Outputs

| Name | Payload |
| --- | --- |
| `ended` | void |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmAudioVisualizerVariant

```ts
export type AtmAudioVisualizerVariant = 'bars' | 'wave' | 'ring';
```

## Usage example

```html
<atm-audio-visualizer [stream]="mediaStream" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
