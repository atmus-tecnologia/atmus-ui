import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AtmSize } from '../../types';

/** Um personagem do escritório virtual. */
export interface AtmOfficeAgent {
  id: string;
  name: string;
  /** Cargo exibido na mesa. */
  role?: string;
  /** Cor da camiseta (qualquer cor CSS). Padrão: cicla os tokens do tema. */
  color?: string;
  /** Chefe: mesa executiva, coroa e cabeceira da sala de reunião. */
  boss?: boolean;
}

/** Handle fluente para comandar um agente: office.agent('ana').moveTo('pedro').talk('Oi!') */
export interface AtmOfficeAgentHandle {
  /** Anda até ficar ao lado de outro agente. */
  moveTo(targetId: string): AtmOfficeAgentHandle;
  /** Anda até um ponto do mundo (0..1000 x 0..640). */
  goTo(x: number, y: number): AtmOfficeAgentHandle;
  /** Mostra um balão de fala pelo tempo indicado. */
  talk(text: string, ms?: number): AtmOfficeAgentHandle;
  /** Pausa na fila de comandos. */
  wait(ms: number): AtmOfficeAgentHandle;
  /** Volta para a própria mesa. */
  backToDesk(): AtmOfficeAgentHandle;
  /** Cancela tudo que estava na fila. */
  stop(): AtmOfficeAgentHandle;
}

interface Vec {
  x: number;
  y: number;
}

type OfficeCmd =
  | { kind: 'goto'; to: Vec }
  | { kind: 'approach'; target: string }
  | { kind: 'say'; text: string; ms: number; until?: number }
  | { kind: 'wait'; ms: number; until?: number }
  | { kind: 'face'; dir: 1 | -1 };

interface SimAgent {
  id: string;
  pos: Vec;
  face: 1 | -1;
  walking: boolean;
  queue: OfficeCmd[];
  bubble: { text: string; start: number; until: number } | null;
  /** Marca que executou comandos desde o último "idle" (para emitir agentIdle). */
  wasBusy: boolean;
}

/* ------------------------------------------------------------------ */
/* Mundo (coordenadas fixas 1000 x 640)                                */
/* ------------------------------------------------------------------ */

const WORLD_W = 1000;
const WORLD_H = 640;

const BOSS_HOME: Vec = { x: 215, y: 208 };
const BOSS_SEAT: Vec = { x: 698, y: 228 };
const TABLE_CX = 812;

/** Colunas/linhas das mesas dos funcionários (até 6 no layout largo, até 8 no compacto). */
const SLOT_ROWS = [392, 560];
const SLOT_COLS_3 = [145, 315, 485];
const SLOT_COLS_4 = [110, 258, 406, 554];

const DEFAULT_TEAM: AtmOfficeAgent[] = [
  { id: 'amelia', name: 'Amelia', role: 'CEO', boss: true },
  { id: 'lucas', name: 'Lucas', role: 'Dev Backend' },
  { id: 'mariana', name: 'Mariana', role: 'Dev Frontend' },
  { id: 'pedro', name: 'Pedro', role: 'QA' },
  { id: 'ana', name: 'Ana', role: 'Designer' },
  { id: 'rafael', name: 'Rafael', role: 'DevOps' },
];

const DEFAULT_PHRASES = [
  'Pode revisar meu PR?',
  'O deploy passou na pipeline!',
  'Achei um bug no drawer, vem ver.',
  'Bora alinhar a sprint?',
  'O cliente aprovou o layout!',
  'CI está verde de novo.',
  'Te mando o link do Figma.',
  'Esse endpoint tá lento, vou olhar.',
  'Fechei a issue do overlay.',
  'Café? Preciso de 5 minutos.',
];

const DEFAULT_REPLIES = ['Boa!', 'Show, valeu!', 'Deixa comigo.', 'Perfeito!', 'Pode mandar.', 'Já olho isso.'];

/** Tokens usados como cor de camiseta quando o agente não define `color`. */
const SHIRT_TOKENS = ['--atm-primary', '--atm-success', '--atm-info', '--atm-warning', '--atm-danger', '--atm-primary-hover'];

/** Arte dos personagens (tons de pele/cabelo — independem do tema, como um sprite). */
const SKINS = ['#f2c9a2', '#e0ac7e', '#c68e63', '#9c6b45'];
const HAIRS = ['#2f2a26', '#4a342a', '#1c1c1e', '#5b4632'];
const PANTS = '#3d3d49';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function linspace(a: number, b: number, n: number): number[] {
  if (n <= 1) return [(a + b) / 2];
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

/**
 * Escritório virtual animado — personagens que andam entre as mesas, conversam
 * em balões de fala e se reúnem na sala de reunião ao redor do chefe.
 *
 * Pensado para ser controlado por código (ex.: eventos de assistentes de IA
 * vindos do backend) através de uma API fluente:
 *
 *   <atm-office #office [agents]="team" [demo]="true" (agentClick)="..." />
 *
 *   office.agent('ana').moveTo('pedro').talk('Pode revisar meu PR?').backToDesk();
 *   office.visit('mariana', 'lucas', 'CI quebrou no seu branch');
 *   office.meeting('Planejamento da sprint');   // todos para a sala de reunião
 *   office.backToWork();                        // todos voltam às mesas
 *
 * Cada agente tem uma fila de comandos processada em sequência (goto, approach,
 * say, wait, face). Renderização em canvas 2D com as cores dos tokens do tema
 * (dark mode automático), sem dependências externas.
 */
@Component({
  selector: 'atm-office',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div class="flex w-full flex-col gap-2.5">
      <div class="relative w-full overflow-hidden rounded-atm-lg border border-line bg-surface">
        <canvas
          #canvas
          role="img"
          aria-label="Escritório virtual animado"
          class="block w-full"
          style="aspect-ratio: 1000 / 640"
          (click)="onCanvasClick($event)"
          (pointermove)="onCanvasMove($event)"
        ></canvas>
      </div>

      @if (showLegend()) {
        <div class="flex flex-wrap gap-1.5">
          @for (a of visibleAgents(); track a.id) {
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface
                px-2.5 py-1 text-ink-muted"
              [class]="legendText()"
            >
              <span class="size-2 shrink-0 rounded-full" [style.background]="agentCssColor(a)"></span>
              <span class="font-semibold text-ink">{{ a.name }}</span>
              <span>{{ statusLabel(a.id) }}</span>
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class AtmOffice {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly size = input<AtmSize>('medium');
  /** Personagens (1 chefe + até 8 funcionários). */
  readonly agents = input<AtmOfficeAgent[]>(DEFAULT_TEAM);
  /** Conversas espontâneas entre os agentes. */
  readonly demo = input(false);
  /** Velocidade de caminhada (unidades do mundo por segundo). */
  readonly speed = input(130);
  /** Letreiro pendurado na parede. */
  readonly title = input('Atmus · Team Room');
  /** Chips com o status ao vivo de cada agente abaixo da cena. */
  readonly showLegend = input(true);
  /** Frases usadas nas conversas espontâneas / quando talk() não recebe texto. */
  readonly phrases = input<string[]>(DEFAULT_PHRASES);
  /** Respostas curtas de quem ouve uma visita. */
  readonly replies = input<string[]>(DEFAULT_REPLIES);

  /** Clique em um personagem. */
  readonly agentClick = output<AtmOfficeAgent>();
  /** Agente terminou tudo que estava na fila (útil para orquestração do backend). */
  readonly agentIdle = output<string>();

  /** Verdadeiro enquanto a equipe está na sala de reunião. */
  readonly inMeeting = signal(false);
  /** Status textual de cada agente (na mesa / andando / falando / em reunião). */
  readonly statuses = signal<Record<string, string>>({});

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly sim = new Map<string, SimAgent>();
  private ctx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private themeObserver: MutationObserver | null = null;
  private raf = 0;
  private demoTimer: ReturnType<typeof setInterval> | null = null;
  private statusTimer: ReturnType<typeof setInterval> | null = null;
  private palette = new Map<string, string>();

  /* ── Layout: mesas e assentos por agente ─────────────────────────── */

  private readonly layout = computed(() => {
    const list = this.agents();
    const boss = list.find((a) => a.boss) ?? list[0];
    const workers = list.filter((a) => a !== boss).slice(0, 8);
    const cols = workers.length > 6 ? SLOT_COLS_4 : SLOT_COLS_3;

    const homes = new Map<string, Vec>();
    const seats = new Map<string, Vec>();
    if (boss) {
      homes.set(boss.id, BOSS_HOME);
      seats.set(boss.id, BOSS_SEAT);
    }
    workers.forEach((w, i) => {
      homes.set(w.id, { x: cols[i % cols.length], y: SLOT_ROWS[Math.floor(i / cols.length) % SLOT_ROWS.length] });
    });
    const nTop = Math.ceil(workers.length / 2);
    const top = linspace(750, 880, nTop);
    const bottom = linspace(755, 875, workers.length - nTop);
    workers.forEach((w, i) => {
      seats.set(w.id, i < nTop ? { x: top[i], y: 152 } : { x: bottom[i - nTop], y: 306 });
    });

    return { bossId: boss?.id ?? '', workerIds: workers.map((w) => w.id), homes, seats };
  });

  /** Agentes efetivamente simulados (chefe + funcionários com mesa). */
  readonly visibleAgents = computed(() => {
    const { bossId, workerIds } = this.layout();
    const ids = new Set([bossId, ...workerIds]);
    return this.agents().filter((a) => ids.has(a.id));
  });

  readonly legendText = computed(() => (this.size() === 'large' ? 'text-sm' : 'text-xs'));

  constructor() {
    // Sincroniza a simulação com a lista de agentes.
    effect(() => {
      const layout = this.layout();
      const ids = new Set([layout.bossId, ...layout.workerIds]);
      for (const id of [...this.sim.keys()]) if (!ids.has(id)) this.sim.delete(id);
      for (const id of ids) {
        if (!id || this.sim.has(id)) continue;
        const home = layout.homes.get(id) ?? { x: WORLD_W / 2, y: WORLD_H / 2 };
        this.sim.set(id, {
          id,
          pos: { ...home },
          face: 1,
          walking: false,
          queue: [],
          bubble: null,
          wasBusy: false,
        });
      }
    });

    // Liga o canvas quando ele entra no DOM.
    effect(() => {
      const canvas = this.canvasRef()?.nativeElement ?? null;
      this.teardownCanvas();
      if (!canvas) return;
      this.ctx = canvas.getContext('2d');
      this.refreshPalette();
      this.resizeObserver = new ResizeObserver(() => this.fitCanvas(canvas));
      this.resizeObserver.observe(canvas);
      this.fitCanvas(canvas);
      this.startLoop();
    });

    // Modo demo: conversas espontâneas.
    effect(() => {
      const on = this.demo();
      if (this.demoTimer) {
        clearInterval(this.demoTimer);
        this.demoTimer = null;
      }
      if (!on) return;
      this.zone.runOutsideAngular(() => {
        this.demoTimer = setInterval(() => {
          if (!this.inMeeting() && Math.random() < 0.6) this.randomChat();
        }, 4200);
      });
    });

    // Repinta a paleta quando o dark mode alterna na tag <html>.
    this.themeObserver = new MutationObserver(() => this.refreshPalette());
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Atualiza os chips de status algumas vezes por segundo (fora do loop de render).
    this.statusTimer = setInterval(() => this.updateStatuses(), 400);

    this.destroyRef.onDestroy(() => {
      this.teardownCanvas();
      this.themeObserver?.disconnect();
      if (this.demoTimer) clearInterval(this.demoTimer);
      if (this.statusTimer) clearInterval(this.statusTimer);
    });
  }

  /* ── API pública ─────────────────────────────────────────────────── */

  /** Handle fluente para comandar um agente pelo id. */
  agent(id: string): AtmOfficeAgentHandle {
    const push = (cmd: OfficeCmd) => this.sim.get(id)?.queue.push(cmd);
    const handle: AtmOfficeAgentHandle = {
      moveTo: (targetId) => {
        push({ kind: 'approach', target: targetId });
        return handle;
      },
      goTo: (x, y) => {
        push({ kind: 'goto', to: { x, y } });
        return handle;
      },
      talk: (text, ms = 2800) => {
        push({ kind: 'say', text: text || pick(this.phrases()), ms });
        return handle;
      },
      wait: (ms) => {
        push({ kind: 'wait', ms });
        return handle;
      },
      backToDesk: () => {
        const home = this.layout().homes.get(id);
        if (home) push({ kind: 'goto', to: home });
        return handle;
      },
      stop: () => {
        const a = this.sim.get(id);
        if (a) {
          a.queue.length = 0;
          a.bubble = null;
        }
        return handle;
      },
    };
    return handle;
  }

  /** `from` anda até `to`, fala, ouve a resposta e volta para a própria mesa. */
  visit(fromId: string, toId: string, text?: string, reply?: string): void {
    const a = this.sim.get(fromId);
    const b = this.sim.get(toId);
    if (!a || !b || fromId === toId) return;
    const travel = (Math.hypot(b.pos.x - a.pos.x, b.pos.y - a.pos.y) / this.speed()) * 1000;
    this.agent(fromId).moveTo(toId).talk(text?.trim() || pick(this.phrases()), 2800).wait(2300).backToDesk();
    this.agent(toId).wait(travel + 3100).talk(reply ?? pick(this.replies()), 1900);
  }

  /** Dois agentes ociosos puxam assunto (usado pelo modo demo). */
  randomChat(): void {
    const idle = [...this.sim.values()].filter((a) => a.queue.length === 0).map((a) => a.id);
    if (idle.length < 2) return;
    const from = pick(idle);
    this.visit(from, pick(idle.filter((x) => x !== from)));
  }

  /** Chefe convoca todos para a sala de reunião e apresenta a pauta. */
  meeting(topic?: string): void {
    const { bossId, workerIds, seats } = this.layout();
    if (!bossId) return;
    this.inMeeting.set(true);
    for (const a of this.sim.values()) {
      a.queue.length = 0;
      a.bubble = null;
    }
    const bossSeat = seats.get(bossId)!;
    this.agent(bossId)
      .talk('Reunião, pessoal!', 1600)
      .goTo(bossSeat.x, bossSeat.y)
      .wait(1400)
      .talk(topic?.trim() || 'Vamos alinhar as prioridades da semana.', 5200);
    workerIds.forEach((id, i) => {
      const seat = seats.get(id)!;
      this.agent(id).wait(500 + i * 280).goTo(seat.x, seat.y);
      this.sim.get(id)?.queue.push({ kind: 'face', dir: seat.x < TABLE_CX ? 1 : -1 });
    });
    if (workerIds.length) this.agent(pick(workerIds)).wait(7200).talk('Anotado!', 1600);
  }

  /** Todos largam o que estão fazendo e voltam para as mesas. */
  backToWork(): void {
    this.inMeeting.set(false);
    let i = 0;
    for (const a of this.sim.values()) {
      a.queue.length = 0;
      a.bubble = null;
      this.agent(a.id).wait(i++ * 200).backToDesk();
    }
  }

  /** Cancela todas as filas de comandos (sem mover ninguém). */
  stopAll(): void {
    for (const a of this.sim.values()) {
      a.queue.length = 0;
      a.bubble = null;
    }
    this.inMeeting.set(false);
  }

  /** True se o agente ainda tem comandos na fila. */
  isBusy(id: string): boolean {
    return (this.sim.get(id)?.queue.length ?? 0) > 0;
  }

  /* ── Interação ───────────────────────────────────────────────────── */

  onCanvasClick(event: MouseEvent): void {
    const hit = this.hitTest(event);
    if (hit) this.agentClick.emit(hit);
  }

  onCanvasMove(event: PointerEvent): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (canvas) canvas.style.cursor = this.hitTest(event) ? 'pointer' : 'default';
  }

  /** Status atual de um agente (para os chips da legenda). */
  statusLabel(id: string): string {
    return this.statuses()[id] || 'na mesa';
  }

  /** Cor da camiseta como CSS (para os chips da legenda). */
  agentCssColor(agent: AtmOfficeAgent): string {
    const custom = agent.color;
    if (custom) return custom;
    return `var(${this.shirtToken(agent)})`;
  }

  /* ── Internals: engine ───────────────────────────────────────────── */

  private shirtToken(agent: AtmOfficeAgent): string {
    if (agent.boss) return SHIRT_TOKENS[0];
    const i = this.layout().workerIds.indexOf(agent.id);
    return SHIRT_TOKENS[1 + ((i < 0 ? 0 : i) % (SHIRT_TOKENS.length - 1))];
  }

  private startLoop(): void {
    this.zone.runOutsideAngular(() => {
      let last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        this.step(now, dt);
        this.draw(now);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    });
  }

  private step(now: number, dt: number): void {
    const idleNow: string[] = [];

    for (const a of this.sim.values()) {
      if (a.bubble && now >= a.bubble.until) a.bubble = null;
      a.walking = false;
      const cmd = a.queue[0];
      if (!cmd) {
        if (a.wasBusy) {
          a.wasBusy = false;
          idleNow.push(a.id);
        }
        continue;
      }
      a.wasBusy = true;

      if (cmd.kind === 'goto' || cmd.kind === 'approach') {
        let to: Vec | null = null;
        if (cmd.kind === 'goto') {
          to = cmd.to;
        } else {
          const target = this.sim.get(cmd.target);
          if (!target) {
            a.queue.shift();
            continue;
          }
          // Ponto a 46 unidades do alvo, na direção de quem se aproxima.
          const dx = a.pos.x - target.pos.x;
          const dy = a.pos.y - target.pos.y;
          const d = Math.hypot(dx, dy) || 1;
          to = { x: target.pos.x + (dx / d) * 46, y: target.pos.y + (dy / d) * 46 };
        }
        const dx = to.x - a.pos.x;
        const dy = to.y - a.pos.y;
        const dist = Math.hypot(dx, dy);
        const stepLen = this.speed() * dt;
        if (dist <= Math.max(3, stepLen)) {
          a.pos = { ...to };
          if (cmd.kind === 'approach') {
            const target = this.sim.get(cmd.target);
            if (target) a.face = target.pos.x >= a.pos.x ? 1 : -1;
          }
          a.queue.shift();
        } else {
          a.pos.x += (dx / dist) * stepLen;
          a.pos.y += (dy / dist) * stepLen;
          if (Math.abs(dx) > 4) a.face = dx >= 0 ? 1 : -1;
          a.walking = true;
        }
      } else if (cmd.kind === 'say') {
        if (cmd.until === undefined) {
          cmd.until = now + cmd.ms;
          a.bubble = { text: cmd.text, start: now, until: cmd.until };
          // Quem está perto vira para ouvir.
          for (const other of this.sim.values()) {
            if (other.id === a.id || other.walking) continue;
            if (Math.hypot(other.pos.x - a.pos.x, other.pos.y - a.pos.y) < 95) {
              other.face = a.pos.x >= other.pos.x ? 1 : -1;
            }
          }
        }
        if (now >= cmd.until) a.queue.shift();
      } else if (cmd.kind === 'wait') {
        if (cmd.until === undefined) cmd.until = now + cmd.ms;
        if (now >= cmd.until) a.queue.shift();
      } else {
        a.face = cmd.dir;
        a.queue.shift();
      }
    }

    if (idleNow.length) {
      this.zone.run(() => idleNow.forEach((id) => this.agentIdle.emit(id)));
    }
  }

  private updateStatuses(): void {
    const next: Record<string, string> = {};
    for (const a of this.sim.values()) next[a.id] = this.statusOf(a);
    const prev = this.statuses();
    const changed =
      Object.keys(next).length !== Object.keys(prev).length ||
      Object.keys(next).some((k) => next[k] !== prev[k]);
    if (changed) this.statuses.set(next);
  }

  private statusOf(a: SimAgent): string {
    if (a.walking) return 'andando';
    if (a.bubble) return 'falando';
    if (this.inMeeting()) return 'em reunião';
    if (a.queue.length > 0) return 'ocupado';
    return 'na mesa';
  }

  private hitTest(event: MouseEvent): AtmOfficeAgent | null {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const wx = ((event.clientX - rect.left) / rect.width) * WORLD_W;
    const wy = ((event.clientY - rect.top) / rect.height) * WORLD_H;
    for (const agent of this.visibleAgents()) {
      const s = this.sim.get(agent.id);
      if (!s) continue;
      if (Math.abs(wx - s.pos.x) < 22 && wy > s.pos.y - 62 && wy < s.pos.y + 10) return agent;
    }
    return null;
  }

  /* ── Internals: tema / canvas ────────────────────────────────────── */

  private refreshPalette(): void {
    const cs = getComputedStyle(this.host.nativeElement);
    const vars = [
      '--atm-bg', '--atm-surface', '--atm-surface-alt', '--atm-surface-raised',
      '--atm-line', '--atm-line-strong', '--atm-ink', '--atm-ink-muted', '--atm-ink-faint',
      '--atm-primary', '--atm-primary-hover', '--atm-success', '--atm-warning',
      '--atm-danger', '--atm-info',
    ];
    for (const v of vars) this.palette.set(v, cs.getPropertyValue(v).trim());
  }

  private token(name: string, fallback = '#888888'): string {
    return this.palette.get(name) || fallback;
  }

  private resolveShirt(agent: AtmOfficeAgent): string {
    return agent.color || this.token(this.shirtToken(agent));
  }

  private fitCanvas(canvas: HTMLCanvasElement): void {
    const w = canvas.clientWidth;
    if (!w) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * (WORLD_H / WORLD_W) * dpr);
  }

  private teardownCanvas(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.ctx = null;
  }

  /* ── Internals: desenho ──────────────────────────────────────────── */

  private draw(now: number): void {
    const canvas = this.canvasRef()?.nativeElement;
    const ctx = this.ctx;
    if (!canvas || !ctx || !canvas.width) return;

    const s = canvas.width / WORLD_W;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    ctx.textBaseline = 'alphabetic';

    this.drawFloor(ctx);
    this.drawWallDecor(ctx);
    this.drawMeetingRoom(ctx);
    this.drawLounge(ctx);
    this.drawPlant(ctx, 70, 120);
    this.drawPlant(ctx, 592, 588);

    // Entidades ordenadas pela base (quem está mais "embaixo" desenha por cima).
    const layout = this.layout();
    const entities: { baseY: number; render: () => void }[] = [];

    for (const agent of this.visibleAgents()) {
      const home = layout.homes.get(agent.id);
      if (!home) continue;
      if (agent.boss) {
        entities.push({ baseY: home.y - 26, render: () => this.drawBossDesk(ctx, home, agent.role ?? '') });
      } else {
        entities.push({ baseY: home.y - 26, render: () => this.drawDesk(ctx, home, agent.role ?? '') });
      }
    }
    // Mesa de reunião entra na ordenação para os assentos de cima/baixo.
    entities.push({ baseY: 288, render: () => this.drawMeetingTable(ctx) });

    for (const agent of this.visibleAgents()) {
      const sim = this.sim.get(agent.id);
      if (!sim) continue;
      entities.push({
        baseY: sim.pos.y,
        render: () => this.drawPerson(ctx, sim, agent, now),
      });
    }

    entities.sort((a, b) => a.baseY - b.baseY).forEach((e) => e.render());

    // Balões por cima de tudo.
    for (const agent of this.visibleAgents()) {
      const sim = this.sim.get(agent.id);
      if (sim?.bubble) this.drawBubble(ctx, sim, now);
    }
  }

  private drawFloor(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.token('--atm-surface');
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.fillStyle = this.token('--atm-bg');
    this.rr(ctx, 20, 20, WORLD_W - 40, WORLD_H - 40, 14);
    ctx.fill();
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 2;
    this.rr(ctx, 20, 20, WORLD_W - 40, WORLD_H - 40, 14);
    ctx.stroke();

    // Tábuas do piso.
    ctx.strokeStyle = this.token('--atm-line');
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    for (let x = 100; x < 960; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 22);
      ctx.lineTo(x, WORLD_H - 22);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Tapete da área de trabalho.
    ctx.fillStyle = this.token('--atm-surface-alt');
    ctx.globalAlpha = 0.6;
    this.rr(ctx, 55, 255, 520, 345, 12);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawWallDecor(ctx: CanvasRenderingContext2D): void {
    // Letreiro.
    ctx.fillStyle = this.token('--atm-ink');
    this.rr(ctx, 350, 40, 220, 36, 7);
    ctx.fill();
    ctx.fillStyle = this.token('--atm-surface');
    ctx.font = '700 13px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.title().toUpperCase(), 460, 63);

    // Relógio com a hora real.
    const cx = 600;
    const cy = 64;
    ctx.fillStyle = this.token('--atm-surface');
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const d = new Date();
    const ha = ((d.getHours() % 12) + d.getMinutes() / 60) * (Math.PI / 6) - Math.PI / 2;
    const ma = d.getMinutes() * (Math.PI / 30) - Math.PI / 2;
    ctx.strokeStyle = this.token('--atm-ink-muted');
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ha) * 6, cy + Math.sin(ha) * 6);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ma) * 9, cy + Math.sin(ma) * 9);
    ctx.stroke();
  }

  private drawMeetingRoom(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.token('--atm-surface-alt');
    ctx.globalAlpha = 0.45;
    this.rr(ctx, 630, 50, 345, 360, 12);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 2;
    this.rr(ctx, 630, 50, 345, 360, 12);
    ctx.stroke();

    ctx.fillStyle = this.token('--atm-ink-faint');
    ctx.font = '700 11px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SALA DE REUNIÃO', 802, 78);

    // Quadro com post-its (tokens de status como cores).
    ctx.fillStyle = this.token('--atm-surface');
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.4;
    this.rr(ctx, 742, 88, 150, 42, 4);
    ctx.fill();
    ctx.stroke();
    const stickies = ['--atm-warning', '--atm-info', '--atm-danger', '--atm-success', '--atm-primary', '--atm-info'];
    stickies.forEach((tokenName, i) => {
      ctx.fillStyle = this.token(tokenName);
      ctx.globalAlpha = 0.85;
      ctx.fillRect(752 + (i % 3) * 44, 94 + Math.floor(i / 3) * 16, 11, 11);
    });
    ctx.globalAlpha = 1;

    // Cadeiras.
    const { seats } = this.layout();
    ctx.fillStyle = this.token('--atm-surface-alt');
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.2;
    for (const seat of seats.values()) {
      ctx.beginPath();
      ctx.arc(seat.x, seat.y + 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawMeetingTable(ctx: CanvasRenderingContext2D): void {
    // Sombra + tampo + face frontal (efeito 2.5D).
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.ellipse(812, 276, 88, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.token('--atm-surface-raised');
    this.rr(ctx, 728, 186, 168, 72, 34);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    this.rr(ctx, 728, 244, 168, 26, 13);
    ctx.fill();
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.4;
    this.rr(ctx, 728, 186, 168, 84, 34);
    ctx.stroke();
    // Notebook na mesa.
    ctx.fillStyle = this.token('--atm-ink-faint');
    ctx.globalAlpha = 0.55;
    this.rr(ctx, 790, 214, 44, 24, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawDesk(ctx: CanvasRenderingContext2D, home: Vec, role: string): void {
    const x = home.x - 65;
    const y = home.y - 92;
    this.desk25d(ctx, x, y, 130, 48);
    this.monitor(ctx, home.x, y + 6, 40, 24);
    // Caneca.
    ctx.fillStyle = this.token('--atm-danger');
    ctx.globalAlpha = 0.75;
    this.rr(ctx, x + 100, y + 18, 12, 9, 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Plantinha.
    ctx.fillStyle = this.token('--atm-success');
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(x + 17, y + 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    this.roleTag(ctx, home.x, y - 7, role);
  }

  private drawBossDesk(ctx: CanvasRenderingContext2D, home: Vec, role: string): void {
    const x = home.x - 95;
    const y = home.y - 98;
    this.desk25d(ctx, x, y, 190, 54);
    this.monitor(ctx, home.x - 26, y + 8, 38, 24);
    this.monitor(ctx, home.x + 26, y + 8, 38, 24);
    ctx.fillStyle = this.token('--atm-success');
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(x + 20, y + 16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    this.roleTag(ctx, home.x, y - 8, role);
  }

  /** Mesa com tampo claro + face frontal sombreada + cadeira. */
  private desk25d(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    const cx = x + w / 2;
    // Cadeira (atrás do personagem quando ele está na mesa).
    ctx.fillStyle = this.token('--atm-surface-alt');
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, y + h + 46, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Sombra da mesa.
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.ellipse(cx, y + h + 16, w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tampo.
    ctx.fillStyle = this.token('--atm-surface-raised');
    this.rr(ctx, x, y, w, h - 14, 8);
    ctx.fill();
    // Face frontal.
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    this.rr(ctx, x, y + h - 22, w, 22, 8);
    ctx.fill();
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.4;
    this.rr(ctx, x, y, w, h, 8);
    ctx.stroke();
  }

  private monitor(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number, h: number): void {
    ctx.fillStyle = this.token('--atm-ink');
    this.rr(ctx, cx - w / 2, y, w, h, 3);
    ctx.fill();
    ctx.fillStyle = this.token('--atm-primary');
    ctx.globalAlpha = 0.35;
    this.rr(ctx, cx - w / 2 + 3, y + 3, w - 6, h - 6, 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.token('--atm-ink');
    ctx.fillRect(cx - 3, y + h, 6, 4);
  }

  private roleTag(ctx: CanvasRenderingContext2D, cx: number, y: number, role: string): void {
    if (!role) return;
    ctx.fillStyle = this.token('--atm-ink-faint');
    ctx.font = '700 9.5px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(role.toUpperCase(), cx, y);
  }

  private drawLounge(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.token('--atm-surface-alt');
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(800, 525, 115, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Sofá.
    ctx.fillStyle = this.token('--atm-line-strong');
    this.rr(ctx, 706, 480, 140, 18, 8);
    ctx.fill();
    ctx.fillStyle = this.token('--atm-surface-raised');
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.4;
    this.rr(ctx, 700, 492, 152, 34, 12);
    ctx.fill();
    ctx.stroke();
    // Bebedouro.
    ctx.fillStyle = this.token('--atm-surface');
    ctx.strokeStyle = this.token('--atm-line-strong');
    this.rr(ctx, 890, 492, 22, 38, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.token('--atm-info');
    ctx.globalAlpha = 0.55;
    this.rr(ctx, 893, 478, 16, 16, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
    this.drawPlant(ctx, 938, 566);
  }

  private drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = this.token('--atm-surface-alt');
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.2;
    this.rr(ctx, x - 9, y, 18, 16, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.token('--atm-success');
    for (const [dx, dy, r, a] of [[-5, -10, 9, 0.75], [7, -13, 11, 0.6], [1, -4, 7, 0.85]] as const) {
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawPerson(ctx: CanvasRenderingContext2D, sim: SimAgent, agent: AtmOfficeAgent, now: number): void {
    const idx = Math.max(0, this.visibleAgents().findIndex((a) => a.id === agent.id));
    const k = this.size() === 'large' ? 1.12 : this.size() === 'slim' ? 0.92 : 1;
    const t = now / 1000;
    const seed = idx * 1.7;
    const bob = sim.walking ? -Math.abs(Math.sin(t * 9 + seed)) * 3 : Math.sin(t * 1.6 + seed) * 1.1;
    const swing = sim.walking ? Math.sin(t * 10 + seed) * 6 : 0;
    const shirt = this.resolveShirt(agent);
    const skin = SKINS[idx % SKINS.length];
    const hair = HAIRS[idx % HAIRS.length];

    ctx.save();
    ctx.translate(sim.pos.x, sim.pos.y);
    ctx.scale(k, k);

    // Sombra.
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, bob);

    // Pernas.
    ctx.strokeStyle = PANTS;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4.5, -13);
    ctx.lineTo(-4.5 + swing, -1);
    ctx.moveTo(4.5, -13);
    ctx.lineTo(4.5 - swing, -1);
    ctx.stroke();

    // Corpo.
    ctx.fillStyle = shirt;
    this.rr(ctx, -11, -36, 22, 26, 9);
    ctx.fill();

    // Cabeça + cabelo.
    ctx.fillStyle = skin;
    this.rr(ctx, -9, -54, 18, 19, 7);
    ctx.fill();
    ctx.fillStyle = hair;
    this.rr(ctx, -9, -54, 18, 8, 7);
    ctx.fill();
    ctx.fillRect(sim.face === 1 ? -9 : 3, -50, 6, 7);

    // Olhos.
    ctx.fillStyle = '#1f2430';
    const ex = sim.face * 2.4;
    ctx.beginPath();
    ctx.arc(ex - 2.4, -43, 1.4, 0, Math.PI * 2);
    ctx.arc(ex + 2.8, -43, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Coroa do chefe.
    if (agent.boss) {
      ctx.fillStyle = '#f5c542';
      ctx.beginPath();
      ctx.moveTo(-6, -55);
      ctx.lineTo(-3.5, -60);
      ctx.lineTo(0, -55);
      ctx.lineTo(3.5, -60);
      ctx.lineTo(6, -55);
      ctx.lineTo(6, -53);
      ctx.lineTo(-6, -53);
      ctx.closePath();
      ctx.fill();
    }

    // Nome.
    ctx.font = '600 10px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    const nw = ctx.measureText(agent.name).width + 10;
    ctx.fillStyle = this.token('--atm-surface');
    ctx.globalAlpha = 0.85;
    this.rr(ctx, -nw / 2, 8 - bob, nw, 14, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.token('--atm-ink-muted');
    ctx.fillText(agent.name, 0, 18 - bob);

    ctx.restore();
  }

  private drawBubble(ctx: CanvasRenderingContext2D, sim: SimAgent, now: number): void {
    const bubble = sim.bubble!;
    // Fade in/out.
    const alpha = Math.max(0, Math.min(1, (now - bubble.start) / 180, (bubble.until - now) / 250));
    if (alpha <= 0) return;

    ctx.font = '500 11px Inter, ui-sans-serif, system-ui, sans-serif';
    const lines = this.wrapText(ctx, bubble.text, 175);
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20;
    const h = lines.length * 14 + 12;
    const bx = Math.min(Math.max(sim.pos.x - w / 2, 26), WORLD_W - 26 - w);
    const by = sim.pos.y - 70 - h;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.token('--atm-surface-raised');
    ctx.strokeStyle = this.token('--atm-line-strong');
    ctx.lineWidth = 1.4;
    // Rabinho.
    ctx.beginPath();
    ctx.moveTo(sim.pos.x - 5, by + h - 1);
    ctx.lineTo(sim.pos.x + 5, by + h - 1);
    ctx.lineTo(sim.pos.x, sim.pos.y - 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Caixa.
    this.rr(ctx, bx, by, w, h, 8);
    ctx.fill();
    ctx.stroke();
    // Cobre a borda entre a caixa e o rabinho.
    ctx.fillStyle = this.token('--atm-surface-raised');
    ctx.beginPath();
    ctx.moveTo(sim.pos.x - 4, by + h - 2);
    ctx.lineTo(sim.pos.x + 4, by + h - 2);
    ctx.lineTo(sim.pos.x, sim.pos.y - 61.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.token('--atm-ink');
    ctx.textAlign = 'left';
    lines.forEach((line, i) => ctx.fillText(line, bx + 10, by + 16 + i * 14));
    ctx.restore();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = '';
    for (const word of words) {
      const next = cur ? `${cur} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && cur) {
        lines.push(cur);
        cur = word;
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  /** roundRect com fallback (sempre inicia um novo path). */
  private rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }
}
