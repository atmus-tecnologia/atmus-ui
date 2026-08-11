import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ATM_DATE_PRESETS,
  AtmCalendar,
  AtmDatePicker,
  AtmDateRange,
  AtmDateRangePicker,
  AtmLabel,
  AtmTimeField,
} from '@atmus/ngui';
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
      importCode="import { AtmCalendar, AtmDatePicker, AtmDateRangePicker, AtmTimeField } from '@atmus/ngui';"
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

      <demo-section
        id="date-picker-presets"
        title="DatePicker com atalhos"
        description="Passe [presets] para mostrar recomendações ao lado do calendário."
        [code]="presetsCode"
      >
        <div class="w-full max-w-xs">
          <atm-label>Data de entrega</atm-label>
          <atm-date-picker [(ngModel)]="deliveryDate" [presets]="datePresets" />
        </div>
        <span class="text-sm text-ink-muted">
          valor: {{ deliveryDate()?.toLocaleDateString('pt-BR') ?? '—' }}
        </span>
      </demo-section>

      <demo-section
        id="date-range-picker"
        title="DateRangePicker"
        description="Dois meses lado a lado + recomendações de período por padrão.
          Use [months]='1' e [presets]='[]' para a versão compacta."
        [code]="rangePickerCode"
      >
        <div class="w-full max-w-xs">
          <atm-label>Período do relatório</atm-label>
          <atm-date-range-picker [(ngModel)]="reportRange" />
        </div>
      </demo-section>

      <demo-section
        id="date-range-picker-confirm"
        title="DateRangePicker com confirmar"
        description="Com [confirm]='true' a mudança só é aplicada ao clicar em Confirmar —
          Cancelar (ou fechar) descarta e a lixeira limpa a seleção."
        [code]="confirmCode"
      >
        <div class="w-full max-w-xs">
          <atm-label>Período de faturamento</atm-label>
          <atm-date-range-picker [(ngModel)]="billingRange" [confirm]="true" />
        </div>
        <span class="text-sm text-ink-muted">
          aplicado: {{ billingRange()?.start?.toLocaleDateString('pt-BR') ?? '—' }} até
          {{ billingRange()?.end?.toLocaleDateString('pt-BR') ?? '—' }}
        </span>
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
  readonly deliveryDate = signal<Date | null>(null);
  readonly reportRange = signal<AtmDateRange | null>(null);
  readonly billingRange = signal<AtmDateRange | null>(null);
  readonly time = signal<string | null>('09:30');
  readonly datePresets = ATM_DATE_PRESETS;

  readonly calendarCode = `<atm-calendar [(value)]="date" [minDate]="min" [maxDate]="max" />`;
  readonly rangeCalendarCode = `<atm-calendar [range]="true" [(rangeValue)]="range" />`;
  readonly datePickerCode = `<atm-date-picker [(ngModel)]="birthday" placeholder="dd/mm/aaaa" />`;
  readonly editableCode = `<atm-date-picker [editable]="true" [(ngModel)]="issueDate" />`;
  readonly presetsCode = `import { ATM_DATE_PRESETS } from '@atmus/ngui';

<atm-date-picker [(ngModel)]="deliveryDate" [presets]="datePresets" />
<!-- ou presets próprios: [{ label: 'Hoje', value: () => new Date() }, ...] -->`;
  readonly rangePickerCode = `<!-- padrão: 2 meses + recomendações (ATM_RANGE_PRESETS) -->
<atm-date-range-picker [(ngModel)]="reportRange" />

<!-- compacto: 1 mês, sem recomendações -->
<atm-date-range-picker [(ngModel)]="reportRange" [months]="1" [presets]="[]" />
<!-- valor: { start: Date, end: Date } -->`;
  readonly confirmCode = `<atm-date-range-picker [(ngModel)]="billingRange" [confirm]="true" />
<!-- [confirm] também existe no atm-date-picker -->`;
  readonly timeCode = `<atm-time-field [(ngModel)]="time" />
<!-- valor: 'HH:mm' -->`;
}
