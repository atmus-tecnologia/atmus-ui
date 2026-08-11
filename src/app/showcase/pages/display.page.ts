import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AtmAccordion,
  AtmAccordionItem,
  AtmAvatar,
  AtmAvatarGroup,
  AtmBadge,
  AtmButton,
  AtmCard,
  AtmChip,
  AtmKbd,
  AtmLink,
  AtmQrcode,
  AtmScrollShadow,
  AtmSeparator,
  AtmSurface,
  AtmTab,
  AtmTabs,
  AtmTypography,
} from '@atmus/ngui';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'display-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AtmAvatar,
    AtmAvatarGroup,
    AtmBadge,
    AtmChip,
    AtmCard,
    AtmSurface,
    AtmAccordion,
    AtmAccordionItem,
    AtmTabs,
    AtmTab,
    AtmTypography,
    AtmKbd,
    AtmLink,
    AtmQrcode,
    AtmSeparator,
    AtmScrollShadow,
    AtmButton,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Exibição"
      description="Componentes de apresentação de conteúdo."
      importCode="import { AtmAvatar, AtmBadge, AtmChip, AtmCard, AtmAccordion, AtmTabs, ... } from '@atmus/ngui';"
    >
      <demo-section id="avatar" title="Avatar" description="Iniciais com cor determinística pelo nome." [code]="avatarCode">
        <atm-avatar size="large" name="Ana Souza" status="online" />
        <atm-avatar name="Bruno Costa" status="busy" />
        <atm-avatar size="slim" name="Carla Dias" />
        <atm-avatar name="Retrato" src="https://i.pravatar.cc/80?img=5" status="away" />
        <atm-avatar name="Quadrado" [square]="true" />
      </demo-section>

      <demo-section
        id="avatar-group"
        title="Avatar múltiplo"
        description="Lista empilhada com limite visível e bolha +N. Use tooltipKey para o texto do hover."
        [code]="avatarGroupCode"
      >
        <atm-avatar-group [items]="team" [max]="4" tooltipKey="name" />
        <atm-avatar-group [items]="team" [max]="3" size="slim" tooltipKey="name" />
      </demo-section>

      <demo-section id="badge" title="Badge" [code]="badgeCode">
        <atm-badge>Padrão</atm-badge>
        <atm-badge color="success" [dot]="true">Ativo</atm-badge>
        <atm-badge color="danger" variant="solid">9+</atm-badge>
        <atm-badge color="warning" variant="outline">Pendente</atm-badge>
        <atm-badge color="neutral" size="slim">slim</atm-badge>
      </demo-section>

      <demo-section id="chip" title="Chip" [code]="chipCode">
        @for (tag of chips(); track tag) {
          <atm-chip color="primary" icon="tag" [removable]="true" (removed)="removeChip(tag)">
            {{ tag }}
          </atm-chip>
        }
        <atm-chip color="success" size="large">Large</atm-chip>
        <atm-chip size="slim">Slim</atm-chip>
      </demo-section>

      <demo-section
        id="qrcode"
        title="QRCode"
        description="Encoder embutido (sem dependências). Tamanho em px, cores customizadas e três estilos de pontos: square, rounded e dots."
        [code]="qrcodeCode"
      >
        <div class="flex w-full flex-wrap items-center justify-center gap-8">
          <atm-qrcode value="https://atmus.dev" [size]="120" />
          <atm-qrcode value="https://atmus.dev" [size]="120" dotStyle="rounded" color="#7c3aed" />
          <atm-qrcode value="https://atmus.dev" [size]="120" dotStyle="dots" color="#0891b2" />
          <atm-qrcode
            value="https://atmus.dev"
            [size]="120"
            color="#ffffff"
            background="#312e81"
          />
        </div>
      </demo-section>

      <demo-section
        id="qrcode-custom"
        title="QRCode — Logo & moldura"
        description="Logo central (correção de erro sobe para H automaticamente) e moldura decorativa nos 4 cantos via [frame]. logoSize, logoPadding e frameColor ajustam o visual."
        [code]="qrcodeCustomCode"
      >
        <div class="flex w-full flex-wrap items-center justify-center gap-10">
          <atm-qrcode
            value="https://atmus.dev/components"
            [size]="180"
            dotStyle="rounded"
            color="#7c3aed"
            [logo]="qrLogo"
            [frame]="true"
          />
          <atm-qrcode
            value="https://atmus.dev/components"
            [size]="180"
            [logo]="qrLogo"
            [logoSize]="0.26"
            [frame]="true"
            frameColor="#0891b2"
          />
        </div>
      </demo-section>

      <demo-section id="card" title="Card" [code]="cardCode">
        <div class="grid w-full gap-4 sm:grid-cols-2">
          <atm-card header="Título do card" subheader="Descrição de apoio">
            <p class="text-sm text-ink-muted">Conteúdo do card com padding padrão.</p>
            <div footer class="flex justify-end">
              <atm-button size="slim" variant="soft">Ação</atm-button>
            </div>
          </atm-card>
          <atm-card header="Hoverable" subheader="Passe o mouse" [hoverable]="true">
            <p class="text-sm text-ink-muted">Elevação suave ao passar o mouse.</p>
          </atm-card>
        </div>
      </demo-section>

      <demo-section id="surface" title="Surface" [code]="surfaceCode">
        <div class="grid w-full gap-4 sm:grid-cols-3">
          <atm-surface><span class="text-sm">default</span></atm-surface>
          <atm-surface variant="alt"><span class="text-sm">alt</span></atm-surface>
          <atm-surface variant="raised"><span class="text-sm">raised</span></atm-surface>
        </div>
      </demo-section>

      <demo-section
        id="accordion"
        title="Accordion / Disclosure"
        description="Exclusivo por padrão; [multiple]=true permite vários abertos."
        [code]="accordionCode"
      >
        <atm-accordion class="w-full">
          <atm-accordion-item header="O que é o Atmus UI?" [expanded]="true">
            Uma biblioteca de componentes Angular pensada para ser copiada entre projetos.
          </atm-accordion-item>
          <atm-accordion-item header="Como funciona o tema escuro?">
            A classe .dark no html troca os tokens CSS; os componentes não precisam saber de nada.
          </atm-accordion-item>
          <atm-accordion-item header="Posso customizar as cores?" icon="paint">
            Sim — basta sobrescrever as variáveis --atm-* no :root do seu projeto.
          </atm-accordion-item>
        </atm-accordion>
      </demo-section>

      <demo-section id="tabs" title="Tabs" description="Conteúdo lazy — só a tab ativa renderiza." [code]="tabsCode">
        <div class="w-full">
          <atm-tabs>
            <atm-tab label="Geral" icon="gear">
              <p class="text-sm text-ink-muted">Configurações gerais do sistema.</p>
            </atm-tab>
            <atm-tab label="Notificações" icon="notification" [badge]="3">
              <p class="text-sm text-ink-muted">Preferências de notificação.</p>
            </atm-tab>
            <atm-tab label="Bloqueada" [disabled]="true">
              <p class="text-sm text-ink-muted">Nunca renderiza.</p>
            </atm-tab>
          </atm-tabs>
          <div class="mt-6">
            <atm-tabs variant="pill">
              <atm-tab label="Pill 1"><p class="text-sm text-ink-muted">Variante pill.</p></atm-tab>
              <atm-tab label="Pill 2"><p class="text-sm text-ink-muted">Conteúdo 2.</p></atm-tab>
            </atm-tabs>
          </div>
          <div class="mt-6">
            <atm-tabs variant="segmented">
              <atm-tab label="Ativa"><p class="text-sm text-ink-muted">Variante segmented — trilho arredondado.</p></atm-tab>
              <atm-tab label="Desabilitada" [disabled]="true"><p class="text-sm text-ink-muted">Nunca renderiza.</p></atm-tab>
              <atm-tab label="Disponível"><p class="text-sm text-ink-muted">Esta tab também está disponível.</p></atm-tab>
            </atm-tabs>
          </div>
        </div>
      </demo-section>

      <demo-section
        id="tabs-overflow"
        title="Tabs — Overflow"
        description="Quando as tabs excedem a largura disponível, chevrons de rolagem com bordas esmaecidas aparecem automaticamente (em qualquer variante). Setas do teclado também navegam."
        [code]="tabsOverflowCode"
      >
        <div class="flex w-full flex-col gap-6">
          <div class="max-w-[420px]">
            <atm-tabs variant="segmented">
              @for (item of overflowTabs; track item) {
                <atm-tab [label]="item">
                  <p class="text-sm text-ink-muted">Conteúdo do painel {{ item }}.</p>
                </atm-tab>
              }
            </atm-tabs>
          </div>
          <div class="max-w-[420px]">
            <atm-tabs variant="line">
              @for (item of overflowTabs; track item) {
                <atm-tab [label]="item">
                  <p class="text-sm text-ink-muted">Conteúdo do painel {{ item }}.</p>
                </atm-tab>
              }
            </atm-tabs>
          </div>
        </div>
      </demo-section>

      <demo-section id="typography" title="Typography" [code]="typographyCode">
        <div class="flex w-full flex-col gap-2">
          <atm-typography variant="h1">Heading 1</atm-typography>
          <atm-typography variant="h3">Heading 3</atm-typography>
          <atm-typography variant="body">Texto de corpo padrão para parágrafos.</atm-typography>
          <atm-typography variant="muted">Texto secundário muted.</atm-typography>
          <atm-typography variant="code">const x = 'inline code';</atm-typography>
        </div>
      </demo-section>

      <demo-section id="misc" title="Kbd & Link" [code]="miscCode">
        <span class="flex items-center gap-1 text-sm text-ink-muted">
          Pressione <atm-kbd>Ctrl</atm-kbd> + <atm-kbd>K</atm-kbd> para buscar
        </span>
        <atm-separator [vertical]="true" />
        <atm-link href="https://angular.dev" [external]="true">Documentação Angular</atm-link>
      </demo-section>

      <demo-section id="separator" title="Separator" [code]="separatorCode">
        <div class="flex w-full flex-col gap-4">
          <atm-separator />
          <atm-separator label="ou" />
        </div>
      </demo-section>

      <demo-section
        id="scroll-shadow"
        title="ScrollShadow"
        description="Máscara de gradiente indica conteúdo rolável."
        [code]="scrollCode"
      >
        <atm-scroll-shadow maxHeight="10rem" class="w-full max-w-sm">
          @for (i of lines; track i) {
            <p class="py-1.5 text-sm text-ink-muted">Linha de conteúdo {{ i }}</p>
          }
        </atm-scroll-shadow>
      </demo-section>
    </demo-page>
  `,
})
export class DisplayPage {
  readonly chips = signal(['design', 'frontend']);
  readonly lines = Array.from({ length: 20 }, (_, i) => i + 1);

  removeChip(tag: string): void {
    this.chips.update((list) => list.filter((t) => t !== tag));
  }

  readonly avatarCode = `<atm-avatar size="large" name="Ana Souza" status="online" />
<atm-avatar name="Retrato" src="https://..." />
<atm-avatar name="Quadrado" [square]="true" />`;

  readonly team = [
    { name: 'Ana Souza', src: 'https://i.pravatar.cc/80?img=1' },
    { name: 'Bruno Costa', src: 'https://i.pravatar.cc/80?img=3' },
    { name: 'Carla Dias', src: 'https://i.pravatar.cc/80?img=5' },
    { name: 'Diego Melo', src: 'https://i.pravatar.cc/80?img=8' },
    { name: 'Elena Reis' },
    { name: 'Fábio Nunes' },
    { name: 'Gabi Rocha' },
    { name: 'Hugo Lima' },
    { name: 'Iris Prado' },
    { name: 'João Alves' },
  ];

  readonly avatarGroupCode = `<atm-avatar-group [items]="team" [max]="4" tooltipKey="name" />

// team: { name: string; src?: string }[]
// srcKey / nameKey / tooltipKey aceitam caminhos aninhados (ex.: "user.name")`;

  readonly badgeCode = `<atm-badge color="success" [dot]="true">Ativo</atm-badge>
<atm-badge color="danger" variant="solid">9+</atm-badge>
<atm-badge color="warning" variant="outline">Pendente</atm-badge>`;

  readonly chipCode = `<atm-chip color="primary" icon="tag" [removable]="true" (removed)="remove(tag)">
  {{ tag }}
</atm-chip>`;

  /** Logo de exemplo (SVG inline — em produção use a URL da sua marca). */
  readonly qrLogo =
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#7c3aed"/><text x="24" y="33" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#fff" text-anchor="middle">A</text></svg>`,
    );

  readonly qrcodeCode = `<atm-qrcode value="https://atmus.dev" [size]="120" />
<atm-qrcode value="..." dotStyle="rounded" color="#7c3aed" />
<atm-qrcode value="..." dotStyle="dots" color="#0891b2" />
<atm-qrcode value="..." color="#ffffff" background="#312e81" />`;

  readonly qrcodeCustomCode = `<atm-qrcode
  value="https://atmus.dev/components"
  [size]="180"
  dotStyle="rounded"
  color="#7c3aed"
  [logo]="logoUrl"
  [logoSize]="0.22"
  [frame]="true"
  frameColor="#0891b2"
/>

<!-- Exportar: viewChild + qr.download('qrcode.png') ou qr.toDataUrl() -->`;

  readonly cardCode = `<atm-card header="Título" subheader="Descrição" [hoverable]="true">
  conteúdo
  <div footer>ações</div>
</atm-card>`;

  readonly surfaceCode = `<atm-surface variant="alt">conteúdo</atm-surface>`;

  readonly accordionCode = `<atm-accordion [multiple]="false">
  <atm-accordion-item header="Pergunta 1" [expanded]="true">Resposta 1</atm-accordion-item>
  <atm-accordion-item header="Pergunta 2">Resposta 2</atm-accordion-item>
</atm-accordion>`;

  readonly tabsCode = `<!-- variant: line | pill | enclosed | segmented -->
<atm-tabs variant="line">
  <atm-tab label="Geral" icon="gear">...</atm-tab>
  <atm-tab label="Notificações" [badge]="3">...</atm-tab>
</atm-tabs>

<atm-tabs variant="segmented">
  <atm-tab label="Ativa">...</atm-tab>
  <atm-tab label="Desabilitada" [disabled]="true">...</atm-tab>
</atm-tabs>`;

  readonly overflowTabs = [
    'Visão geral',
    'Analytics',
    'Relatórios',
    'Performance',
    'Integrações',
    'Faturamento',
    'Equipe',
    'Configurações',
  ];

  readonly tabsOverflowCode = `<!-- Overflow automático: basta limitar a largura do container -->
<div class="max-w-[420px]">
  <atm-tabs variant="segmented">
    @for (item of items; track item) {
      <atm-tab [label]="item">...</atm-tab>
    }
  </atm-tabs>
</div>`;

  readonly typographyCode = `<atm-typography variant="h1">Heading 1</atm-typography>
<atm-typography variant="muted">Texto secundário</atm-typography>`;

  readonly miscCode = `<atm-kbd>Ctrl</atm-kbd> + <atm-kbd>K</atm-kbd>
<atm-link href="https://angular.dev" [external]="true">Docs</atm-link>`;

  readonly separatorCode = `<atm-separator />
<atm-separator label="ou" />
<atm-separator [vertical]="true" />`;

  readonly scrollCode = `<atm-scroll-shadow maxHeight="10rem">conteúdo longo...</atm-scroll-shadow>`;
}
