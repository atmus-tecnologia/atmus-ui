import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AtmButton,
  AtmDescription,
  AtmErrorMessage,
  AtmFieldset,
  AtmInput,
  AtmInputGroup,
  AtmInputOtp,
  AtmLabel,
  AtmNumberField,
  AtmSearchField,
  AtmTagGroup,
  AtmTextarea,
  AtmToastService,
} from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'inputs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AtmInput,
    AtmInputGroup,
    AtmTextarea,
    AtmNumberField,
    AtmSearchField,
    AtmInputOtp,
    AtmTagGroup,
    AtmLabel,
    AtmDescription,
    AtmErrorMessage,
    AtmFieldset,
    AtmButton,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Entradas"
      description="Um único atm-input cobre text, email, password, tel e url via [type]. Senha ganha toggle de visibilidade automático."
      importCode="import { AtmInput, AtmInputGroup, AtmTextarea, AtmNumberField, AtmSearchField, AtmInputOtp, AtmTagGroup } from 'src/core/ui';"
    >
      <demo-section
        id="input"
        title="Input"
        description="Tipos, ícones, clearable e estados."
        [code]="inputCode"
      >
        <div class="grid w-full gap-4 sm:grid-cols-2">
          <div>
            <atm-label>Nome</atm-label>
            <atm-input placeholder="Seu nome" icon="user" [clearable]="true" [(ngModel)]="name" />
          </div>
          <div>
            <atm-label>E-mail</atm-label>
            <atm-input type="email" placeholder="voce@empresa.com" icon="envelope" />
          </div>
          <div>
            <atm-label>Senha</atm-label>
            <atm-input type="password" placeholder="••••••••" icon="lock" />
            <atm-description>Mínimo de 8 caracteres.</atm-description>
          </div>
          <div>
            <atm-label>Com erro</atm-label>
            <atm-input placeholder="Campo inválido" [invalid]="true" />
            <atm-error-message>Este campo é obrigatório.</atm-error-message>
          </div>
        </div>
      </demo-section>

      <demo-section title="Tamanhos" [code]="sizesCode">
        <div class="flex w-full flex-col gap-3">
          <atm-input size="large" placeholder="large · h-12" />
          <atm-input size="medium" placeholder="medium · h-10" />
          <atm-input size="slim" placeholder="slim · h-8" />
        </div>
      </demo-section>

      <demo-section
        id="input-mask"
        title="InputMask"
        description="Formato com tokens: 9 = dígito, a = letra, * = alfanumérico. O valor do form sai sempre SEM máscara. Máscara incompleta deixa o control invalid e é LIMPA no blur. Máscara dupla via || (ex.: CPF/CNPJ)."
        [code]="maskCode"
      >
        <div class="grid w-full gap-4 sm:grid-cols-2">
          <div>
            <atm-label>Telefone</atm-label>
            <atm-input
              mask="(99) 99999-9999"
              placeholder="(11) 98765-4321"
              icon="phone"
              [(ngModel)]="phone"
              #phoneModel="ngModel"
              [invalid]="!!phoneModel.invalid && !!phoneModel.touched"
            />
            @if (phoneModel.invalid && phoneModel.touched) {
              <atm-error-message>Telefone incompleto.</atm-error-message>
            }
          </div>
          <div>
            <atm-label>Data</atm-label>
            <atm-input mask="99/99/9999" placeholder="dd/mm/aaaa" icon="calendar" />
          </div>
          <div>
            <atm-label>Cartão</atm-label>
            <atm-input mask="9999 9999 9999 9999" placeholder="0000 0000 0000 0000" icon="credit-card" />
          </div>
          <div>
            <atm-label>CPF / CNPJ (máscara dupla)</atm-label>
            <atm-input
              mask="999.999.999-99||99.999.999/9999-99"
              placeholder="CPF ou CNPJ"
              [(ngModel)]="document"
            />
          </div>
        </div>
        <span class="text-sm text-ink-muted">
          telefone (sem máscara): "{{ phone() }}" · cpf/cnpj: "{{ document() }}"
        </span>
      </demo-section>

      <demo-section
        id="input-currency"
        title="Currency"
        description="type=&quot;currency&quot; formata enquanto digita (estilo caixa eletrônico). O valor do form é um number puro."
        [code]="currencyCode"
      >
        <div class="grid w-full gap-4 sm:grid-cols-2">
          <div>
            <atm-label>Preço (BRL)</atm-label>
            <atm-input type="currency" placeholder="R$ 0,00" [(ngModel)]="price" />
          </div>
          <div>
            <atm-label>Preço (USD)</atm-label>
            <atm-input type="currency" currency="USD" locale="en-US" placeholder="$0.00" />
          </div>
        </div>
        <span class="text-sm text-ink-muted">valor: {{ price() ?? 'null' }}</span>
      </demo-section>

      <demo-section
        id="input-group"
        title="InputGroup"
        description="Prefixos e sufixos colados no campo."
        [code]="groupCode"
      >
        <div class="flex w-full flex-col gap-3">
          <atm-input-group prefix="https://" suffix=".com.br">
            <atm-input placeholder="meusite" />
          </atm-input-group>
          <atm-input-group prefix="R$">
            <atm-input type="number" placeholder="0,00" />
          </atm-input-group>
        </div>
      </demo-section>

      <demo-section id="textarea" title="TextArea" [code]="textareaCode">
        <div class="w-full">
          <atm-label>Observações</atm-label>
          <atm-textarea placeholder="Escreva aqui..." [rows]="4" [maxlength]="200" />
        </div>
      </demo-section>

      <demo-section
        id="number-field"
        title="NumberField"
        description="Steppers com min/max/step."
        [code]="numberCode"
      >
        <div class="w-48">
          <atm-number-field [(ngModel)]="quantity" [min]="0" [max]="99" />
        </div>
        <span class="text-sm text-ink-muted">valor: {{ quantity() }}</span>
      </demo-section>

      <demo-section
        id="search-field"
        title="SearchField"
        description="Busca com debounce de 300ms no output (search)."
        [code]="searchCode"
      >
        <div class="w-full max-w-sm">
          <atm-search-field (search)="lastSearch.set($event)" />
        </div>
        <span class="text-sm text-ink-muted">buscou: "{{ lastSearch() }}"</span>
      </demo-section>

      <demo-section
        id="input-otp"
        title="InputOTP"
        description="Auto-avanço, colar código completo e evento (completed)."
        [code]="otpCode"
      >
        <atm-input-otp [length]="6" (completed)="toast.success('Código completo', $event)" />
      </demo-section>

      <demo-section
        id="tag-group"
        title="TagGroup"
        description="Enter ou vírgula adiciona; Backspace remove."
        [code]="tagsCode"
      >
        <div class="w-full max-w-md">
          <atm-tag-group [(ngModel)]="tags" />
        </div>
      </demo-section>

      <demo-section
        id="form"
        title="Form completo"
        description="Reactive Forms + Fieldset + validação."
        [code]="formCode"
        language="typescript"
      >
        <form [formGroup]="form" (ngSubmit)="submit()" class="w-full max-w-lg">
          <atm-fieldset legend="Novo contato">
            <div>
              <atm-label [required]="true">Nome</atm-label>
              <atm-input
                formControlName="name"
                placeholder="Nome completo"
                [invalid]="isInvalid('name')"
              />
              @if (isInvalid('name')) {
                <atm-error-message>Informe o nome.</atm-error-message>
              }
            </div>
            <div>
              <atm-label [required]="true">E-mail</atm-label>
              <atm-input
                type="email"
                formControlName="email"
                placeholder="voce@empresa.com"
                [invalid]="isInvalid('email')"
              />
              @if (isInvalid('email')) {
                <atm-error-message>E-mail inválido.</atm-error-message>
              }
            </div>
            <atm-button type="submit">Salvar contato</atm-button>
          </atm-fieldset>
        </form>
      </demo-section>
    </demo-page>
  `,
})
export class InputsPage {
  readonly toast = inject(AtmToastService);
  private readonly fb = inject(FormBuilder);

  readonly name = signal('');
  readonly phone = signal('');
  readonly document = signal('');
  readonly price = signal<number | null>(null);
  readonly quantity = signal<number | null>(1);
  readonly lastSearch = signal('');
  readonly tags = signal<string[]>(['angular', 'tailwind']);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && c.touched;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.toast.success('Contato salvo', JSON.stringify(this.form.value));
      this.form.reset();
    }
  }

  readonly inputCode = `<atm-input placeholder="Seu nome" icon="user" [clearable]="true" [(ngModel)]="name" />
<atm-input type="email" placeholder="voce@empresa.com" icon="envelope" />
<atm-input type="password" placeholder="••••••••" icon="lock" />
<atm-input placeholder="Campo inválido" [invalid]="true" />`;

  readonly sizesCode = `<atm-input size="large" placeholder="large · h-12" />
<atm-input size="medium" placeholder="medium · h-10" />
<atm-input size="slim" placeholder="slim · h-8" />`;

  readonly maskCode = `<!-- 9 = dígito, a = letra, * = alfanumérico; o resto é literal -->
<!-- máscara incompleta => control invalid: { maskIncomplete: { requiredLength, actualLength } } -->
<atm-input
  mask="(99) 99999-9999"
  [(ngModel)]="phone"
  #phoneModel="ngModel"
  [invalid]="!!phoneModel.invalid && !!phoneModel.touched"
/>  <!-- form: "11987654321" -->
<atm-input mask="99/99/9999" placeholder="dd/mm/aaaa" />
<atm-input mask="9999 9999 9999 9999" />

<!-- máscara dupla: escolhe pela quantidade digitada (11 => CPF, 12+ => CNPJ) -->
<atm-input mask="999.999.999-99||99.999.999/9999-99" [(ngModel)]="document" />`;

  readonly currencyCode = `<!-- form value é number puro (ex.: 1234.56) -->
<atm-input type="currency" [(ngModel)]="price" />
<atm-input type="currency" currency="USD" locale="en-US" />`;

  readonly groupCode = `<atm-input-group prefix="https://" suffix=".com.br">
  <atm-input placeholder="meusite" />
</atm-input-group>`;

  readonly textareaCode = `<atm-textarea placeholder="Escreva aqui..." [rows]="4" [maxlength]="200" />`;

  readonly numberCode = `<atm-number-field [(ngModel)]="quantity" [min]="0" [max]="99" [step]="1" />`;

  readonly searchCode = `<atm-search-field [debounce]="300" (search)="onSearch($event)" />`;

  readonly otpCode = `<atm-input-otp [length]="6" (completed)="verify($event)" />`;

  readonly tagsCode = `<atm-tag-group [(ngModel)]="tags" [maxTags]="10" />`;

  readonly formCode = `form = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
});

<form [formGroup]="form" (ngSubmit)="submit()">
  <atm-fieldset legend="Novo contato">
    <atm-label [required]="true">Nome</atm-label>
    <atm-input formControlName="name" [invalid]="isInvalid('name')" />
    @if (isInvalid('name')) {
      <atm-error-message>Informe o nome.</atm-error-message>
    }
    <atm-button type="submit">Salvar contato</atm-button>
  </atm-fieldset>
</form>`;
}
