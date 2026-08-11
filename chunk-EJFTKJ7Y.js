import{a as v,b as x}from"./chunk-KGAQSRHR.js";import{A as c,Da as b,Q as n,R as h,U as l,V as s,W as d,bb as A,n as o,o as p,va as f,x as a,xa as E,y as r,z as i}from"./chunk-BJZMHQD7.js";var M=`<h2>Bem-vindo ao editor \u270D\uFE0F</h2>
<p>Todo grande produto come\xE7a com um bom texto. Selecione um trecho para ver a <strong>toolbar flutuante</strong> de formata\xE7\xE3o r\xE1pida.</p>
<p>Use a toolbar acima para <em>t\xEDtulos</em>, listas, cita\xE7\xF5es, alinhamento, links e muito mais.</p>
<blockquote>Um bom editor desaparece \u2014 sobra s\xF3 a escrita.</blockquote>`,S=`<h2>Rascunho do artigo</h2>
<p>O maior erro que muitos designers cometem \xE9 assumir que j\xE1 sabem o que os usu\xE1rios querem. Usu\xE1rios reais s\xE3o imprevis\xEDveis: eles se distraem, interpretam mal os r\xF3tulos e \xE0s vezes s\xF3 querem a forma mais r\xE1pida de terminar uma tarefa.</p>
<p>Selecione qualquer frase acima e clique em <strong>\u2728 Assistente</strong> para reescrever, resumir, mudar o tom ou traduzir. Ou clique no bot\xE3o Assistente da toolbar para agir sobre o documento inteiro.</p>`,_=`<p>O deploy do servi\xE7o <strong>Atmus API</strong> ficou agendado. O time do Projeto Alfa cuida da migra\xE7\xE3o, enquanto o Projeto Beta valida a integra\xE7\xE3o.</p>
<p>Qualquer incidente deve ser marcado como URGENTE no board \u2014 digite "Projeto Alfa", "Projeto Beta" ou "URGENTE" em qualquer lugar do texto e veja a tag aparecer sozinha.</p>`,y=class g{basicValue=M;aiValue=S;highlightValue=_;scrollValue="";highlightConfig={highlights:[{text:"Projeto Alfa",background:"#0f172a",color:"#fff"},{text:"Projeto Beta",background:"#ff8000",color:"#fff",tooltip:"Squad respons\xE1vel pela integra\xE7\xE3o"},{text:"URGENTE",background:"#ef4444",color:"#fff",tooltip:"Prioridade m\xE1xima"},{text:"Atmus API",background:"#eef2ff",color:"#4338ca",tooltip:"Servi\xE7o core"}]};basicCode='<atm-rich-text [(ngModel)]="html" placeholder="Escreva algo\u2026" />';assistantCode=`<!-- template -->
<atm-rich-text [(ngModel)]="html" [assistant]="true" [scrollHeight]="340" />

// A IA \xE9 plug\xE1vel: implemente AtmAssistantHandler e registre no token.
// Sem provider, o AtmAssistantMock simula as respostas (demo atual).
@Injectable({ providedIn: 'root' })
export class AssistantApiService implements AtmAssistantHandler {
  private readonly http = inject(HttpClient);

  run(request: AtmAssistantRequest) {
    // payload de entrada:
    // { action: 'improve' | 'summarize' | ... | 'custom',
    //   scope: 'selection' | 'document',
    //   prompt?: string,      // texto digitado pelo usu\xE1rio (action 'custom')
    //   selection?: string,   // HTML selecionado (scope 'selection')
    //   document: string }    // HTML completo, como contexto
    // resposta: { html: string } \u2014 substitui a sele\xE7\xE3o ou o documento
    return this.http.post<AtmAssistantResponse>('/api/assistant/rewrite', request);
  }
}

// app.config.ts
providers: [{ provide: ATM_ASSISTANT_HANDLER, useClass: AssistantApiService }]`;highlightsCode=`<!-- template -->
<atm-rich-text [(ngModel)]="html" [config]="config" />

// componente
readonly config: AtmRichTextConfig = {
  highlights: [
    { text: 'Projeto Alfa', background: '#0f172a', color: '#fff' },
    { text: 'Projeto Beta', background: '#ff8000', color: '#fff',
      tooltip: 'Squad respons\xE1vel pela integra\xE7\xE3o' },
    { text: 'URGENTE', background: '#ef4444', color: '#fff', tooltip: 'Prioridade m\xE1xima' },
  ],
};`;scrollCode=`<atm-rich-text [(ngModel)]="html" [scrollHeight]="160" [minHeight]="160" />
<!-- tamb\xE9m aceita string CSS: [scrollHeight]="'40vh'" -->`;statesCode=`<atm-rich-text size="slim" />
<atm-rich-text [disabled]="true" />
<atm-rich-text [invalid]="true" />`;static \u0275fac=function(m){return new(m||g)};static \u0275cmp=p({type:g,selectors:[["editor-page"]],decls:29,vars:21,consts:[["title","Rich Text","description",`Editor de texto rico com toolbar completa, bubble de formata\xE7\xE3o ao selecionar,
        assistente de IA opcional (sele\xE7\xE3o ou documento inteiro), highlights autom\xE1ticos por
        configura\xE7\xE3o e altura controlada com scroll. Integra ngModel/formControl \u2014 o valor \xE9 HTML.`,"importCode","import { AtmRichText } from '@atmus/ngui';"],["id","rich-text","title","Editor b\xE1sico","description",`Toolbar com formato de bloco, marcas inline, alinhamento, listas, cita\xE7\xE3o,
          link, limpar formata\xE7\xE3o e undo/redo. Selecione um trecho do texto para ver a toolbar
          flutuante de formata\xE7\xE3o r\xE1pida.`,3,"code"],[1,"flex","w-full","flex-col","gap-3"],["placeholder","Escreva algo\u2026",3,"ngModelChange","ngModel"],[1,"w-full"],[1,"cursor-pointer","text-xs","font-medium","text-ink-faint"],[1,"mt-2","max-h-40","overflow-auto","rounded-atm","bg-surface-alt","p-3","text-[11px]","leading-relaxed","break-all","whitespace-pre-wrap","text-ink-muted"],["id","rich-text-assistant","title","Assistente de IA","description",`Com [assistant]='true', a toolbar ganha o bot\xE3o \u2728 Assistente (age no documento
          inteiro) e o bubble de sele\xE7\xE3o ganha o menu de a\xE7\xF5es r\xE1pidas \u2014 reescrever, resumir, mudar
          tom, traduzir. As chamadas v\xE3o para o token ATM_ASSISTANT_HANDLER; sem provider registrado,
          um mock simula a API com lat\xEAncia (a integra\xE7\xE3o real vem depois).`,"language","typescript",3,"code"],[3,"ngModelChange","ngModel","assistant","scrollHeight"],["id","rich-text-highlights","title","Highlights autom\xE1ticos","description",`Passe [config].highlights com { text, background, color, tooltip } e o editor
          detecta o trecho enquanto voc\xEA digita, transformando-o numa tag colorida. Passe o mouse
          sobre 'Projeto Beta' para ver o tooltip.`,"language","typescript",3,"code"],[3,"ngModelChange","ngModel","config"],["id","rich-text-scroll","title","Altura controlada (scrollHeight)","description",`scrollHeight limita a altura da \xE1rea edit\xE1vel \u2014 passou disso, o conte\xFAdo rola.
          minHeight controla a altura m\xEDnima. Aceita n\xFAmero (px) ou string CSS ('40vh').`,3,"code"],["placeholder","Digite bastante texto para ver o scroll\u2026",3,"ngModelChange","ngModel","scrollHeight","minHeight"],["id","rich-text-states","title","Tamanhos & estados","description","Escala large / medium / slim e estados disabled e invalid.",3,"code"],[1,"flex","w-full","flex-col","gap-6"],[1,"flex","w-full","flex-col","gap-1.5"],[1,"text-xs","font-semibold","text-ink-faint","uppercase"],["size","slim","placeholder","Editor slim\u2026",3,"minHeight"],[3,"disabled","minHeight","ngModel"],["placeholder","Campo obrigat\xF3rio\u2026",3,"invalid","minHeight"]],template:function(m,e){m&1&&(r(0,"demo-page",0)(1,"demo-section",1)(2,"div",2)(3,"atm-rich-text",3),d("ngModelChange",function(t){return s(e.basicValue,t)||(e.basicValue=t),t}),i(),r(4,"details",4)(5,"summary",5),n(6," Ver HTML gerado (valor do ngModel) "),i(),r(7,"pre",6),n(8),i()()()(),r(9,"demo-section",7)(10,"atm-rich-text",8),d("ngModelChange",function(t){return s(e.aiValue,t)||(e.aiValue=t),t}),i()(),r(11,"demo-section",9)(12,"atm-rich-text",10),d("ngModelChange",function(t){return s(e.highlightValue,t)||(e.highlightValue=t),t}),i()(),r(13,"demo-section",11)(14,"atm-rich-text",12),d("ngModelChange",function(t){return s(e.scrollValue,t)||(e.scrollValue=t),t}),i()(),r(15,"demo-section",13)(16,"div",14)(17,"div",15)(18,"span",16),n(19,'size="slim"'),i(),c(20,"atm-rich-text",17),i(),r(21,"div",15)(22,"span",16),n(23,"disabled"),i(),c(24,"atm-rich-text",18),i(),r(25,"div",15)(26,"span",16),n(27,"invalid"),i(),c(28,"atm-rich-text",19),i()()()()),m&2&&(o(),a("code",e.basicCode),o(2),l("ngModel",e.basicValue),o(5),h(e.basicValue),o(),a("code",e.assistantCode),o(),l("ngModel",e.aiValue),a("assistant",!0)("scrollHeight",340),o(),a("code",e.highlightsCode),o(),l("ngModel",e.highlightValue),a("config",e.highlightConfig),o(),a("code",e.scrollCode),o(),l("ngModel",e.scrollValue),a("scrollHeight",160)("minHeight",160),o(),a("code",e.statesCode),o(5),a("minHeight",80),o(4),a("disabled",!0)("minHeight",80)("ngModel","<p>Conte\xFAdo bloqueado.</p>"),o(4),a("invalid",!0)("minHeight",80))},dependencies:[A,b,f,E,x,v],encapsulation:2,changeDetection:0})};export{y as EditorPage};
