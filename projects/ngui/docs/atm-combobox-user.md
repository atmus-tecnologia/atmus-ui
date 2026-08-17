# atm-combobox-user

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/combobox-user/combobox-user.component.ts`

## Purpose

Combobox de usuários com avatar, tabs e multiple chips.

## Notes from source

Option for atm-combobox-user — a person/entity with optional photo. */
export interface AtmComboboxUserOption<T = unknown> {
  /** Display name (used for initials when there is no avatar). */
  label: string;
  value: T;
  /** Photo URL; without it, initials with deterministic color are shown. */
  avatar?: string;
  /** Secondary line (e.g. e-mail, role). */
  description?: string;
  disabled?: boolean;
}

/** Explicit tab definition: display name + value matched against the `groupBy` path. */
export interface AtmComboboxUserTab {
  label: string;
  value: unknown;
}

/** Sentinel for the "all" tab. */
const ALL_TAB: unique symbol = Symbol('atm-all-tab');

const MIN_HEIGHT: Record<AtmSize, string> = {
  large: 'min-h-12',
  medium: 'min-h-10',
  slim: 'min-h-8',
};

/** Same deterministic palette used by atm-avatar for initials fallback. */
const PALETTE = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
];

/** Resolves a dot path (`role.name`) against an object. */
function resolvePath(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
      source,
    );
}

function sameGroup(a: unknown, b: unknown): boolean {
  return a === b || String(a) === String(b);
}

/**ComboBox for picking people (or any entity with a photo): options renderavatar + name + description, and can be grouped into tabs by a dot path ofthe option value (`groupBy="role.name"`). Tabs are auto-generated from thedistinct path values (capped by `maxTabs`), or provide `[tabs]` toname/order them yourself. When the tab row overflows, scroll chevrons withfading edges appear (same pattern as atm-tabs).Single (`T | null`) or multi (`[multiple]`, value `T[]`) — in multi mode theselection is shown as avatar chips inside the field (search inline, likeatm-tags); in single mode the panel has a search bar on top.Values can be backend objects; use `compareWith` to match by id.

## Identity

- **Class**: `AtmComboboxUser`
- **Selector**: `atm-combobox-user`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `options` | AtmComboboxUserOption[] | no | [] |
| `placeholder` | string | no | 'Selecione...' |
| `searchPlaceholder` | string | no | 'Pesquisar...' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `multiple` | boolean | no | false |
| `clearable` | boolean | no | true |
| `groupBy` | string \| undefined | no | undefined |
| `tabs` | AtmComboboxUserTab[] \| undefined | no | undefined |
| `maxTabs` | number | no | 10 |
| `showAllTab` | boolean | no | true |
| `allTabLabel` | string | no | 'Todos' |
| `compareWith` | (a: unknown, b: unknown) => boolean | no | a: unknown, b: unknown) => boolean>((a, b) => a === b |
| `displayWith` | ((value: unknown) => string) \| undefined | no | (value: unknown) => string) \| undefined>(undefined |
| `hasActionButton` | boolean | no | false |
| `actionButtonLabel` | string | no | 'Adicionar novo' |

## Outputs

| Name | Payload |
| --- | --- |
| `actionClick` | void |
| `selectionChange` | unknown |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmComboboxUserOption

```ts
export interface AtmComboboxUserOption<T = unknown> {
  /** Display name (used for initials when there is no avatar). */
  label: string;
  value: T;
  /** Photo URL; without it, initials with deterministic color are shown. */
  avatar?: string;
  /** Secondary line (e.g. e-mail, role). */
  description?: string;
  disabled?: boolean;
}
```

### AtmComboboxUserTab

```ts
export interface AtmComboboxUserTab {
  label: string;
  value: unknown;
}
```

## Usage example

```html
<atm-combobox-user [(ngModel)]="userId" [options]="users" />
```

## Tips

Options tipicamente com avatar/description.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
