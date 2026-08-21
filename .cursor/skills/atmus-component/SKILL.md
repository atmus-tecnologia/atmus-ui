---
name: atmus-component
description: Cria novos componentes para a biblioteca Atmus UI (projects/ngui, publicada no npm como @atmus/ngui) seguindo o design system do projeto — prefixo atm, sizes large/medium/slim, tokens de tema, dark mode, overlays viewport-aware e integração com forms. Usar sempre que o usuário pedir para criar, alterar ou padronizar um componente de UI neste projeto.
---

# Criando componentes Atmus UI

## Regras obrigatórias

1. **Local**: `projects/ngui/src/lib/components/<nome>/<nome>.component.ts`. A lib precisa continuar autocontida (publicável como `@atmus/ngui`). Nunca importe nada de fora de `projects/ngui/src/lib` dentro da lib.
2. **Seletor**: prefixo `atm-` (ex.: `atm-rating`). Classe `Atm<Nome>` sem sufixo Component.
3. **Standalone** (sem `standalone: true` — é default), `ChangeDetectionStrategy.OnPush`, `input()`/`output()`/`model()`/`signal()`/`computed()` — nunca decorators, nunca `@HostBinding/@HostListener` (usar `host: {}`).
4. **Size**: todo componente dimensionável recebe `readonly size = input<AtmSize>('medium')` com `large | medium | slim`. Alturas padrão: large=h-12, medium=h-10, slim=h-8 (constantes `ATM_SIZE_HEIGHT/TEXT/PX` em `projects/ngui/src/lib/types.ts`).
5. **Cores**: usar apenas classes Tailwind mapeadas para tokens: `bg-primary`, `text-ink`, `text-ink-muted`, `text-ink-faint`, `bg-surface`, `bg-surface-alt`, `border-line`, `bg-success-soft` etc. NUNCA cores fixas (`bg-indigo-500`) — assim o dark mode funciona sozinho. Componentes com cor semântica recebem `color = input<AtmColor>('primary')`.
6. **Ícones**: Atmus Icons via `<atm-icon name="nome" />` (preferido) ou
   `<i class="atm atm-nome">`. A classe base `atm` é obrigatória — sem ela o
   glifo não renderiza. Nunca SVG externo/lib de ícones diferente.
7. **Template inline** (template: `...`), CSS via Tailwind no template — não criar arquivos .html/.css separados.
8. **Registrar** o componente em `projects/ngui/src/public-api.ts` (export) e em `projects/ngui/src/lib/atmus-ui.module.ts` (array COMPONENTS).
9. **Showcase**: adicionar demo na página adequada de `src/app/showcase/pages/` (usar `<demo-section id="..." title="..." [code]="...">`) e o item no menu em `src/app/showcase/shell.component.ts`. Depois de mudar a lib, rode `npm run build:ngui` para o showcase pegar a versão nova.

## Classes utilitárias compartilhadas (em atmus.css)

- `.atm-field` — casca de campo (borda, radius, focus ring, hover). Modificadores: `.atm-field--invalid`, `.atm-field--disabled`.
- `.atm-focus` — focus-visible ring padrão.
- `.atm-panel` — painel flutuante (dropdown/popover): borda + sombra + radius.
- `.atm-option` — linha de opção em listas (`--active`, `--selected`, `--disabled`).
- Animações: `animate-atm-fade`, `animate-atm-pop` (painéis), `animate-atm-slide-up` (modais).

## Receitas por tipo de componente

### Campo de formulário (integra ngModel/formControl)
Estenda `AtmValueAccessor<T>` (em `projects/ngui/src/lib/utils/value-accessor.ts`) e registre o provider:

```typescript
@Component({
  selector: 'atm-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmRating), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `...`,
})
export class AtmRating extends AtmValueAccessor<number> {
  readonly size = input<AtmSize>('medium');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  // interação do usuário: this.setValue(v); blur: this.onTouched();
}
```

Inputs padrão de campos: `size`, `disabled`, `invalid`, `placeholder` (quando fizer sentido).

### Overlay (dropdown/popover/painel flutuante)
Estenda `AtmOverlayBase` (em `projects/ngui/src/lib/utils/overlay-base.ts`). Ela já resolve:
- posicionamento `position: fixed` com flip automático quando falta espaço na viewport;
- fechar com Escape / clique fora; reposicionar em scroll/resize (listeners passivos fora do NgZone).

```typescript
export class AtmMeuDropdown extends AtmOverlayBase {
  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  protected getTriggerEl() { return this.triggerRef()?.nativeElement ?? null; }
  protected getPanelEl() { return this.panelRef()?.nativeElement ?? null; }
  // this.open() / this.close() / this.toggle(); painel: @if (isOpen()) { <div #panel [style]="panelStyle()" class="atm-panel animate-atm-pop z-50"> }
}
```

Se precisar de CVA junto (como select), implemente `ControlValueAccessor` manualmente (veja `select.component.ts`).

Dropdowns com lista devem aceitar `[hasActionButton]` + `actionButtonLabel` + `(actionClick)` — botão de footer "Adicionar novo" (copiar o bloco de `select.component.ts`).

### Componente remoto (dados de API)
Receba `dataSource = input.required<AtmRemoteDataSource>()` (contrato em `projects/ngui/src/lib/services/rest.service.ts`, padrão nest-paginator: `?sortBy=id:DESC&page=1&search=x`). Busca com `Subject + debounceTime(300) + switchMap`, máx. 10 registros (`limit`), estados `loading/error/empty` visíveis. Referência: `dropdown-remote.component.ts`.

### Serviço de overlay imperativo (modal/toast)
Use `createComponent` + `appRef.attachView` + append no `document.body`. Referências: `dialog.service.ts` (retorna ref com `onClose`), `alert-dialog.service.ts` (retorna Promise). Modais devem ter botão expandir (90vw/90vh com margem) ao lado do fechar.

## Checklist final

- [ ] OnPush + signals, sem decorators legados
- [ ] `size` com large/medium/slim usando as constantes de types.ts
- [ ] Só cores de token (funciona no dark automaticamente — testar com a classe `.dark`)
- [ ] Acessibilidade: roles, aria-*, foco visível (`.atm-focus`), navegação por teclado em listas
- [ ] Exportado em `public-api.ts` + `atmus-ui.module.ts`
- [ ] Demo + menu no showcase
- [ ] `npx ng build ngui` sem erros
