import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';

export interface AtmDropdownItem {
  label: string;
  value?: unknown;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

/**
 * Action menu dropdown. The trigger is projected content:
 *   <atm-dropdown [items]="items" (itemClick)="...">
 *     <atm-button>Options</atm-button>
 *   </atm-dropdown>
 * Flips up automatically when there is no viewport space below.
 */
@Component({
  selector: 'atm-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  template: `
    <div #trigger class="inline-block cursor-pointer" (click)="!disabled() && toggle()">
      <ng-content />
    </div>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex min-w-48 flex-col overflow-hidden"
        role="menu"
      >
        <div class="flex-1 overflow-y-auto p-1.5">
          @for (item of items(); track item.label) {
            @if (item.separatorBefore) {
              <div class="my-1.5 h-px bg-line"></div>
            }
            <button
              type="button"
              class="atm-option py-2"
              [class.atm-option--disabled]="item.disabled"
              [class.text-danger!]="item.danger"
              role="menuitem"
              (click)="onItemClick(item)"
            >
              @if (item.icon) {
                <i
                  [class]="'w-4 text-center atm atm-' + item.icon"
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
        @if (hasActionButton()) {
          <div class="border-t border-line p-1.5">
            <button
              type="button"
              class="atm-focus flex w-full cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--atm-radius)-4px)]
                px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
              (click)="onActionClick()"
            >
              <i class="atm atm-plus-sign" aria-hidden="true"></i>
              {{ actionButtonLabel() }}
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class AtmDropdown extends AtmOverlayBase {
  readonly size = input<AtmSize>('medium');
  readonly items = input<AtmDropdownItem[]>([]);
  readonly disabled = input(false);
  readonly hasActionButton = input(false);
  readonly actionButtonLabel = input('Adicionar novo');

  readonly itemClick = output<AtmDropdownItem>();
  readonly actionClick = output<void>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    super();
    this.matchTriggerWidth = false;
  }

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  onItemClick(item: AtmDropdownItem): void {
    if (item.disabled) return;
    this.itemClick.emit(item);
    this.close();
  }

  onActionClick(): void {
    this.actionClick.emit();
    this.close();
  }
}
