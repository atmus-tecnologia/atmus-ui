import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import {
  AtmButton,
  AtmContextMenu,
  AtmContextMenuItem,
  AtmContextMenuSelect,
  AtmFlow,
  AtmFlowConnectEnd,
  AtmFlowContextMenuEvent,
  AtmFlowEdge,
  AtmFlowGroupChange,
  AtmFlowNode,
  AtmFlowNodeDef,
  AtmFlowNodeHandle,
  AtmToastService,
  atmUid,
} from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';

/**
 * Exemplo de node 100% componentizado — recebe id/data como inputs e
 * posiciona os próprios <atm-flow-handle> (input à esquerda, dois outputs
 * nomeados à direita), como o fNodeInput/fNodeOutput da Foundation Flow.
 */
@Component({
  selector: 'node-send-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmFlowNodeHandle],
  host: { class: 'block' },
  template: `
    <div
      class="relative w-64 rounded-atm-lg border bg-surface shadow-sm transition-shadow"
      [class]="selected() ? 'border-primary ring-2 ring-[var(--atm-ring)]' : 'border-line'"
    >
      <div class="flex items-center gap-2.5 border-b border-line px-3 py-2.5">
        <span class="flex size-8 items-center justify-center rounded-lg bg-[#6366f1] text-base text-white">
          <i class="icofont-speech-comments" aria-hidden="true"></i>
        </span>
        <div class="min-w-0">
          <p class="text-[13px] leading-tight font-semibold text-ink">Enviar Mensagem</p>
          <p class="text-[10px] leading-tight text-ink-faint">#{{ nodeId() }}</p>
        </div>
      </div>
      <p class="px-3 py-2.5 text-xs leading-snug text-ink-muted">{{ nodeData().message }}</p>
      <div class="flex flex-col items-end gap-1.5 border-t border-line px-3 py-2 text-[10px] font-medium">
        <span class="text-success">enviado ✓</span>
        <span class="text-danger">erro ✕</span>
      </div>

      <!-- Ports: input à esquerda, outputs nomeados alinhados aos rótulos -->
      <atm-flow-handle type="target" position="left" class="top-1/2 -left-[5px] -translate-y-1/2" />
      <atm-flow-handle type="source" id="sent" position="right" class="-right-[5px] bottom-[26px]" />
      <atm-flow-handle type="source" id="error" position="right" class="-right-[5px] bottom-[8px]" />
    </div>
  `,
})
export class NodeSendMessage {
  readonly nodeId = input.required<string>();
  readonly nodeData = input.required<{ message: string }>();
  readonly selected = input(false);
}

@Component({
  selector: 'flow-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmFlow, AtmFlowNodeDef, AtmButton, AtmContextMenu, DemoPage, DemoSection, NodeSendMessage],
  template: `
    <demo-page
      title="Flow"
      description="AtmFlow é um editor de fluxogramas estilo React Flow: canvas com pan/zoom, nodes arrastáveis, conexões por drag, nodes customizados via template, grupos (containers coloridos e redimensionáveis), tipos de edge, minimapa, controles, snap, linhas de alinhamento, auto layout, undo/redo (Ctrl+Z), copiar/colar e import/export JSON. Com culling de viewport, aguenta milhares de nodes."
      importCode="import { AtmFlow, AtmFlowNodeDef } from 'src/core/ui';"
    >
      <demo-section
        id="flow-basic"
        title="Básico"
        description="Arraste nodes, conecte pelos pontos nas bordas, selecione com clique (Shift+arrasto para seleção em caixa), delete com Delete, desfaça com Ctrl+Z. Para reconectar: clique numa edge e arraste a bolinha de uma das pontas para outro node/handle. Roda do mouse dá zoom; arrastar o fundo faz pan; o minimapa navega."
        [code]="basicCode"
      >
        <atm-flow
          class="w-full"
          [(nodes)]="basicNodes"
          [(edges)]="basicEdges"
          [height]="440"
          (connect)="toast.success('Conexão criada: ' + $event.source + ' → ' + $event.target)"
        />
      </demo-section>

      <demo-section
        id="flow-custom"
        title="Nodes customizados & tipos de edge"
        description="Use <ng-template atmFlowNode='tipo'> para renderizar qualquer conteúdo dentro do node. Edges suportam bezier, smoothstep, step e straight, com label, cor, tracejado, animação e marcadores. Duplo clique em um edge cria um ponto de reroute (bolinha): arraste para organizar o traçado; Delete ou duplo clique na bolinha remove só o ponto, sem apagar a conexão. Nodes com resizable ganham alça de redimensionar quando selecionados."
        [code]="customCode"
      >
        <atm-flow class="w-full" [(nodes)]="customNodes" [(edges)]="customEdges" [height]="500">
          <ng-template atmFlowNode="card" let-node let-selected="selected">
            <div
              class="flex h-full w-56 flex-col gap-1 rounded-atm-lg border bg-surface p-3 shadow-sm"
              [class]="selected ? 'border-primary' : 'border-line'"
            >
              <div class="flex items-center gap-2">
                <span
                  class="flex size-7 items-center justify-center rounded-md text-sm"
                  [style.background]="node.data.soft"
                  [style.color]="node.data.color"
                >
                  <i [class]="node.data.icon"></i>
                </span>
                <span class="text-[13px] font-semibold text-ink">{{ node.data.title }}</span>
                @if (node.data.badge) {
                  <span
                    class="ml-auto rounded-full bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold
                      text-primary uppercase"
                  >
                    {{ node.data.badge }}
                  </span>
                }
              </div>
              <p class="text-xs leading-snug text-ink-muted">{{ node.data.subtitle }}</p>
            </div>
          </ng-template>
        </atm-flow>
      </demo-section>

      <demo-section
        id="flow-groups"
        title="Grupos"
        description="Node com group: true vira um container: um retângulo colorido e redimensionável desenhado atrás dos nodes. Arrastar o grupo move tudo que está dentro (parentId). Um node agrupado não escapa arrastando: o grupo cresce automaticamente para continuar contendo ele. Para colocar ou tirar um node de um grupo, segure Ctrl (configurável via groupModifier) enquanto solta — o grupo acende indicando o alvo. Selecione nodes e use 'Agrupar seleção'; com um grupo selecionado dá para desagrupar ou trocar a cor."
        [code]="groupsCode"
      >
        <div class="flex w-full flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <atm-button size="slim" variant="soft" (click)="groupSelection()">Agrupar seleção</atm-button>
            <atm-button size="slim" variant="outline" (click)="ungroupSelection()">Desagrupar</atm-button>
            <span class="ml-2 text-xs text-ink-muted">Cor do grupo:</span>
            @for (c of groupPalette; track c) {
              <button
                type="button"
                class="atm-focus size-6 cursor-pointer rounded-full border border-line transition-transform
                  hover:scale-110"
                [style.background]="c"
                [attr.aria-label]="'Cor ' + c"
                (click)="setGroupColor(c)"
              ></button>
            }
          </div>
          <atm-flow
            #flowGroups
            class="w-full"
            [(nodes)]="groupNodes"
            [(edges)]="groupEdges"
            [height]="440"
            defaultEdgeType="smoothstep"
            (selectionChange)="groupSel.set($event.nodes)"
            (groupChange)="onGroupChange($event)"
          />
          <p class="text-xs text-ink-faint">
            Dica: arraste um node e, <strong>segurando Ctrl</strong>, solte dentro do grupo para adicioná-lo —
            ou fora, para removê-lo. Sem Ctrl, o node não sai: o grupo se expande para acompanhá-lo.
          </p>
        </div>
      </demo-section>

      <demo-section
        id="flow-component-nodes"
        title="Node como componente próprio"
        description="Crie um componente Angular normal (ex.: <node-send-message>) e use-o no template do node. Dentro dele, posicione <atm-flow-handle> onde quiser — são os ports de conexão (como fNodeInput/fNodeOutput): input à esquerda e dois outputs nomeados (sent/error) alinhados aos rótulos. Use handles: [] no node para remover os pontos default das bordas."
        [code]="componentNodesCode"
      >
        <atm-flow
          class="w-full"
          [(nodes)]="componentNodes"
          [(edges)]="componentEdges"
          [height]="420"
          defaultEdgeType="smoothstep"
        >
          <ng-template atmFlowNode="send-message" let-node let-selected="selected">
            <node-send-message [nodeId]="node.id" [nodeData]="node.data" [selected]="selected" />
          </ng-template>
        </atm-flow>
      </demo-section>

      <demo-section
        id="flow-types"
        title="Tipos de conexão (ports tipados)"
        description="Handles podem declarar um dataType: output 'text' só conecta em input 'text', 'number' com 'number' — tipos diferentes simplesmente não conectam (a linha fica vermelha) e o evento connectInvalid é emitido com o motivo. O mapa compatibleTypes permite exceções: aqui, 'text' e 'number' também são aceitos pelo input 'any' do node Log."
        [code]="typedCode"
      >
        <atm-flow
          class="w-full"
          [(nodes)]="typedNodes"
          [(edges)]="typedEdges"
          [height]="400"
          [compatibleTypes]="{ text: ['text', 'any'], number: ['number', 'any'] }"
          (connectInvalid)="onConnectInvalid($event)"
        />
      </demo-section>

      <demo-section
        id="flow-interaction"
        title="Interações: validação, drag & drop, menu de contexto"
        description="preventCycles bloqueia ciclos; connectionValidator limita cada saída a 2 conexões. Arraste um item da paleta para dentro do canvas para criar node (screenToFlow). Clique direito emite contextMenu. Snap-to-grid ativo."
        [code]="interactionCode"
      >
        <div class="flex w-full flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2">
            @for (item of palette; track item.label) {
              <span
                class="flex cursor-grab items-center gap-1.5 rounded-full border border-line bg-surface
                  px-3 py-1.5 text-xs font-medium text-ink shadow-sm active:cursor-grabbing"
                draggable="true"
                (dragstart)="onPaletteDrag($event, item)"
              >
                <i [class]="item.icon" [style.color]="item.color"></i>
                {{ item.label }}
              </span>
            }
            <span class="text-xs text-ink-faint">← arraste para o canvas</span>
          </div>
          <atm-flow
            #flowInteract
            class="w-full"
            [(nodes)]="interactNodes"
            [(edges)]="interactEdges"
            [height]="420"
            [snapToGrid]="true"
            [preventCycles]="true"
            [connectionValidator]="maxTwoOutgoing"
            defaultEdgeType="smoothstep"
            (contextMenu)="onContextMenu($event)"
            (dragover)="$event.preventDefault()"
            (drop)="onPaletteDrop($event)"
          />
        </div>
      </demo-section>

      <demo-section
        id="flow-context-menu"
        title="Menu de contexto"
        description="AtmContextMenu integrado ao output (contextMenu) do flow: uma única instância com itens dinâmicos por alvo. Botão direito no canvas abre o menu geral (adicionar node naquele ponto, auto layout, ajustar visão); em um node abre o menu próprio dele — com o nome no header — para duplicar, desconectar ou excluir; em uma edge dá para animar, tracejar ou excluir a conexão."
        [code]="flowContextMenuCode"
      >
        <atm-flow
          #flowCtx
          class="w-full"
          [(nodes)]="ctxNodes"
          [(edges)]="ctxEdges"
          [height]="420"
          defaultEdgeType="smoothstep"
          (contextMenu)="onFlowContextMenu($event)"
        />
        <atm-context-menu #flowMenu (itemClick)="onFlowMenuAction($event)" />
      </demo-section>

      <demo-section
        id="flow-add-drop"
        title="Adicionar módulo ao soltar conexão"
        description="Arraste do output de um node e solte no vazio: o connectEnd retorna a posição (flow e tela via flowToScreen) e abre um seletor de módulos — o escolhido é criado ali, já conectado."
        [code]="addDropCode"
      >
        <atm-flow
          #flowAdd
          class="w-full"
          [(nodes)]="addNodes"
          [(edges)]="addEdges"
          [height]="420"
          defaultEdgeType="smoothstep"
          (connectEnd)="onAddConnectEnd($event)"
        />
        @if (addMenu(); as m) {
          <div class="fixed inset-0 z-40" (click)="addMenu.set(null)"></div>
          <div
            class="atm-panel animate-atm-pop fixed z-50 w-64 overflow-hidden"
            [style.left.px]="m.x"
            [style.top.px]="m.y"
          >
            <div class="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
              <i class="icofont-plus-circle text-lg text-primary" aria-hidden="true"></i>
              <div class="min-w-0">
                <p class="text-[13px] leading-tight font-semibold text-ink">Adicionar módulo</p>
                <p class="text-[11px] leading-tight text-ink-muted">Próximo passo do fluxo</p>
              </div>
            </div>
            <div class="max-h-64 overflow-y-auto p-1.5">
              @for (mod of modules; track mod.label) {
                <button
                  type="button"
                  class="atm-focus flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2
                    text-left text-[13px] font-medium text-ink transition-colors hover:bg-surface-alt"
                  (click)="pickModule(mod)"
                >
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-md text-sm text-white"
                    [style.background]="mod.color"
                  >
                    <i [class]="mod.icon" aria-hidden="true"></i>
                  </span>
                  {{ mod.label }}
                </button>
              }
            </div>
          </div>
        }
      </demo-section>

      <demo-section
        id="flow-events"
        title="Eventos"
        description="Todos os gestos emitem outputs: nodeClick, nodeDoubleClick, nodeDragStart/Stop, edgeClick, edgeDoubleClick, edgeReconnect, connect, connectEnd, paneClick, selectionChange, contextMenu, deleted e viewportChange. Interaja com o flow e veja o log."
        [code]="eventsCode"
      >
        <div class="flex w-full flex-col gap-3">
          <atm-flow
            [(nodes)]="eventNodes"
            [(edges)]="eventEdges"
            [height]="300"
            [minimap]="false"
            (nodeClick)="log('nodeClick', $event.node.label)"
            (nodeDoubleClick)="log('nodeDoubleClick', $event.node.label)"
            (nodeDragStart)="log('nodeDragStart', $event.nodes.length + ' node(s)')"
            (nodeDragStop)="log('nodeDragStop', $event.nodes.length + ' node(s)')"
            (edgeClick)="log('edgeClick', $event.edge.id)"
            (edgeDoubleClick)="log('edgeDoubleClick', $event.edge.id)"
            (edgeReconnect)="log('edgeReconnect', $event.previous.target + ' → ' + $event.edge.target)"
            (connect)="log('connect', $event.source + ' → ' + $event.target)"
            (connectInvalid)="log('connectInvalid', $event.reason)"
            (paneClick)="log('paneClick', 'x ' + round($event.x) + ', y ' + round($event.y))"
            (selectionChange)="log('selectionChange', $event.nodes.length + ' nodes, ' + $event.edges.length + ' edges')"
            (deleted)="log('deleted', $event.nodes.length + ' nodes, ' + $event.edges.length + ' edges')"
            (contextMenu)="log('contextMenu', $event.node ? 'node' : $event.edge ? 'edge' : 'canvas')"
          />
          <div class="rounded-atm border border-line bg-surface-alt/40">
            <div class="flex items-center justify-between border-b border-line px-3 py-1.5">
              <span class="text-[11px] font-semibold text-ink-muted uppercase">Log de eventos</span>
              <button
                type="button"
                class="atm-focus cursor-pointer rounded px-1.5 text-[11px] text-ink-faint hover:text-ink"
                (click)="eventLog.set([])"
              >
                limpar
              </button>
            </div>
            <div class="h-32 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed text-ink-muted">
              @for (line of eventLog(); track $index) {
                <div>{{ line }}</div>
              } @empty {
                <div class="text-ink-faint">Interaja com o flow acima…</div>
              }
            </div>
          </div>
        </div>
      </demo-section>

      <demo-section
        id="flow-json"
        title="Auto layout & JSON"
        description="autoLayout() organiza o grafo em camadas (LR ou TB). toJson()/loadJson() salvam e restauram o fluxo inteiro — nodes, edges e viewport."
        [code]="jsonCode"
      >
        <div class="flex w-full flex-col gap-3">
          <div class="flex flex-wrap gap-2">
            <atm-button size="slim" variant="soft" (click)="flowJson.autoLayout('LR')">
              Layout horizontal
            </atm-button>
            <atm-button size="slim" variant="soft" (click)="flowJson.autoLayout('TB')">
              Layout vertical
            </atm-button>
            <atm-button size="slim" variant="outline" (click)="exportJson()">Exportar JSON</atm-button>
            <atm-button size="slim" variant="outline" (click)="importJson()">Importar JSON</atm-button>
          </div>
          <atm-flow #flowJson class="w-full" [(nodes)]="jsonNodes" [(edges)]="jsonEdges" [height]="380" direction="TB" />
          @if (jsonText()) {
            <textarea
              class="atm-field h-40 w-full resize-y p-3 font-mono text-xs text-ink"
              spellcheck="false"
              [value]="jsonText()"
              (input)="jsonText.set($any($event.target).value)"
            ></textarea>
          }
        </div>
      </demo-section>

      <demo-section
        id="flow-stress"
        title="Stress test"
        description="Culling de viewport: só os nodes/edges visíveis entram no DOM, então pan e zoom continuam fluidos com milhares de nodes. O minimapa mostra a visão geral."
        [code]="stressCode"
      >
        <div class="flex w-full flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <atm-button size="slim" variant="soft" (click)="genStress(500)">500 nodes</atm-button>
            <atm-button size="slim" variant="soft" (click)="genStress(2000)">2.000 nodes</atm-button>
            <atm-button size="slim" variant="soft" (click)="genStress(5000)">5.000 nodes</atm-button>
            <span class="text-xs text-ink-muted">
              {{ stressNodes().length }} nodes · {{ stressEdges().length }} edges
            </span>
          </div>
          <atm-flow
            #flowStress
            class="w-full"
            [(nodes)]="stressNodes"
            [(edges)]="stressEdges"
            [height]="520"
            defaultEdgeType="straight"
            defaultMarkerEnd="none"
            [helperLines]="false"
          />
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class FlowPage {
  readonly toast = inject(AtmToastService);

  readonly flowGroups = viewChild.required<AtmFlow>('flowGroups');
  readonly flowInteract = viewChild.required<AtmFlow>('flowInteract');
  readonly flowCtx = viewChild.required<AtmFlow>('flowCtx');
  readonly flowMenu = viewChild.required<AtmContextMenu>('flowMenu');
  readonly flowAdd = viewChild.required<AtmFlow>('flowAdd');
  readonly flowJson = viewChild.required<AtmFlow>('flowJson');
  readonly flowStress = viewChild.required<AtmFlow>('flowStress');

  /* ------------------------- básico ------------------------- */

  readonly basicNodes = signal<AtmFlowNode[]>([
    { id: 'in', label: 'Webhook recebido', icon: 'icofont-download', color: 'var(--atm-info)', position: { x: 0, y: 130 } },
    { id: 'val', label: 'Validar payload', icon: 'icofont-check-circled', position: { x: 230, y: 40 } },
    { id: 'enr', label: 'Enriquecer dados', icon: 'icofont-database', position: { x: 230, y: 220 } },
    { id: 'dec', label: 'Aprovado?', icon: 'icofont-question-circle', color: 'var(--atm-warning)', position: { x: 470, y: 130 } },
    { id: 'ok', label: 'Processar pedido', icon: 'icofont-gear', color: 'var(--atm-success)', position: { x: 710, y: 40 } },
    { id: 'no', label: 'Notificar rejeição', icon: 'icofont-close-circled', color: 'var(--atm-danger)', position: { x: 710, y: 220 } },
  ]);

  readonly basicEdges = signal<AtmFlowEdge[]>([
    { id: 'e1', source: 'in', target: 'val', animated: true },
    { id: 'e2', source: 'in', target: 'enr', animated: true },
    { id: 'e3', source: 'val', target: 'dec' },
    { id: 'e4', source: 'enr', target: 'dec' },
    { id: 'e5', source: 'dec', target: 'ok', label: 'sim', color: 'var(--atm-success)' },
    { id: 'e6', source: 'dec', target: 'no', label: 'não', color: 'var(--atm-danger)', dashed: true },
  ]);

  /* ------------------- custom nodes / edges ------------------ */

  readonly customNodes = signal<AtmFlowNode[]>([
    {
      id: 'c1',
      type: 'card',
      position: { x: 0, y: 0 },
      data: {
        title: 'Ingestão',
        subtitle: 'Consome eventos do Kafka a cada 5s.',
        icon: 'icofont-data',
        color: 'var(--atm-info)',
        soft: 'var(--atm-info-soft)',
        badge: 'live',
      },
    },
    {
      id: 'c2',
      type: 'card',
      position: { x: 340, y: -120 },
      data: {
        title: 'Transformação',
        subtitle: 'Normaliza, deduplica e valida o schema.',
        icon: 'icofont-exchange',
        color: 'var(--atm-primary)',
        soft: 'var(--atm-primary-soft)',
      },
    },
    {
      id: 'c3',
      type: 'card',
      position: { x: 340, y: 120 },
      data: {
        title: 'Machine Learning',
        subtitle: 'Score de risco em tempo real.',
        icon: 'icofont-brand-slideshare',
        color: 'var(--atm-warning)',
        soft: 'var(--atm-warning-soft)',
        badge: 'beta',
      },
    },
    {
      id: 'c4',
      type: 'card',
      position: { x: 690, y: 0 },
      data: {
        title: 'Data Warehouse',
        subtitle: 'Persistência analítica particionada.',
        icon: 'icofont-database',
        color: 'var(--atm-success)',
        soft: 'var(--atm-success-soft)',
      },
      handles: [
        { type: 'target', position: 'left', id: 'a', offset: 0.3 },
        { type: 'target', position: 'left', id: 'b', offset: 0.7 },
        { type: 'source', position: 'right' },
      ],
    },
    { id: 't1', label: 'bezier', position: { x: 0, y: 300 } },
    { id: 't2', label: 'smoothstep', position: { x: 0, y: 370 } },
    { id: 't3', label: 'step', position: { x: 0, y: 440 } },
    { id: 't4', label: 'straight', position: { x: 0, y: 510 } },
    { id: 't5', label: 'redimensione-me', position: { x: 420, y: 390 }, resizable: true, width: 220, height: 70 },
  ]);

  readonly customEdges = signal<AtmFlowEdge[]>([
    { id: 'ce1', source: 'c1', target: 'c2', animated: true, label: 'stream' },
    { id: 'ce2', source: 'c1', target: 'c3', animated: true },
    { id: 'ce3', source: 'c2', target: 'c4', targetHandle: 'a', type: 'smoothstep' },
    { id: 'ce4', source: 'c3', target: 'c4', targetHandle: 'b', type: 'smoothstep', label: 'score' },
    { id: 'te1', source: 't1', target: 't5', type: 'bezier', markerEnd: 'arrow' },
    { id: 'te2', source: 't2', target: 't5', type: 'smoothstep', markerEnd: 'dot' },
    { id: 'te3', source: 't3', target: 't5', type: 'step', dashed: true },
    // points = reroute: o edge passa pelas bolinhas (duplo clique no fio cria uma)
    { id: 'te4', source: 't4', target: 't5', type: 'straight', color: '#8b5cf6', points: [{ x: 250, y: 480 }] },
  ]);

  /* -------------------------- grupos -------------------------- */

  readonly groupNodes = signal<AtmFlowNode[]>([
    {
      id: 'grp-a',
      group: true,
      label: 'Pré-processamento',
      color: '#8b5cf6',
      position: { x: 0, y: 0 },
      width: 400,
      height: 300,
    },
    { id: 'ga1', label: 'Receber evento', icon: 'icofont-download', parentId: 'grp-a', position: { x: 40, y: 60 } },
    { id: 'ga2', label: 'Validar schema', icon: 'icofont-check-circled', parentId: 'grp-a', position: { x: 70, y: 180 } },
    { id: 'gb1', label: 'Persistir', icon: 'icofont-database', color: 'var(--atm-success)', position: { x: 540, y: 80 } },
    { id: 'gb2', label: 'Notificar', icon: 'icofont-paper-plane', color: 'var(--atm-info)', position: { x: 540, y: 210 } },
  ]);

  readonly groupEdges = signal<AtmFlowEdge[]>([
    { id: 'ge1', source: 'ga1', target: 'ga2', animated: true },
    { id: 'ge2', source: 'ga2', target: 'gb1' },
    { id: 'ge3', source: 'ga2', target: 'gb2' },
  ]);

  readonly groupSel = signal<string[]>([]);
  readonly groupPalette = ['#8b5cf6', '#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

  private readonly selectedGroupIds = computed(() => {
    const nodes = this.groupNodes();
    return this.groupSel().filter((id) => nodes.find((n) => n.id === id)?.group);
  });

  groupSelection(): void {
    const nodes = this.groupNodes();
    const ids = this.groupSel().filter((id) => !nodes.find((n) => n.id === id)?.group);
    if (!ids.length) {
      this.toast.warning('Selecione nodes primeiro (clique, Ctrl+clique ou Shift+arrasto).');
      return;
    }
    this.flowGroups().createGroup(ids, { label: 'Novo grupo' });
  }

  ungroupSelection(): void {
    const groups = this.selectedGroupIds();
    if (!groups.length) {
      this.toast.warning('Selecione um grupo para desagrupar.');
      return;
    }
    for (const id of groups) this.flowGroups().ungroup(id);
  }

  setGroupColor(color: string): void {
    const groups = this.selectedGroupIds();
    if (!groups.length) {
      this.toast.warning('Selecione um grupo para trocar a cor.');
      return;
    }
    for (const id of groups) this.flowGroups().updateNode(id, { color });
  }

  onGroupChange(e: AtmFlowGroupChange): void {
    const name = e.node.label ?? e.node.id;
    this.toast.info(
      e.group ? `"${name}" entrou no grupo "${e.group.label ?? e.group.id}"` : `"${name}" saiu do grupo`,
    );
  }

  /* ------------------- node componentizado -------------------- */

  readonly componentNodes = signal<AtmFlowNode[]>([
    {
      id: 'cn-trigger',
      label: 'Gatilho: novo lead',
      icon: 'icofont-flash',
      color: 'var(--atm-primary)',
      position: { x: 0, y: 150 },
    },
    {
      id: 'cn-msg',
      type: 'send-message',
      position: { x: 280, y: 70 },
      handles: [],
      data: { message: 'Olá {{nome}}! Bem-vindo à Atmus. Como posso te ajudar hoje?' },
    },
    {
      id: 'cn-next',
      label: 'Próximo passo',
      icon: 'icofont-check-circled',
      color: 'var(--atm-success)',
      position: { x: 660, y: 90 },
    },
    {
      id: 'cn-err',
      label: 'Tratar falha',
      icon: 'icofont-warning',
      color: 'var(--atm-danger)',
      position: { x: 660, y: 250 },
    },
  ]);

  readonly componentEdges = signal<AtmFlowEdge[]>([
    { id: 'cne1', source: 'cn-trigger', target: 'cn-msg', animated: true },
    { id: 'cne2', source: 'cn-msg', sourceHandle: 'sent', target: 'cn-next', color: 'var(--atm-success)' },
    { id: 'cne3', source: 'cn-msg', sourceHandle: 'error', target: 'cn-err', color: 'var(--atm-danger)', dashed: true },
  ]);

  /* --------------------- ports tipados ------------------------ */

  readonly typedNodes = signal<AtmFlowNode[]>([
    {
      id: 'ty-text',
      label: 'Origem: texto',
      icon: 'icofont-file-text',
      color: 'var(--atm-info)',
      position: { x: 0, y: 40 },
      handles: [{ type: 'source', position: 'right', dataType: 'text' }],
    },
    {
      id: 'ty-num',
      label: 'Origem: número',
      icon: 'icofont-calculator',
      color: 'var(--atm-warning)',
      position: { x: 0, y: 220 },
      handles: [{ type: 'source', position: 'right', dataType: 'number' }],
    },
    {
      id: 'ty-upper',
      label: 'Uppercase — aceita texto',
      color: 'var(--atm-info)',
      position: { x: 340, y: 0 },
      handles: [
        { type: 'target', position: 'left', dataType: 'text' },
        { type: 'source', position: 'right', dataType: 'text' },
      ],
    },
    {
      id: 'ty-sum',
      label: 'Somar — aceita número',
      color: 'var(--atm-warning)',
      position: { x: 340, y: 130 },
      handles: [
        { type: 'target', position: 'left', dataType: 'number' },
        { type: 'source', position: 'right', dataType: 'number' },
      ],
    },
    {
      id: 'ty-log',
      label: 'Log — aceita qualquer (any)',
      icon: 'icofont-eye-alt',
      position: { x: 340, y: 260 },
      handles: [{ type: 'target', position: 'left', dataType: 'any' }],
    },
  ]);

  readonly typedEdges = signal<AtmFlowEdge[]>([
    { id: 'tye1', source: 'ty-text', target: 'ty-upper', color: 'var(--atm-info)' },
  ]);

  onConnectInvalid(e: { reason: string; sourceType?: string; targetType?: string }): void {
    if (e.reason === 'type-mismatch') {
      this.toast.warning(`Tipos incompatíveis: ${e.sourceType} → ${e.targetType}`, 'Conexão rejeitada');
    } else {
      this.toast.warning(`Motivo: ${e.reason}`, 'Conexão rejeitada');
    }
  }

  /* ----------------------- interações ------------------------ */

  readonly palette = [
    { label: 'Tarefa', icon: 'icofont-tasks', color: 'var(--atm-primary)' },
    { label: 'Condição', icon: 'icofont-question-circle', color: 'var(--atm-warning)' },
    { label: 'Ação', icon: 'icofont-flash', color: 'var(--atm-success)' },
  ];

  readonly interactNodes = signal<AtmFlowNode[]>([
    { id: 'i1', label: 'Início', icon: 'icofont-play-alt-2', color: 'var(--atm-success)', position: { x: 0, y: 120 } },
    { id: 'i2', label: 'Etapa A', position: { x: 240, y: 40 } },
    { id: 'i3', label: 'Etapa B', position: { x: 240, y: 200 } },
    { id: 'i4', label: 'Fim', icon: 'icofont-stop', color: 'var(--atm-danger)', position: { x: 480, y: 120 } },
  ]);

  readonly interactEdges = signal<AtmFlowEdge[]>([
    { id: 'ie1', source: 'i1', target: 'i2' },
    { id: 'ie2', source: 'i1', target: 'i3' },
  ]);

  /** Limita cada node a 2 conexões de saída (connection limit). */
  readonly maxTwoOutgoing = (conn: { source: string }, _nodes: AtmFlowNode[], edges: AtmFlowEdge[]) =>
    edges.filter((e) => e.source === conn.source).length < 2;

  onPaletteDrag(e: DragEvent, item: { label: string; icon: string; color: string }): void {
    e.dataTransfer?.setData('application/atm-flow', JSON.stringify(item));
  }

  onPaletteDrop(e: DragEvent): void {
    const raw = e.dataTransfer?.getData('application/atm-flow');
    if (!raw) return;
    e.preventDefault();
    const item = JSON.parse(raw) as { label: string; icon: string; color: string };
    const pos = this.flowInteract().screenToFlow({ x: e.clientX, y: e.clientY });
    this.interactNodes.update((ns) => [
      ...ns,
      {
        id: atmUid('n'),
        label: item.label,
        icon: item.icon,
        color: item.color,
        position: { x: pos.x - 60, y: pos.y - 20 },
      },
    ]);
  }

  onContextMenu(e: AtmFlowContextMenuEvent): void {
    const what = e.node ? `node "${e.node.label ?? e.node.id}"` : e.edge ? `edge ${e.edge.id}` : 'canvas';
    this.toast.info(`Clique direito em ${what} (x: ${Math.round(e.position.x)}, y: ${Math.round(e.position.y)})`);
  }

  /* --------------------- menu de contexto --------------------- */

  readonly ctxNodes = signal<AtmFlowNode[]>([
    { id: 'cx-start', label: 'Início', icon: 'icofont-play-alt-2', color: 'var(--atm-success)', position: { x: 0, y: 150 } },
    { id: 'cx-crm', label: 'Consultar CRM', icon: 'icofont-database', position: { x: 250, y: 60 } },
    { id: 'cx-mail', label: 'Enviar e-mail', icon: 'icofont-email', color: 'var(--atm-info)', position: { x: 250, y: 240 } },
    { id: 'cx-end', label: 'Finalizar', icon: 'icofont-check-circled', color: 'var(--atm-primary)', position: { x: 520, y: 150 } },
  ]);

  readonly ctxEdges = signal<AtmFlowEdge[]>([
    { id: 'cxe1', source: 'cx-start', target: 'cx-crm' },
    { id: 'cxe2', source: 'cx-start', target: 'cx-mail', animated: true },
    { id: 'cxe3', source: 'cx-crm', target: 'cx-end' },
    { id: 'cxe4', source: 'cx-mail', target: 'cx-end', dashed: true },
  ]);

  private readonly canvasMenuItems: AtmContextMenuItem[] = [
    { label: 'Adicionar node aqui', value: 'add-node', icon: 'plus' },
    { label: 'Auto layout', value: 'auto-layout', icon: 'site-map' },
    { label: 'Ajustar visão', value: 'fit-view', icon: 'eye-alt' },
    { label: 'Limpar canvas', value: 'clear', icon: 'trash', danger: true, separatorBefore: true },
  ];

  /** Um único AtmContextMenu; os itens mudam conforme o alvo do clique direito. */
  onFlowContextMenu(e: AtmFlowContextMenuEvent): void {
    let items: AtmContextMenuItem[];
    let header: string;
    if (e.node) {
      header = e.node.label ?? e.node.id;
      items = [
        { label: 'Editar node', value: 'edit', icon: 'edit' },
        { label: 'Duplicar', value: 'duplicate', icon: 'copy', shortcut: 'Ctrl+D' },
        { label: 'Desconectar tudo', value: 'disconnect', icon: 'close-circled' },
        { label: 'Excluir node', value: 'delete-node', icon: 'trash', danger: true, separatorBefore: true },
      ];
    } else if (e.edge) {
      header = `Conexão ${e.edge.source} → ${e.edge.target}`;
      items = [
        { label: e.edge.animated ? 'Parar animação' : 'Animar fluxo', value: 'edge-animate', icon: 'exchange' },
        { label: e.edge.dashed ? 'Linha sólida' : 'Linha tracejada', value: 'edge-dashed', icon: 'ruler' },
        { label: 'Excluir conexão', value: 'delete-edge', icon: 'trash', danger: true, separatorBefore: true },
      ];
    } else {
      header = 'Canvas';
      items = this.canvasMenuItems;
    }
    this.flowMenu().open(e.event, { items, header, data: e });
  }

  onFlowMenuAction(sel: AtmContextMenuSelect): void {
    const e = sel.data as AtmFlowContextMenuEvent;
    const node = e.node;
    const edge = e.edge;
    switch (sel.item.value) {
      case 'add-node':
        this.ctxNodes.update((ns) => [
          ...ns,
          { id: atmUid('n'), label: 'Novo node', icon: 'icofont-plus', position: { x: e.position.x - 60, y: e.position.y - 20 } },
        ]);
        break;
      case 'auto-layout':
        this.flowCtx().autoLayout('LR');
        break;
      case 'fit-view':
        this.flowCtx().fitView();
        break;
      case 'clear':
        this.ctxNodes.set([]);
        this.ctxEdges.set([]);
        break;
      case 'edit':
        this.toast.info(`Abra aqui seu editor do node "${node?.label ?? node?.id}".`);
        break;
      case 'duplicate':
        if (node) {
          this.ctxNodes.update((ns) => [
            ...ns,
            { ...node, id: atmUid('n'), position: { x: node.position.x + 40, y: node.position.y + 50 } },
          ]);
        }
        break;
      case 'disconnect':
        if (node) this.ctxEdges.update((es) => es.filter((ed) => ed.source !== node.id && ed.target !== node.id));
        break;
      case 'delete-node':
        if (node) {
          this.ctxNodes.update((ns) => ns.filter((n) => n.id !== node.id));
          this.ctxEdges.update((es) => es.filter((ed) => ed.source !== node.id && ed.target !== node.id));
        }
        break;
      case 'edge-animate':
        if (edge) this.updateCtxEdge(edge.id, (ed) => ({ ...ed, animated: !ed.animated }));
        break;
      case 'edge-dashed':
        if (edge) this.updateCtxEdge(edge.id, (ed) => ({ ...ed, dashed: !ed.dashed }));
        break;
      case 'delete-edge':
        if (edge) this.ctxEdges.update((es) => es.filter((ed) => ed.id !== edge.id));
        break;
    }
  }

  private updateCtxEdge(id: string, patch: (edge: AtmFlowEdge) => AtmFlowEdge): void {
    this.ctxEdges.update((es) => es.map((ed) => (ed.id === id ? patch(ed) : ed)));
  }

  /* ------------------ adicionar ao soltar --------------------- */

  readonly addNodes = signal<AtmFlowNode[]>([
    {
      id: 'trigger',
      label: 'Gatilho: nova mensagem',
      icon: 'icofont-flash',
      color: 'var(--atm-primary)',
      position: { x: 40, y: 160 },
    },
  ]);

  readonly addEdges = signal<AtmFlowEdge[]>([]);

  readonly addMenu = signal<{
    x: number;
    y: number;
    flow: { x: number; y: number };
    source: string;
    sourceHandle?: string;
  } | null>(null);

  readonly modules = [
    { label: 'Executar script', icon: 'icofont-code', color: '#8b5cf6' },
    { label: 'Enviar mensagem', icon: 'icofont-speech-comments', color: '#6366f1' },
    { label: 'Enviar áudio', icon: 'icofont-mic', color: '#0ea5e9' },
    { label: 'Enviar imagem', icon: 'icofont-image', color: '#7c3aed' },
    { label: 'Enviar vídeo', icon: 'icofont-video-alt', color: '#6d28d9' },
    { label: 'Aguardar resposta', icon: 'icofont-sand-clock', color: '#f59e0b' },
  ];

  /** Soltou a conexão no vazio → abre o seletor de módulos naquele ponto. */
  onAddConnectEnd(e: AtmFlowConnectEnd): void {
    if (e.connection) return;
    const screen = this.flowAdd().flowToScreen(e.position);
    this.addMenu.set({
      x: Math.min(screen.x, window.innerWidth - 280),
      y: Math.min(screen.y, window.innerHeight - 340),
      flow: e.position,
      source: e.source,
      sourceHandle: e.sourceHandle,
    });
  }

  pickModule(mod: { label: string; icon: string; color: string }): void {
    const menu = this.addMenu();
    if (!menu) return;
    const id = atmUid('n');
    this.addNodes.update((ns) => [
      ...ns,
      {
        id,
        label: mod.label,
        icon: mod.icon,
        color: mod.color,
        position: { x: menu.flow.x, y: menu.flow.y - 20 },
      },
    ]);
    this.addEdges.update((es) => [
      ...es,
      { id: atmUid('e'), source: menu.source, sourceHandle: menu.sourceHandle, target: id },
    ]);
    this.addMenu.set(null);
  }

  /* -------------------------- eventos ------------------------- */

  readonly eventNodes = signal<AtmFlowNode[]>([
    { id: 'ev1', label: 'Node A', color: 'var(--atm-primary)', position: { x: 40, y: 60 } },
    { id: 'ev2', label: 'Node B', position: { x: 300, y: 160 } },
    { id: 'ev3', label: 'Node C', color: 'var(--atm-info)', position: { x: 560, y: 60 } },
  ]);

  readonly eventEdges = signal<AtmFlowEdge[]>([
    { id: 'ee1', source: 'ev1', target: 'ev2' },
    { id: 'ee2', source: 'ev2', target: 'ev3' },
  ]);

  readonly eventLog = signal<string[]>([]);

  log(event: string, detail: unknown): void {
    const ts = new Date().toLocaleTimeString('pt-BR');
    this.eventLog.update((l) => [`${ts}  ${event.padEnd(16)} ${detail ?? ''}`, ...l].slice(0, 30));
  }

  round(v: number): number {
    return Math.round(v);
  }

  /* --------------------- layout & JSON ----------------------- */

  readonly jsonNodes = signal<AtmFlowNode[]>([
    { id: 'r', label: 'Raiz', color: 'var(--atm-primary)', position: { x: 0, y: 0 } },
    { id: 'a', label: 'Módulo A', position: { x: -60, y: 140 } },
    { id: 'b', label: 'Módulo B', position: { x: 180, y: 100 } },
    { id: 'a1', label: 'Serviço A1', position: { x: -160, y: 260 } },
    { id: 'a2', label: 'Serviço A2', position: { x: 40, y: 300 } },
    { id: 'b1', label: 'Serviço B1', position: { x: 240, y: 260 } },
    { id: 'db', label: 'Banco de dados', icon: 'icofont-database', position: { x: 40, y: 420 } },
  ]);

  readonly jsonEdges = signal<AtmFlowEdge[]>([
    { id: 'j1', source: 'r', target: 'a' },
    { id: 'j2', source: 'r', target: 'b' },
    { id: 'j3', source: 'a', target: 'a1' },
    { id: 'j4', source: 'a', target: 'a2' },
    { id: 'j5', source: 'b', target: 'b1' },
    { id: 'j6', source: 'a2', target: 'db' },
    { id: 'j7', source: 'b1', target: 'db' },
  ]);

  readonly jsonText = signal('');

  exportJson(): void {
    this.jsonText.set(JSON.stringify(this.flowJson().toJson(), null, 2));
    this.toast.success('Fluxo exportado para o textarea abaixo.');
  }

  importJson(): void {
    if (!this.jsonText()) {
      this.toast.warning('Exporte (ou cole) um JSON primeiro.');
      return;
    }
    try {
      this.flowJson().loadJson(JSON.parse(this.jsonText()));
      this.toast.success('Fluxo restaurado a partir do JSON.');
    } catch {
      this.toast.error('JSON inválido.');
    }
  }

  /* ----------------------- stress test ----------------------- */

  readonly stressNodes = signal<AtmFlowNode[]>([]);
  readonly stressEdges = signal<AtmFlowEdge[]>([]);

  genStress(count: number): void {
    const palette = ['var(--atm-primary)', 'var(--atm-info)', 'var(--atm-success)', 'var(--atm-warning)'];
    const cols = Math.ceil(Math.sqrt(count * 1.6));
    const nodes: AtmFlowNode[] = [];
    const edges: AtmFlowEdge[] = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `s${i}`,
        label: `Node ${i}`,
        color: i % 7 === 0 ? palette[i % palette.length] : undefined,
        position: { x: (i % cols) * 200, y: Math.floor(i / cols) * 90 },
      });
      if (i > 0 && i % cols !== 0) edges.push({ id: `se${i}`, source: `s${i - 1}`, target: `s${i}` });
      if (i >= cols && i % 3 === 0) edges.push({ id: `sv${i}`, source: `s${i - cols}`, target: `s${i}` });
    }
    this.stressNodes.set(nodes);
    this.stressEdges.set(edges);
    requestAnimationFrame(() => this.flowStress().fitView());
  }

  /* ------------------------- snippets ------------------------ */

  readonly basicCode = `<atm-flow [(nodes)]="nodes" [(edges)]="edges" [height]="440" (connect)="onConnect($event)" />

// nodes: AtmFlowNode[]
[
  { id: 'in', label: 'Webhook recebido', icon: 'icofont-download', color: 'var(--atm-info)', position: { x: 0, y: 130 } },
  { id: 'dec', label: 'Aprovado?', color: 'var(--atm-warning)', position: { x: 470, y: 130 } },
  ...
]

// edges: AtmFlowEdge[]
[
  { id: 'e1', source: 'in', target: 'val', animated: true },
  { id: 'e5', source: 'dec', target: 'ok', label: 'sim', color: 'var(--atm-success)' },
  { id: 'e6', source: 'dec', target: 'no', label: 'não', dashed: true },
]

// Atalhos: Delete apaga · Ctrl+Z/Ctrl+Y desfaz/refaz · Ctrl+C/V copia/cola
// Ctrl+A seleciona tudo · setas movem · Shift+arrasto = seleção em caixa`;

  readonly customCode = `<atm-flow [(nodes)]="nodes" [(edges)]="edges">
  <!-- node.type = 'card' usa este template -->
  <ng-template atmFlowNode="card" let-node let-selected="selected">
    <div class="w-56 rounded-atm-lg border bg-surface p-3"
         [class]="selected ? 'border-primary' : 'border-line'">
      {{ node.data.title }}
    </div>
  </ng-template>
</atm-flow>

// Node customizado + múltiplos handles nomeados:
{
  id: 'c4', type: 'card', position: { x: 690, y: 0 },
  data: { title: 'Data Warehouse', ... },
  handles: [
    { type: 'target', position: 'left', id: 'a', offset: 0.3 },
    { type: 'target', position: 'left', id: 'b', offset: 0.7 },
    { type: 'source', position: 'right' },
  ],
}

// Edge apontando para um handle específico + tipos:
{ id: 'ce3', source: 'c2', target: 'c4', targetHandle: 'a', type: 'smoothstep' }
{ id: 'te1', source: 't1', target: 't5', type: 'bezier', markerEnd: 'arrow' }
{ id: 'te3', source: 't3', target: 't5', type: 'step', dashed: true }

// Pontos de reroute: duplo clique no fio cria; arraste para mover;
// Delete (ou duplo clique na bolinha) remove só o ponto.
{ id: 'te4', source: 't4', target: 't5', points: [{ x: 250, y: 480 }] }

// Redimensionável:
{ id: 't5', label: '...', resizable: true, width: 220, height: 70 }`;

  readonly groupsCode = `<atm-flow #flow [(nodes)]="nodes" [(edges)]="edges" (groupChange)="onGroupChange($event)" />

// Grupo = node com group: true → retângulo colorido, redimensionável,
// desenhado atrás dos nodes e das edges:
{ id: 'grp', group: true, label: 'Pré-processamento', color: '#8b5cf6',
  position: { x: 0, y: 0 }, width: 400, height: 300 }

// Membros apontam para o grupo via parentId — mover o grupo move todos:
{ id: 'n1', label: 'Receber evento', parentId: 'grp', position: { x: 40, y: 60 } }

// Interação: segure CTRL ao soltar um node dentro de um grupo para
// adicioná-lo; Ctrl + soltar fora, remove. Emite (groupChange) { node, group | null }.
// Sem Ctrl um membro nunca escapa: o grupo cresce automaticamente para contê-lo.
// O modificador é configurável: <atm-flow groupModifier="alt" /> (ctrl | alt | shift)

// API imperativa:
flow().createGroup(['n1', 'n2'], { label: 'Novo grupo', color: '#0ea5e9' });
flow().ungroup('grp');                    // dissolve; os nodes ficam
flow().addToGroup(['n3'], 'grp');
flow().removeFromGroup(['n3']);
flow().updateNode('grp', { color: '#22c55e' }); // trocar a cor`;

  readonly componentNodesCode = `<!-- 1. Seu componente de node: um componente Angular comum -->
@Component({
  selector: 'node-send-message',
  imports: [AtmFlowNodeHandle],
  template: \`
    <div class="relative w-64 rounded-atm-lg border bg-surface"
         [class]="selected() ? 'border-primary' : 'border-line'">
      <!-- ...header, corpo, rótulos... -->

      <!-- 2. Ports de conexão posicionados livremente (como fNodeInput/fNodeOutput) -->
      <atm-flow-handle type="target" position="left"
        class="top-1/2 -left-[5px] -translate-y-1/2" />
      <atm-flow-handle type="source" id="sent" position="right"
        class="-right-[5px] bottom-[26px]" />
      <atm-flow-handle type="source" id="error" position="right"
        class="-right-[5px] bottom-[8px]" />
    </div>
  \`,
})
export class NodeSendMessage {
  readonly nodeId = input.required<string>();
  readonly nodeData = input.required<{ message: string }>();
  readonly selected = input(false);
}

<!-- 3. Registre o componente como renderer do tipo 'send-message' -->
<atm-flow [(nodes)]="nodes" [(edges)]="edges">
  <ng-template atmFlowNode="send-message" let-node let-selected="selected">
    <node-send-message [nodeId]="node.id" [nodeData]="node.data" [selected]="selected" />
  </ng-template>
</atm-flow>

// 4. Node usa o tipo + handles: [] (remove os pontos default da borda)
{ id: 'msg-1', type: 'send-message', position: { x: 280, y: 70 },
  handles: [], data: { message: 'Olá!' } }

// 5. Edges podem apontar para um port específico pelo id
{ id: 'e1', source: 'msg-1', sourceHandle: 'sent', target: 'proximo' }
{ id: 'e2', source: 'msg-1', sourceHandle: 'error', target: 'falha' }`;

  readonly typedCode = `<atm-flow
  [(nodes)]="nodes"
  [(edges)]="edges"
  [compatibleTypes]="{ text: ['text', 'any'], number: ['number', 'any'] }"
  (connectInvalid)="onConnectInvalid($event)"
/>

// Handles declaram dataType (dados ou <atm-flow-handle dataType="text" />):
{ id: 'origem', label: 'Origem: texto', position: { x: 0, y: 40 },
  handles: [{ type: 'source', position: 'right', dataType: 'text' }] }

{ id: 'upper', label: 'Uppercase', position: { x: 340, y: 0 },
  handles: [
    { type: 'target', position: 'left', dataType: 'text' },
    { type: 'source', position: 'right', dataType: 'text' },
  ] }

// Regras:
// - ambos com dataType → precisam ser compatíveis (igual, ou via compatibleTypes)
// - port sem dataType → conecta com qualquer um
// - incompatível → linha vermelha, NÃO conecta e emite (connectInvalid):
onConnectInvalid(e: AtmFlowConnectInvalid) {
  // e.reason: 'type-mismatch' | 'duplicate' | 'cycle' | 'validator'
  // e.sourceType / e.targetType: os dataTypes envolvidos
}`;

  readonly interactionCode = `<atm-flow
  #flow
  [(nodes)]="nodes"
  [(edges)]="edges"
  [snapToGrid]="true"
  [preventCycles]="true"
  [connectionValidator]="maxTwoOutgoing"
  defaultEdgeType="smoothstep"
  (contextMenu)="onContextMenu($event)"
  (dragover)="$event.preventDefault()"
  (drop)="onDrop($event)"
/>

// Connection limit via validator:
maxTwoOutgoing = (conn, nodes, edges) =>
  edges.filter((e) => e.source === conn.source).length < 2;

// Drag & drop da paleta → coordenadas do flow:
onDrop(e: DragEvent) {
  const pos = this.flow().screenToFlow({ x: e.clientX, y: e.clientY });
  this.nodes.update((ns) => [...ns, { id: uid(), label: '...', position: pos }]);
}`;

  readonly flowContextMenuCode = `<atm-flow #flow [(nodes)]="nodes" [(edges)]="edges" (contextMenu)="onCtx($event)" />
<atm-context-menu #menu (itemClick)="onAction($event)" />

// Uma única instância; itens e header dinâmicos conforme o alvo:
onCtx(e: AtmFlowContextMenuEvent) {
  const items = e.node ? this.nodeItems         // menu próprio do node
              : e.edge ? this.edgeItems(e.edge) // menu da conexão
              : this.canvasItems;               // menu geral do canvas
  const header = e.node ? e.node.label : e.edge ? 'Conexão' : 'Canvas';
  this.menu().open(e.event, { items, header, data: e });
}

// O data (evento do flow) volta em cada clique — com a posição em
// coordenadas do flow, pronta para criar um node naquele ponto:
onAction(sel: AtmContextMenuSelect) {
  const e = sel.data as AtmFlowContextMenuEvent;
  switch (sel.item.value) {
    case 'add-node':
      this.nodes.update((ns) => [...ns, { id: uid(), label: 'Novo', position: e.position }]);
      break;
    case 'duplicate':   /* e.node é o node clicado */ break;
    case 'delete-edge': /* e.edge é a conexão clicada */ break;
  }
}`;

  readonly addDropCode = `<atm-flow #flow [(nodes)]="nodes" [(edges)]="edges" (connectEnd)="onConnectEnd($event)" />

onConnectEnd(e: AtmFlowConnectEnd) {
  if (e.connection) return;               // conectou normalmente
  const screen = this.flow().flowToScreen(e.position); // posição na tela p/ posicionar o menu
  this.menu.set({ ...screen, flow: e.position, source: e.source, sourceHandle: e.sourceHandle });
}

pickModule(mod) {
  const id = uid();
  this.nodes.update((ns) => [...ns, { id, label: mod.label, icon: mod.icon, position: this.menu().flow }]);
  this.edges.update((es) => [...es, { id: uid(), source: this.menu().source, target: id }]);
  this.menu.set(null);
}`;

  readonly eventsCode = `<atm-flow
  [(nodes)]="nodes"
  [(edges)]="edges"
  (nodeClick)="..."          (nodeDoubleClick)="..."
  (nodeDragStart)="..."      (nodeDragStop)="..."
  (edgeClick)="..."          (edgeDoubleClick)="..."
  (edgeReconnect)="..."      (connect)="..."
  (connectEnd)="..."         (paneClick)="..."
  (selectionChange)="..."    (contextMenu)="..."
  (deleted)="..."            (viewportChange)="..."
/>

// Reconectar: selecione uma edge e arraste a bolinha da ponta para outro
// node/handle — emite (edgeReconnect) com { edge, previous, connection }.
// Desative com [reconnectable]="false".`;

  readonly jsonCode = `<atm-flow #flow [(nodes)]="nodes" [(edges)]="edges" direction="TB" />

// Auto layout em camadas (Sugiyama simplificado):
flow().autoLayout('LR'); // ou 'TB'

// Save & restore:
const json = flow().toJson();   // { nodes, edges, viewport }
flow().loadJson(json);`;

  readonly stressCode = `<!-- Culling: acima de [cullingThreshold] (250) só a viewport é renderizada -->
<atm-flow
  [(nodes)]="nodes"
  [(edges)]="edges"
  defaultEdgeType="straight"
  defaultMarkerEnd="none"
  [helperLines]="false"
  [cullingThreshold]="250"
/>`;
}
