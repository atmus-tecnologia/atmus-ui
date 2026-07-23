import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmCalendar,
  AtmDatePicker,
  AtmDateRange,
  AtmDateRangePicker,
  AtmLabel,
  AtmTimeField,
} from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'dates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmCalendar,
    AtmDatePicker,
    AtmDateRangePicker,
    AtmTimeField,
    AtmLabel,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Datas"
      description="Calendário, pickers de data e período, e campo de hora — pt-BR (dd/mm/aaaa)."
      importCode="import { AtmCalendar, AtmDatePicker, AtmDateRangePicker, AtmTimeField } from 'src/core/ui';"
    >
      <demo-section id="calendar" title="Calendar" [code]="calendarCode">
        <atm-calendar [(value)]="date" />
        <span class="text-sm text-ink-muted">
          selecionado: {{ date()?.toLocaleDateString('pt-BR') ?? '—' }}
        </span>
      </demo-section>

      <demo-section
        id="range-calendar"
        title="RangeCalendar"
        description="Mesmo componente com [range]=true — hover mostra a prévia do período."
        [code]="rangeCalendarCode"
      >
        <atm-calendar [range]="true" [(rangeValue)]="calRange" />
        <span class="text-sm text-ink-muted">
          {{ calRange().start?.toLocaleDateString('pt-BR') ?? '—' }} até
          {{ calRange().end?.toLocaleDateString('pt-BR') ?? '—' }}
        </span>
      </demo-section>

      <demo-section id="date-picker" title="DatePicker" [code]="datePickerCode">
        <div class="w-full max-w-xs">
          <atm-label>Data de nascimento</atm-label>
          <atm-date-picker [(ngModel)]="birthday" />
        </div>
      </demo-section>

      <demo-section
        id="date-picker-editable"
        title="DatePicker editável"
        description="Input digitável com máscara dd/mm/aaaa — o calendário abre pelo ícone."
        [code]="editableCode"
      >
        <div class="w-full max-w-xs">
          <atm-label>Data de emissão</atm-label>
          <atm-date-picker [editable]="true" [(ngModel)]="issueDate" />
        </div>
        <span class="text-sm text-ink-muted">
          valor: {{ issueDate()?.toLocaleDateString('pt-BR') ?? '—' }}
        </span>
      </demo-section>

      <demo-section id="date-range-picker" title="DateRangePicker" [code]="rangePickerCode">
        <div class="w-full max-w-xs">
          <atm-label>Período do relatório</atm-label>
          <atm-date-range-picker [(ngModel)]="reportRange" />
        </div>
      </demo-section>

      <demo-section id="time-field" title="TimeField" [code]="timeCode">
        <div class="w-40">
          <atm-label>Horário</atm-label>
          <atm-time-field [(ngModel)]="time" />
        </div>
        <span class="text-sm text-ink-muted">valor: {{ time() ?? '—' }}</span>
      </demo-section>
    </demo-page>
  `,
})
export class DatesPage {
  readonly date = signal<Date | null>(new Date());
  readonly calRange = signal<AtmDateRange>({ start: null, end: null });
  readonly birthday = signal<Date | null>(null);
  readonly issueDate = signal<Date | null>(null);
  readonly reportRange = signal<AtmDateRange | null>(null);
  readonly time = signal<string | null>('09:30');

  readonly calendarCode = `<atm-calendar [(value)]="date" [minDate]="min" [maxDate]="max" />`;
  readonly rangeCalendarCode = `<atm-calendar [range]="true" [(rangeValue)]="range" />`;
  readonly datePickerCode = `<atm-date-picker [(ngModel)]="birthday" placeholder="dd/mm/aaaa" />`;
  readonly editableCode = `<atm-date-picker [editable]="true" [(ngModel)]="issueDate" />`;
  readonly rangePickerCode = `<atm-date-range-picker [(ngModel)]="reportRange" />
<!-- valor: { start: Date, end: Date } -->`;
  readonly timeCode = `<atm-time-field [(ngModel)]="time" />
<!-- valor: 'HH:mm' -->`;
}
