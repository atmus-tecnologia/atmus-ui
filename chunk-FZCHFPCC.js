import{a as F,b as L}from"./chunk-KGAQSRHR.js";import{A as y,Da as D,E as C,F as f,K as E,L as O,M as h,Ma as V,Q as l,R as S,U as _,V as v,W as w,Wa as I,fa as M,g as s,h as d,k as g,kb as q,kc as x,mb as W,n as r,o as b,r as k,s as A,va as P,x as m,xa as T,y as a,z as i}from"./chunk-BJZMHQD7.js";var z=["office"];function Q(p,o){p&1&&(a(0,"p",18),l(1," \xDAltimo personagem clicado: "),a(2,"strong",23),l(3),i()()),p&2&&(r(3),S(o))}var N=[{id:"amelia",name:"Amelia",role:"CEO",boss:!0},{id:"lucas",name:"Lucas",role:"Dev Backend"},{id:"mariana",name:"Mariana",role:"Dev Frontend"},{id:"pedro",name:"Pedro",role:"QA"},{id:"ana",name:"Ana",role:"Designer"},{id:"rafael",name:"Rafael",role:"DevOps"}],R=[{id:"boss",name:"Athena",role:"Tech Lead",boss:!0,color:"#8b5cf6"},{id:"dev1",name:"Nina",role:"IA \xB7 C\xF3digo",color:"#06b6d4"},{id:"dev2",name:"Otto",role:"IA \xB7 Testes",color:"#f97316"},{id:"dev3",name:"Zara",role:"IA \xB7 Docs",color:"#ec4899"}],B=class p{office=M.required("office");team=N;squad=R;demoOn=g(!0);topic=g("");message=g("");actor=g("ana");target=g("pedro");clicked=g("");agentOptions=N.map(o=>({label:`${o.name} (${o.role})`,value:o.id}));runVisit(){this.actor()!==this.target()&&(this.office().visit(this.actor(),this.target(),this.message()),this.message.set(""))}runScript(){let o=this.office();o.stopAll(),o.agent("ana").moveTo("pedro").talk("Pode revisar meu PR?").wait(2200).backToDesk(),o.agent("pedro").wait(2600).talk("Deixa comigo!",2e3),o.agent("mariana").wait(1e3).moveTo("lucas").talk("CI quebrou no seu branch...").wait(2400).backToDesk(),o.agent("lucas").wait(4200).talk("J\xE1 olho isso.",1800),o.agent("amelia").wait(6e3).moveTo("rafael").talk("Como foi o deploy?").wait(2600).backToDesk(),o.agent("rafael").wait(9e3).talk("Tudo verde, chefe!",2200)}officeCode=`<atm-office #office [agents]="team" [demo]="true" (agentClick)="select($event)" />

<atm-button (clicked)="office.meeting('Planejamento da sprint')">Chamar reuni\xE3o</atm-button>
<atm-button (clicked)="office.backToWork()">Voltar ao trabalho</atm-button>

// componente
readonly team: AtmOfficeAgent[] = [
  { id: 'amelia', name: 'Amelia', role: 'CEO', boss: true },
  { id: 'lucas', name: 'Lucas', role: 'Dev Backend' },
  { id: 'mariana', name: 'Mariana', role: 'Dev Frontend' },
  // ...at\xE9 8 agentes + chefe
];`;customCode=`<atm-office
  [agents]="squad"
  [demo]="true"
  title="Atmus \xB7 AI Squad"
  [showLegend]="false"
  size="slim"
/>

readonly squad: AtmOfficeAgent[] = [
  { id: 'boss', name: 'Athena', role: 'Tech Lead', boss: true, color: '#8b5cf6' },
  { id: 'dev1', name: 'Nina', role: 'IA \xB7 C\xF3digo', color: '#06b6d4' },
  { id: 'dev2', name: 'Otto', role: 'IA \xB7 Testes', color: '#f97316' },
  { id: 'dev3', name: 'Zara', role: 'IA \xB7 Docs', color: '#ec4899' },
];`;apiCode=`const office = this.office(); // viewChild<AtmOffice>

// API fluente por agente \u2014 cada chamada entra na fila dele
office.agent('ana').moveTo('pedro').talk('Pode revisar meu PR?').wait(2200).backToDesk();
office.agent('pedro').wait(2600).talk('Deixa comigo!', 2000);

// Atalhos de coreografia
office.visit('mariana', 'lucas', 'CI quebrou no seu branch');  // vai, fala, ouve e volta
office.meeting('Planejamento da sprint');                      // todos para a sala, chefe fala
office.backToWork();                                           // todos voltam \xE0s mesas
office.randomChat();                                           // conversa espont\xE2nea
office.stopAll();                                              // cancela todas as filas

// Orquestra\xE7\xE3o pelo backend
// <atm-office (agentIdle)="onAgentIdle($event)" /> \u2014 agente terminou a fila
office.isBusy('ana');   // ainda tem comandos pendentes?
office.inMeeting();     // signal: reuni\xE3o em andamento`;static \u0275fac=function(u){return new(u||p)};static \u0275cmp=b({type:p,selectors:[["office-page"]],viewQuery:function(u,e){u&1&&E(e.office,z,5),u&2&&O()},decls:40,vars:16,consts:[["office",""],["title","Office","description",`Escrit\xF3rio virtual animado \u2014 os personagens andam entre as mesas, conversam em
        bal\xF5es de fala e se re\xFAnem na sala de reuni\xE3o ao redor do chefe. Todo o movimento \xE9
        comandado por uma API fluente, pensada para assistentes de IA controlados pelo backend.`,"importCode","import { AtmOffice } from '@atmus/ngui';"],["id","office","title","Escrit\xF3rio completo","description",`Equipe com chefe + 5 agentes. Ligue o modo demo para conversas espont\xE2neas,
          chame a reuni\xE3o com pauta e clique em um personagem para selecion\xE1-lo.`,3,"code"],[1,"flex","w-full","flex-col","gap-4"],[3,"agentClick","agents","demo"],[1,"flex","flex-wrap","items-center","gap-3"],["placeholder","Pauta da reuni\xE3o (opcional)",1,"max-w-64",3,"ngModelChange","ngModel"],["icon","megaphone",3,"clicked"],["variant","soft","color","neutral",3,"clicked"],[1,"ml-auto","flex","items-center","gap-2","text-sm","text-ink-muted"],[3,"ngModelChange","ngModel"],[1,"flex","flex-wrap","items-end","gap-3","rounded-atm","border","border-line","bg-surface-alt/40","p-4"],[1,"flex","min-w-44","flex-col","gap-1"],[1,"text-xs","font-semibold","text-ink-faint","uppercase"],["size","slim",3,"ngModelChange","options","ngModel"],[1,"flex","min-w-56","flex-1","flex-col","gap-1"],["placeholder","Ex.: Pode revisar meu PR?","size","slim",3,"ngModelChange","ngModel"],["size","slim",3,"clicked"],[1,"text-sm","text-ink-muted"],["id","office-custom","title","Equipe customizada","description",`Qualquer n\xFAmero de agentes (1 chefe + at\xE9 8), com cores pr\xF3prias por CSS e
          letreiro configur\xE1vel. Aqui, um squad de assistentes de IA em modo demo.`,3,"code"],["title","Atmus \xB7 AI Squad","size","slim",3,"agents","demo","showLegend"],["id","office-api","title","API para o backend","description",`Cada agente tem uma fila de comandos processada em sequ\xEAncia. O backend
          (WebSocket/SSE) s\xF3 precisa traduzir eventos dos assistentes de IA nessas chamadas \u2014
          o evento (agentIdle) avisa quando um agente terminou a fila.`,"language","typescript",3,"code"],["variant","soft","icon","play-alt-1",3,"clicked"],[1,"text-ink"]],template:function(u,e){if(u&1){let n=C();a(0,"demo-page",1)(1,"demo-section",2)(2,"div",3)(3,"atm-office",4,0),f("agentClick",function(t){return s(n),d(e.clicked.set(t.name))}),i(),a(5,"div",5)(6,"atm-input",6),w("ngModelChange",function(t){return s(n),v(e.topic,t)||(e.topic=t),d(t)}),i(),a(7,"atm-button",7),f("clicked",function(){s(n);let t=h(4);return d(t.meeting(e.topic()))}),l(8," Chamar reuni\xE3o "),i(),a(9,"atm-button",8),f("clicked",function(){s(n);let t=h(4);return d(t.backToWork())}),l(10," Voltar ao trabalho "),i(),a(11,"atm-button",8),f("clicked",function(){s(n);let t=h(4);return d(t.randomChat())}),l(12," Conversa aleat\xF3ria "),i(),a(13,"label",9),l(14," Modo demo "),a(15,"atm-switch",10),f("ngModelChange",function(t){return s(n),d(e.demoOn.set(t))}),i()()(),a(16,"div",11)(17,"div",12)(18,"span",13),l(19,"Quem age"),i(),a(20,"atm-select",14),w("ngModelChange",function(t){return s(n),v(e.actor,t)||(e.actor=t),d(t)}),i()(),a(21,"div",12)(22,"span",13),l(23,"Vai at\xE9"),i(),a(24,"atm-select",14),w("ngModelChange",function(t){return s(n),v(e.target,t)||(e.target=t),d(t)}),i()(),a(25,"div",15)(26,"span",13),l(27," Mensagem (vazio = frase aleat\xF3ria) "),i(),a(28,"atm-input",16),w("ngModelChange",function(t){return s(n),v(e.message,t)||(e.message=t),d(t)}),i()(),a(29,"atm-button",17),f("clicked",function(){return s(n),d(e.runVisit())}),l(30,"Executar"),i()(),k(31,Q,4,1,"p",18),i()(),a(32,"demo-section",19),y(33,"atm-office",20),i(),a(34,"demo-section",21)(35,"div",5)(36,"atm-button",22),f("clicked",function(){return s(n),d(e.runScript())}),l(37," Rodar roteiro de exemplo "),i(),a(38,"span",18),l(39," Executa a sequ\xEAncia do snippet no escrit\xF3rio da primeira se\xE7\xE3o. "),i()()()()}if(u&2){let n;r(),m("code",e.officeCode),r(2),m("agents",e.team)("demo",e.demoOn()),r(3),_("ngModel",e.topic),r(9),m("ngModel",e.demoOn()),r(5),m("options",e.agentOptions),_("ngModel",e.actor),r(4),m("options",e.agentOptions),_("ngModel",e.target),r(4),_("ngModel",e.message),r(3),A((n=e.clicked())?31:-1,n),r(),m("code",e.customCode),r(),m("agents",e.squad)("demo",!0)("showLegend",!1),r(),m("code",e.apiCode)}},dependencies:[x,V,I,W,q,D,P,T,L,F],encapsulation:2,changeDetection:0})};export{B as OfficePage};
