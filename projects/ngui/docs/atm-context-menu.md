# atm-context-menu

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/context-menu/context-menu.component.ts`

## Purpose

Menu de contexto (botão direito).

## Notes from source

Free-form command id, handy for switch/case no handler. */
  value?: unknown;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

export interface AtmContextMenuOpenOptions {
  /** Overrides the `items` input for this opening (menus dinâmicos por alvo). */
  items?: AtmContextMenuItem[];
  /** Overrides the `header` input for this opening. */
  header?: string;
  /** Arbitrary payload (a linha, o node…) devolvido em cada `itemClick`. */
  data?: unknown;
}

export interface AtmContextMenuSelect {
  item: AtmContextMenuItem;
  /** The `data` passed on open (e.g. the row / node under the cursor). */
  data?: unknown;
}

/**Right-click context menu. Renders nothing until opened; the panel is`position: fixed` at the cursor, clamped to the viewport (flips to theother side of the pointer when there is no room). Closes on outside click,Escape, scroll and resize. Full keyboard navigation (arrows/Home/End/Enter).Declarative — attach to any element via directive:  <div [atmContextMenu]="menu" [atmContextMenuData]="row">…</div>  <atm-context-menu #menu [items]="items" (itemClick)="onAction($event)" />Imperative — open with dynamic items (ex.: canvas vs node de um diagrama):  menu.open(mouseEvent, { items, header: 'Node X', data: node });

## Identity

- **Class**: `AtmContextMenu`
- **Selector**: `atm-context-menu`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | AtmContextMenuItem[] | no | [] |
| `header` | string | no | — |

## Outputs

| Name | Payload |
| --- | --- |
| `itemClick` | AtmContextMenuSelect |
| `closed` | void |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmContextMenuItem

```ts
export interface AtmContextMenuItem {
  label: string;
  /** Free-form command id, handy for switch/case no handler. */
  value?: unknown;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}
```

### AtmContextMenuOpenOptions

```ts
export interface AtmContextMenuOpenOptions {
  /** Overrides the `items` input for this opening (menus dinâmicos por alvo). */
  items?: AtmContextMenuItem[];
  /** Overrides the `header` input for this opening. */
  header?: string;
  /** Arbitrary payload (a linha, o node…) devolvido em cada `itemClick`. */
  data?: unknown;
}
```

### AtmContextMenuSelect

```ts
export interface AtmContextMenuSelect {
  item: AtmContextMenuItem;
  /** The `data` passed on open (e.g. the row / node under the cursor). */
  data?: unknown;
}
```

## Usage example

```html
<div [atmContextMenu]="menu">...</div>
<atm-context-menu #menu [items]="items" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`

---

# [atmContextMenu]

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/context-menu/context-menu.component.ts`

## Purpose

Diretiva trigger do context menu.

## Notes from source

Free-form command id, handy for switch/case no handler. */
  value?: unknown;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

export interface AtmContextMenuOpenOptions {
  /** Overrides the `items` input for this opening (menus dinâmicos por alvo). */
  items?: AtmContextMenuItem[];
  /** Overrides the `header` input for this opening. */
  header?: string;
  /** Arbitrary payload (a linha, o node…) devolvido em cada `itemClick`. */
  data?: unknown;
}

export interface AtmContextMenuSelect {
  item: AtmContextMenuItem;
  /** The `data` passed on open (e.g. the row / node under the cursor). */
  data?: unknown;
}

/**Right-click context menu. Renders nothing until opened; the panel is`position: fixed` at the cursor, clamped to the viewport (flips to theother side of the pointer when there is no room). Closes on outside click,Escape, scroll and resize. Full keyboard navigation (arrows/Home/End/Enter).Declarative — attach to any element via directive:  <div [atmContextMenu]="menu" [atmContextMenuData]="row">…</div>  <atm-context-menu #menu [items]="items" (itemClick)="onAction($event)" />Imperative — open with dynamic items (ex.: canvas vs node de um diagrama):  menu.open(mouseEvent, { items, header: 'Node X', data: node });/
@Component({
  selector: 'atm-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex min-w-44 max-w-72 flex-col overflow-hidden"
        role="menu"
        (contextmenu)="$event.preventDefault()"
      >
        @if (activeHeader(); as header) {
          <div class="truncate border-b border-line px-3 py-2 text-[11px] font-semibold text-ink-muted uppercase">
            {{ header }}
          </div>
        }
        <div class="flex-1 overflow-y-auto p-1.5">
          @for (item of activeItems(); track $index) {
            @if (item.separatorBefore) {
              <div class="my-1.5 h-px bg-line"></div>
            }
            <button
              type="button"
              class="atm-option py-2"
              [class.atm-option--active]="$index === activeIndex()"
              [class.atm-option--disabled]="item.disabled"
              [class.text-danger!]="item.danger"
              role="menuitem"
              [attr.aria-disabled]="item.disabled || null"
              (pointerenter)="activeIndex.set(item.disabled ? -1 : $index)"
              (click)="select(item)"
            >
              @if (item.icon) {
                <i
                  [class]="'w-4 text-center icofont-' + item.icon"
                  [class.text-ink-muted]="!item.danger"
                  aria-hidden="true"
                ></i>
              }
              <span class="flex-1">{{ item.label }}</span>
              @if (item.shortcut) {
                <kbd class="rounded bg-surface-alt px-1.5 py-0.5 font-sans text-[10px] text-ink-faint">
                  {{ item.shortcut }}
                </kbd>
              }
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class AtmContextMenu implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Default items — can be overridden per opening via `open(e, { items })`. */
  readonly items = input<AtmContextMenuItem[]>([]);
  /** Optional header text above the items. */
  readonly header = input<string>();

  readonly itemClick = output<AtmContextMenuSelect>();
  readonly closed = output<void>();

  readonly isOpen = signal(false);
  readonly panelStyle = signal<Record<string, string>>({});
  readonly activeItems = signal<AtmContextMenuItem[]>([]);
  readonly activeHeader = signal<string | undefined>(undefined);
  readonly activeIndex = signal(-1);

  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  private data: unknown;
  private cleanupFns: Array<() => void> = [];

  /** Opens at the mouse event position (calls preventDefault) or at `{ x, y }` in screen px. */
  open(origin: MouseEvent | { x: number; y: number }, options: AtmContextMenuOpenOptions = {}): void {
    let x: number;
    let y: number;
    if (origin instanceof MouseEvent) {
      origin.preventDefault();
      x = origin.clientX;
      y = origin.clientY;
    } else {
      x = origin.x;
      y = origin.y;
    }

    this.activeItems.set(options.items ?? this.items());
    this.activeHeader.set(options.header ?? this.header());
    this.data = options.data;
    this.activeIndex.set(-1);

    // Park off-flow before first paint so it can be measured without flashing.
    this.panelStyle.set({
      position: 'fixed',
      top: '0px',
      left: '0px',
      visibility: 'hidden',
      'max-height': `${window.innerHeight - 16}px`,
    });
    this.isOpen.set(true);
    this.cdr.detectChanges();
    this.position(x, y);
    if (!this.cleanupFns.length) this.attachGlobalListeners();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.detachGlobalListeners();
    this.closed.emit();
  }

  select(item: AtmContextMenuItem): void {
    if (item.disabled) return;
    this.itemClick.emit({ item, data: this.data });
    this.close();
  }

  private position(x: number, y: number): void {
    const panel = this.panelRef()?.nativeElement;
    if (!panel) return;
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = panel.getBoundingClientRect();

    // Prefer below/right of the cursor; flip to the other side when it overflows.
    let left = x + rect.width + pad > vw ? x - rect.width : x;
    let top = y + rect.height + pad > vh ? y - rect.height : y;
    left = Math.min(Math.max(left, pad), Math.max(vw - rect.width - pad, pad));
    top = Math.min(Math.max(top, pad), Math.max(vh - rect.height - pad, pad));

    this.panelStyle.set({
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      'max-height': `${vh - pad * 2}px`,
    });
  }

  private moveActive(delta: 1 | -1, fromEdge = false): void {
    const items = this.activeItems();
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!enabled.length) return;
    const first = enabled[0];
    const last = enabled[enabled.length - 1];
    if (fromEdge) {
      this.activeIndex.set(delta === 1 ? first : last);
      return;
    }
    const pos = enabled.indexOf(this.activeIndex());
    const next =
      pos === -1 ? (delta === 1 ? first : last) : enabled[(pos + delta + enabled.length) % enabled.length];
    this.activeIndex.set(next);
  }

  private attachGlobalListeners(): void {
    this.zone.runOutsideAngular(() => {
      const onPointerDown = (event: PointerEvent) => {
        const panel = this.panelRef()?.nativeElement;
        if (!panel || !panel.contains(event.target as Node)) {
          this.zone.run(() => this.close());
        }
      };
      const onKeydown = (event: KeyboardEvent) => {
        const key = event.key;
        if (key === 'Escape') {
          event.stopPropagation();
          this.zone.run(() => this.close());
        } else if (key === 'ArrowDown' || key === 'ArrowUp') {
          event.preventDefault();
          this.zone.run(() => this.moveActive(key === 'ArrowDown' ? 1 : -1));
        } else if (key === 'Home' || key === 'End') {
          event.preventDefault();
          this.zone.run(() => this.moveActive(key === 'Home' ? 1 : -1, true));
        } else if (key === 'Enter' || key === ' ') {
          const item = this.activeItems()[this.activeIndex()];
          if (item) {
            event.preventDefault();
            this.zone.run(() => this.select(item));
          }
        }
      };
      const onScrollOrResize = () => this.zone.run(() => this.close());

      // Delay pointerdown registration so the opening gesture doesn't close it.
      const timer = setTimeout(() => {
        document.addEventListener('pointerdown', onPointerDown, true);
      });
      document.addEventListener('keydown', onKeydown, true);
      window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true });
      window.addEventListener('resize', onScrollOrResize, { passive: true });

      this.cleanupFns.push(() => {
        clearTimeout(timer);
        document.removeEventListener('pointerdown', onPointerDown, true);
        document.removeEventListener('keydown', onKeydown, true);
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
      });
    });
  }

  private detachGlobalListeners(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }

  ngOnDestroy(): void {
    this.detachGlobalListeners();
  }
}

/**Attaches an AtmContextMenu to any element: right-click opens the menu atthe cursor. `atmContextMenuData` is echoed back in `itemClick` — perfectfor lists where every row shares the same menu instance.  <tr [atmContextMenu]="rowMenu" [atmContextMenuData]="row" [atmContextMenuHeader]="row.name">

## Identity

- **Class**: `AtmContextMenuTrigger`
- **Selector**: `[atmContextMenu]`
- **Kind**: Directive

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `atmContextMenu` | AtmContextMenu | yes | — |
| `atmContextMenuData` | unknown | no | — |
| `atmContextMenuHeader` | string | no | — |
| `atmContextMenuDisabled` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmContextMenuItem

```ts
export interface AtmContextMenuItem {
  label: string;
  /** Free-form command id, handy for switch/case no handler. */
  value?: unknown;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}
```

### AtmContextMenuOpenOptions

```ts
export interface AtmContextMenuOpenOptions {
  /** Overrides the `items` input for this opening (menus dinâmicos por alvo). */
  items?: AtmContextMenuItem[];
  /** Overrides the `header` input for this opening. */
  header?: string;
  /** Arbitrary payload (a linha, o node…) devolvido em cada `itemClick`. */
  data?: unknown;
}
```

### AtmContextMenuSelect

```ts
export interface AtmContextMenuSelect {
  item: AtmContextMenuItem;
  /** The `data` passed on open (e.g. the row / node under the cursor). */
  data?: unknown;
}
```

## Usage example

```html
<div [atmContextMenu]="menuRef">Clique direito</div>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
