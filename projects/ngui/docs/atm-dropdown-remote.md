# atm-dropdown-remote

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/dropdown/dropdown-remote.component.ts`

## Purpose

Dropdown que busca opções via AtmRemoteDataSource (API paginada).

## Notes from source

Remote (API-driven) dropdown for nest-paginator backends.Pass any service implementing AtmRemoteDataSource (e.g. one extendingAtmRestService):  <atm-dropdown-remote    [dataSource]="contactsService"    labelField="name"    valueField="id"    [hasActionButton]="true"    (actionClick)="createContact()"    [(ngModel)]="contactId"  />Loads at most `limit` (default 10) records; further records are reached bytyping in the built-in search box (debounced, server-side search).

## Identity

- **Class**: `AtmDropdownRemote`
- **Selector**: `atm-dropdown-remote`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `dataSource` | AtmRemoteDataSource | yes | — |
| `labelField` | string \| ((item: Record<string, unknown>) => string) | no | (item: Record<string, unknown>) => string)>('name' |
| `valueField` | string | no | 'id' |
| `sortBy` | string | no | 'id:DESC' |
| `limit` | number | no | 10 |
| `placeholder` | string | no | 'Selecione...' |
| `searchPlaceholder` | string | no | 'Pesquisar...' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `clearable` | boolean | no | true |
| `hasActionButton` | boolean | no | false |
| `actionButtonLabel` | string | no | 'Adicionar novo' |

## Outputs

| Name | Payload |
| --- | --- |
| `actionClick` | void |
| `selectionChange` | Record<string, unknown> \| null |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-dropdown-remote [(ngModel)]="id" [dataSource]="contactsDs" labelKey="name" valueKey="id" />
```

## Tips

Requer dataSource. Debounce 300ms, limit ~10. serverUrl via provideAtmusUi.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
