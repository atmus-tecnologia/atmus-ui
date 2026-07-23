import { Directive, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * Base class implementing the ControlValueAccessor boilerplate.
 * Components extend it and call `this.setValue(v)` on user interaction.
 */
@Directive()
export abstract class AtmValueAccessor<T> implements ControlValueAccessor {
  readonly value = signal<T | null>(null);
  readonly disabledByForm = signal(false);

  protected onChange: (value: T | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: T | null): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  /** Update value from user interaction (propagates to the form). */
  protected setValue(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
  }
}
