# atm-office

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/office/office.component.ts`

## Purpose

Um personagem do escritório virtual. */

## Notes from source

Um personagem do escritório virtual. */
export interface AtmOfficeAgent {
  id: string;
  name: string;
  /** Cargo exibido na mesa. */
  role?: string;
  /** Cor da camiseta (qualquer cor CSS). Padrão: cicla os tokens do tema. */
  color?: string;
  /** Chefe: mesa executiva, coroa e cabeceira da sala de reunião. */
  boss?: boolean;
}

/** Handle fluente para comandar um agente: office.agent('ana').moveTo('pedro').talk('Oi!') */
export interface AtmOfficeAgentHandle {
  /** Anda até ficar ao lado de outro agente. */
  moveTo(targetId: string): AtmOfficeAgentHandle;
  /** Anda até um ponto do mundo (0..1000 x 0..640). */
  goTo(x: number, y: number): AtmOfficeAgentHandle;
  /** Mostra um balão de fala pelo tempo indicado. */
  talk(text: string, ms?: number): AtmOfficeAgentHandle;
  /** Pausa na fila de comandos. */
  wait(ms: number): AtmOfficeAgentHandle;
  /** Volta para a própria mesa. */
  backToDesk(): AtmOfficeAgentHandle;
  /** Cancela tudo que estava na fila. */
  stop(): AtmOfficeAgentHandle;
}

interface Vec {
  x: number;
  y: number;
}

type OfficeCmd =
  | { kind: 'goto'; to: Vec }
  | { kind: 'approach'; target: string }
  | { kind: 'say'; text: string; ms: number; until?: number }
  | { kind: 'wait'; ms: number; until?: number }
  | { kind: 'face'; dir: 1 | -1 };

interface SimAgent {
  id: string;
  pos: Vec;
  face: 1 | -1;
  walking: boolean;
  queue: OfficeCmd[];
  bubble: { text: string; start: number; until: number } | null;
  /** Marca que executou comandos desde o último "idle" (para emitir agentIdle). */
  wasBusy: boolean;
}

/* ------------------------------------------------------------------ */
/* Mundo (coordenadas fixas 1000 x 640)                                */
/* ------------------------------------------------------------------ */

const WORLD_W = 1000;
const WORLD_H = 640;

const BOSS_HOME: Vec = { x: 215, y: 208 };
const BOSS_SEAT: Vec = { x: 698, y: 228 };
const TABLE_CX = 812;

/** Colunas/linhas das mesas dos funcionários (até 6 no layout largo, até 8 no compacto). */
const SLOT_ROWS = [392, 560];
const SLOT_COLS_3 = [145, 315, 485];
const SLOT_COLS_4 = [110, 258, 406, 554];

const DEFAULT_TEAM: AtmOfficeAgent[] = [
  { id: 'amelia', name: 'Amelia', role: 'CEO', boss: true },
  { id: 'lucas', name: 'Lucas', role: 'Dev Backend' },
  { id: 'mariana', name: 'Mariana', role: 'Dev Frontend' },
  { id: 'pedro', name: 'Pedro', role: 'QA' },
  { id: 'ana', name: 'Ana', role: 'Designer' },
  { id: 'rafael', name: 'Rafael', role: 'DevOps' },
];

const DEFAULT_PHRASES = [
  'Pode revisar meu PR?',
  'O deploy passou na pipeline!',
  'Achei um bug no drawer, vem ver.',
  'Bora alinhar a sprint?',
  'O cliente aprovou o layout!',
  'CI está verde de novo.',
  'Te mando o link do Figma.',
  'Esse endpoint tá lento, vou olhar.',
  'Fechei a issue do overlay.',
  'Café? Preciso de 5 minutos.',
];

const DEFAULT_REPLIES = ['Boa!', 'Show, valeu!', 'Deixa comigo.', 'Perfeito!', 'Pode mandar.', 'Já olho isso.'];

/** Tokens usados como cor de camiseta quando o agente não define `color`. */
const SHIRT_TOKENS = ['--atm-primary', '--atm-success', '--atm-info', '--atm-warning', '--atm-danger', '--atm-primary-hover'];

/** Arte dos personagens (tons de pele/cabelo — independem do tema, como um sprite). */
const SKINS = ['#f2c9a2', '#e0ac7e', '#c68e63', '#9c6b45'];
const HAIRS = ['#2f2a26', '#4a342a', '#1c1c1e', '#5b4632'];
const PANTS = '#3d3d49';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function linspace(a: number, b: number, n: number): number[] {
  if (n <= 1) return [(a + b) / 2];
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

/**Escritório virtual animado — personagens que andam entre as mesas, conversamem balões de fala e se reúnem na sala de reunião ao redor do chefe.Pensado para ser controlado por código (ex.: eventos de assistentes de IAvindos do backend) através de uma API fluente:  <atm-office #office [agents]="team" [demo]="true" (agentClick)="..." />  office.agent('ana').moveTo('pedro').talk('Pode revisar meu PR?').backToDesk();  office.visit('mariana', 'lucas', 'CI quebrou no seu branch');  office.meeting('Planejamento da sprint');   // todos para a sala de reunião  office.backToWork();                        // todos voltam às mesasCada agente tem uma fila de comandos processada em sequência (goto, approach,say, wait, face). Renderização em canvas 2D com as cores dos tokens do tema(dark mode automático), sem dependências externas.

## Identity

- **Class**: `AtmOffice`
- **Selector**: `atm-office`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `agents` | AtmOfficeAgent[] | no | DEFAULT_TEAM |
| `demo` | boolean | no | false |
| `speed` | number | no | 130 |
| `title` | string | no | 'Atmus · Team Room' |
| `showLegend` | boolean | no | true |
| `phrases` | string[] | no | DEFAULT_PHRASES |
| `replies` | string[] | no | DEFAULT_REPLIES |

## Outputs

| Name | Payload |
| --- | --- |
| `agentClick` | AtmOfficeAgent |
| `agentIdle` | string |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmOfficeAgent

```ts
export interface AtmOfficeAgent {
  id: string;
  name: string;
  /** Cargo exibido na mesa. */
  role?: string;
  /** Cor da camiseta (qualquer cor CSS). Padrão: cicla os tokens do tema. */
  color?: string;
  /** Chefe: mesa executiva, coroa e cabeceira da sala de reunião. */
  boss?: boolean;
}
```

### AtmOfficeAgentHandle

```ts
export interface AtmOfficeAgentHandle {
  /** Anda até ficar ao lado de outro agente. */
  moveTo(targetId: string): AtmOfficeAgentHandle;
  /** Anda até um ponto do mundo (0..1000 x 0..640). */
  goTo(x: number, y: number): AtmOfficeAgentHandle;
  /** Mostra um balão de fala pelo tempo indicado. */
  talk(text: string, ms?: number): AtmOfficeAgentHandle;
  /** Pausa na fila de comandos. */
  wait(ms: number): AtmOfficeAgentHandle;
  /** Volta para a própria mesa. */
  backToDesk(): AtmOfficeAgentHandle;
  /** Cancela tudo que estava na fila. */
  stop(): AtmOfficeAgentHandle;
}
```

## Usage example

```html
<atm-office />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
