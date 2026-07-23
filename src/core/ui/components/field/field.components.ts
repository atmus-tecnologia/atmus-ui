import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Form field label. <atm-label [required]="true">Name</atm-label> */
@Component({
  selector: 'atm-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label [attr.for]="for()" class="mb-1.5 block text-sm font-medium text-ink select-none">
      <ng-content />
      @if (required()) {
        <span class="ml-0.5 text-danger">*</span>
      }
    </label>
  `,
})
export class AtmLabel {
  readonly for = input<string | undefined>(undefined);
  readonly required = input(false);
}

/** Muted helper text below a field. */
@Component({
  selector: 'atm-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mt-1.5 block text-xs text-ink-muted' },
  template: `<ng-content />`,
})
export class AtmDescription {}

/** Error message below a field (alias: atm-field-error). */
@Component({
  selector: 'atm-error-message, atm-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'mt-1.5 flex items-center gap-1 text-xs font-medium text-danger animate-atm-fade',
    role: 'alert',
  },
  template: `<i class="icofont-warning-alt" aria-hidden="true"></i><ng-content />`,
})
export class AtmErrorMessage {}

/** Groups related fields with an optional legend. */
@Component({
  selector: 'atm-fieldset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset
      class="rounded-atm-lg border border-line p-4"
      [disabled]="disabled()"
      [class.opacity-60]="disabled()"
    >
      @if (legend()) {
        <legend class="px-2 text-sm font-semibold text-ink">{{ legend() }}</legend>
      }
      <div class="flex flex-col gap-4"><ng-content /></div>
    </fieldset>
  `,
})
export class AtmFieldset {
  readonly legend = input<string | undefined>(undefined);
  readonly disabled = input(false);
}
