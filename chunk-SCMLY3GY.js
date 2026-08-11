import{a as G,b as H}from"./chunk-KGAQSRHR.js";import{Da as x,E as T,F as n,H as C,Ia as O,Ja as N,Ka as W,La as L,Ma as w,Na as z,Q as a,R as D,S as v,Sa as q,U as p,V as g,W as _,Wa as j,ab as F,f,g as S,h as P,k as u,kb as I,n as l,o as h,u as E,v as y,va as A,vb as B,w as b,wb as R,x as c,xa as M,xb as V,y as t,z as o}from"./chunk-BJZMHQD7.js";var Q=(m,d)=>d.id;function J(m,d){if(m&1){let s=T();t(0,"button",6),n("click",function(){let i=S(s).$implicit,r=C();return P(r.pick(i))}),t(1,"span"),a(2),o(),t(3,"span",7),a(4),o()()}if(m&2){let s=d.$implicit;l(2),D(s.name),l(2),v("R$ ",s.price)}}function U(m,d){if(m&1&&(t(0,"atm-button",34),a(1),o()),m&2){let s=d.$implicit;c("atmTooltip","Placement "+s)("tooltipPlacement",s),l(),v(" ",s," ")}}var k=class m{ref=f(W);data=f(N);products=[{id:1,name:'Notebook Pro 14"',price:"8.999"},{id:2,name:'Monitor 4K 27"',price:"2.499"},{id:3,name:"Teclado mec\xE2nico",price:"499"}];pick(d){this.ref.close(d)}static \u0275fac=function(s){return new(s||m)};static \u0275cmp=h({type:m,selectors:[["product-list-demo"]],decls:11,vars:1,consts:[[1,"mb-3","text-sm","text-ink-muted"],[1,"text-primary"],[1,"flex","flex-col","gap-2"],["type","button",1,"atm-option","justify-between","border","border-line","py-3"],[1,"mt-4","flex","justify-end"],["variant","ghost","color","neutral",3,"clicked"],["type","button",1,"atm-option","justify-between","border","border-line","py-3",3,"click"],[1,"text-xs","text-ink-muted"]],template:function(s,e){s&1&&(t(0,"p",0),a(1," Componente aberto dinamicamente. Data recebida via "),t(2,"code",1),a(3,"ATM_DIALOG_DATA"),o(),a(4),o(),t(5,"div",2),y(6,J,5,2,"button",3,Q),o(),t(8,"div",4)(9,"atm-button",5),n("clicked",function(){return e.ref.close()}),a(10,"Cancelar"),o()()),s&2&&(l(4),v(": ",e.data==null?null:e.data.origin," "),l(2),b(e.products))},dependencies:[w],encapsulation:2,changeDetection:0})},K=class m{toast=f(O);dialog=f(L);alertDialog=f(z);showModal=u(!1);modalName=u("Ana Souza");showDrawer=u(!1);drawerPos=u("right");showTermsModal=u(!1);showModalSheet=u(!1);prefPush=u(!0);prefEmail=u(!1);saveModal(){this.showModal.set(!1),this.toast.success("Perfil salvo",this.modalName())}openProducts(){this.dialog.open(k,{header:"Selecionar produto",width:"32rem",maximizable:!0,data:{origin:"overlays-page"}}).onClose.subscribe(s=>{s&&this.toast.info("Produto selecionado",s.name)})}async confirmDelete(){await this.alertDialog.confirm({title:"Excluir registro",message:"Essa a\xE7\xE3o n\xE3o pode ser desfeita. Deseja continuar?",color:"danger",confirmLabel:"Excluir"})&&this.toast.success("Exclu\xEDdo","Registro removido com sucesso.")}async simpleAlert(){await this.alertDialog.alert({title:"Tudo certo!",message:"Sua conta foi verificada.",color:"success"})}modalCode=`<atm-button (clicked)="show.set(true)">Abrir modal</atm-button>

<atm-modal [(open)]="show" header="Editar perfil" width="28rem" [expandable]="true">
  ...conte\xFAdo...
  <div footer class="flex justify-end gap-2">
    <atm-button variant="ghost" color="neutral" (clicked)="show.set(false)">Cancelar</atm-button>
    <atm-button (clicked)="save()">Salvar</atm-button>
  </div>
</atm-modal>`;dynamicCode=`// qualquer componente pode ser aberto dinamicamente
private dialog = inject(AtmDialogService);

openProducts() {
  const ref = this.dialog.open<Product>(ProductListDemo, {
    header: 'Selecionar produto',
    width: '50vw',
    maximizable: true,
    data: { origin: 'minha-pagina' },
  });
  ref.onClose.subscribe((product) => {
    if (product) this.toast.info('Selecionado', product.name);
  });
}

// dentro do componente aberto:
readonly ref = inject(AtmDialogRef);
readonly data = inject(ATM_DIALOG_DATA);
this.ref.close(selectedProduct); // devolve o resultado`;alertCode=`const ok = await this.alertDialog.confirm({
  title: 'Excluir registro',
  message: 'Essa a\xE7\xE3o n\xE3o pode ser desfeita.',
  color: 'danger',
  confirmLabel: 'Excluir',
});
if (ok) { /* excluir */ }`;drawerCode=`<!-- lateral: size = largura -->
<atm-drawer [(open)]="show" position="right" header="Filtros" size="24rem">
  ...conte\xFAdo...
  <div footer><atm-button (clicked)="apply()">Aplicar</atm-button></div>
</atm-drawer>

<!-- sheet (cima/baixo): size = altura, width = largura (centralizado) -->
<atm-drawer [(open)]="show" position="bottom" header="Preferences"
  description="Manage your notification settings." size="24rem" width="32rem">
  ...conte\xFAdo...
</atm-drawer>`;drawerContainerCode=`<atm-modal [(open)]="showModal" header="Terms of Service" width="36rem">
  ...conte\xFAdo do modal...

  <!-- container="parent" ancora no modal (ancestral posicionado mais pr\xF3ximo) -->
  <atm-drawer [(open)]="showSheet" position="bottom" container="parent"
    header="Preferences" size="75%" width="100%">
    ...conte\xFAdo do sheet...
  </atm-drawer>
</atm-modal>`;popoverCode=`<atm-popover placement="bottom">
  <atm-button trigger>Abrir popover</atm-button>
  <div body>Conte\xFAdo rico aqui...</div>
</atm-popover>`;tooltipPlacements=["top","bottom","left","right","top-left","top-right","bottom-left","bottom-right","left-top","left-bottom","right-top","right-bottom"];tooltipCode=`<!-- top (padr\xE3o) | bottom | left | right
     top-left | top-right | bottom-left | bottom-right
     left-top | left-bottom | right-top | right-bottom -->
<atm-button atmTooltip="Salvar altera\xE7\xF5es" tooltipPlacement="bottom-right">Hover</atm-button>`;toastCode=`private toast = inject(AtmToastService);

this.toast.success('Sucesso!', 'Registro salvo.');
this.toast.error('Erro', 'Algo deu errado.');

// Timer vis\xEDvel (contagem regressiva + barra; clique no rodap\xE9 para parar)
this.toast.success('Altera\xE7\xF5es salvas', undefined, { life: 15000, showTimer: true });

// Conte\xFAdo extra colaps\xE1vel (chevron no header; expanded: false come\xE7a fechado)
this.toast.info('Nova vers\xE3o', 'Detalhes da atualiza\xE7\xE3o...', { expanded: false });

// Bot\xE3o de a\xE7\xE3o
this.toast.add({
  severity: 'success',
  summary: 'Altera\xE7\xF5es salvas',
  detail: 'Tem certeza que deseja remover este usu\xE1rio?',
  showTimer: true,
  life: 15000,
  action: { label: 'Okay', onClick: () => console.log('ok!') },
});

// <atm-toast-container /> renderizado uma vez no App`;toastWithTimer(){this.toast.success("Altera\xE7\xF5es salvas",void 0,{life:15e3,showTimer:!0})}toastCollapsible(){this.toast.add({severity:"primary",summary:"Nova vers\xE3o dispon\xEDvel",detail:"A vers\xE3o 2.4 inclui melhorias de desempenho, corre\xE7\xF5es de bugs e o novo m\xF3dulo de relat\xF3rios.",expanded:!1,life:0})}toastWithAction(){this.toast.add({severity:"success",summary:"Altera\xE7\xF5es salvas",detail:"Tem certeza que deseja remover este usu\xE1rio? Se ele for um membro ativo da sua equipe, a conta ser\xE1 exclu\xEDda. Esta a\xE7\xE3o n\xE3o pode ser desfeita.",showTimer:!0,life:15e3,action:{label:"Okay",onClick:()=>this.toast.info("A\xE7\xE3o executada","Voc\xEA clicou em Okay.")}})}static \u0275fac=function(s){return new(s||m)};static \u0275cmp=h({type:m,selectors:[["overlays-page"]],decls:99,vars:17,consts:[["title","Overlays","description","Modais, di\xE1logos din\xE2micos, drawers, popovers, tooltips e toasts.","importCode","import { AtmModal, AtmDialogService, AtmAlertDialogService, AtmDrawer, AtmPopover, AtmTooltip, AtmToastService } from '@atmus/ngui';"],["id","modal","title","Modal","description","Header com bot\xE3o de expandir (90% da viewport com margem) e fechar. Fecha com Esc/backdrop.",3,"code"],[3,"clicked"],["header","Editar perfil","width","28rem",3,"openChange","open"],[1,"flex","flex-col","gap-4"],[3,"ngModelChange","ngModel"],[1,"text-sm","text-ink-muted"],["footer","",1,"flex","justify-end","gap-2"],["variant","ghost","color","neutral",3,"clicked"],["id","dynamic-dialog","title","Dynamic Dialog","description","Estilo PrimeNG: passe um componente e receba um ref com onClose.","language","typescript",3,"code"],["icon","cart",3,"clicked"],["id","alert-dialog","title","AlertDialog","description","Confirma\xE7\xE3o por Promise \u2014 await direto no handler.","language","typescript",3,"code"],["color","danger","variant","soft","icon","trash",3,"clicked"],["variant","outline","color","neutral",3,"clicked"],["id","drawer","title","Drawer","description","Laterais ocupam a altura toda; cima/baixo viram um sheet centralizado com handle. Entrada e sa\xEDda deslizam.",3,"code"],["header","Filtros","description","Ajuste as op\xE7\xF5es e aplique.",3,"openChange","open","position"],["footer","",1,"flex","justify-end"],["size","slim",3,"clicked"],["id","drawer-in-container","title","Drawer em container","description",'Com container="parent" o drawer abre dentro do ancestral posicionado mais pr\xF3ximo \u2014 aqui, um sheet de baixo pra cima dentro do modal.',3,"code"],["variant","outline","color","neutral","icon","file-text",3,"clicked"],["header","Terms of Service","width","36rem",3,"openChange","open"],[1,"flex","flex-col","gap-3","text-sm","text-ink-muted"],["variant","soft","icon","gear",3,"clicked"],["position","bottom","container","parent","header","Preferences","description","Manage your notification settings.","size","75%","width","100%",3,"openChange","open"],[1,"flex","items-center","justify-between","gap-4"],[1,"text-sm","font-medium","text-ink"],[1,"text-xs","text-ink-muted"],["id","popover","title","Popover",3,"code"],["placement","bottom"],["trigger","","variant","outline","color","neutral","iconRight","simple-down"],["body","",1,"w-64"],[1,"text-sm","font-semibold","text-ink"],[1,"mt-1","text-xs","text-ink-muted"],["id","tooltip","title","Tooltip","description","Diretiva \u2014 funciona em qualquer elemento. 12 placements com auto-flip na viewport.",3,"code"],["variant","soft","color","neutral",3,"atmTooltip","tooltipPlacement"],["id","toast","title","Toast",3,"code"],["color","success","variant","soft",3,"clicked"],["color","danger","variant","soft",3,"clicked"],["color","warning","variant","soft",3,"clicked"],["color","info","variant","soft",3,"clicked"],["color","primary","variant","soft",3,"clicked"],["color","neutral","variant","soft",3,"clicked"]],template:function(s,e){s&1&&(t(0,"demo-page",0)(1,"demo-section",1)(2,"atm-button",2),n("clicked",function(){return e.showModal.set(!0)}),a(3,"Abrir modal"),o(),t(4,"atm-modal",3),_("openChange",function(r){return g(e.showModal,r)||(e.showModal=r),r}),t(5,"div",4)(6,"div")(7,"atm-label"),a(8,"Nome"),o(),t(9,"atm-input",5),_("ngModelChange",function(r){return g(e.modalName,r)||(e.modalName=r),r}),o()(),t(10,"p",6),a(11," Clique no \xEDcone de expandir no header para maximizar a 90% do viewport. "),o()(),t(12,"div",7)(13,"atm-button",8),n("clicked",function(){return e.showModal.set(!1)}),a(14," Cancelar "),o(),t(15,"atm-button",2),n("clicked",function(){return e.saveModal()}),a(16,"Salvar"),o()()()(),t(17,"demo-section",9)(18,"atm-button",10),n("clicked",function(){return e.openProducts()}),a(19,"Selecionar produto"),o()(),t(20,"demo-section",11)(21,"atm-button",12),n("clicked",function(){return e.confirmDelete()}),a(22," Excluir registro "),o(),t(23,"atm-button",13),n("clicked",function(){return e.simpleAlert()}),a(24," Alerta simples "),o()(),t(25,"demo-section",14)(26,"atm-button",13),n("clicked",function(){return e.drawerPos.set("right"),e.showDrawer.set(!0)}),a(27," Direita "),o(),t(28,"atm-button",13),n("clicked",function(){return e.drawerPos.set("left"),e.showDrawer.set(!0)}),a(29," Esquerda "),o(),t(30,"atm-button",13),n("clicked",function(){return e.drawerPos.set("top"),e.showDrawer.set(!0)}),a(31," Cima "),o(),t(32,"atm-button",13),n("clicked",function(){return e.drawerPos.set("bottom"),e.showDrawer.set(!0)}),a(33," Baixo "),o(),t(34,"atm-drawer",15),_("openChange",function(r){return g(e.showDrawer,r)||(e.showDrawer=r),r}),t(35,"p",6),a(36),o(),t(37,"div",16)(38,"atm-button",17),n("clicked",function(){return e.showDrawer.set(!1)}),a(39,"Aplicar"),o()()()(),t(40,"demo-section",18)(41,"atm-button",19),n("clicked",function(){return e.showTermsModal.set(!0)}),a(42," Abrir modal com sheet "),o(),t(43,"atm-modal",20),_("openChange",function(r){return g(e.showTermsModal,r)||(e.showTermsModal=r),r}),t(44,"div",21)(45,"p"),a(46," Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "),o(),t(47,"p"),a(48," Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. "),o(),t(49,"atm-button",22),n("clicked",function(){return e.showModalSheet.set(!0)}),a(50," Abrir prefer\xEAncias (sheet) "),o()(),t(51,"div",7)(52,"atm-button",13),n("clicked",function(){return e.showTermsModal.set(!1)}),a(53," Close "),o(),t(54,"atm-button",2),n("clicked",function(){return e.showTermsModal.set(!1)}),a(55,"I Agree"),o()(),t(56,"atm-drawer",23),_("openChange",function(r){return g(e.showModalSheet,r)||(e.showModalSheet=r),r}),t(57,"div",4)(58,"div",24)(59,"div")(60,"p",25),a(61,"Push Notifications"),o(),t(62,"p",26),a(63,"Receive alerts on your device."),o()(),t(64,"atm-switch",5),_("ngModelChange",function(r){return g(e.prefPush,r)||(e.prefPush=r),r}),o()(),t(65,"div",24)(66,"div")(67,"p",25),a(68,"Email Digests"),o(),t(69,"p",26),a(70,"Weekly summary of activity."),o()(),t(71,"atm-switch",5),_("ngModelChange",function(r){return g(e.prefEmail,r)||(e.prefEmail=r),r}),o()()()()()(),t(72,"demo-section",27)(73,"atm-popover",28)(74,"atm-button",29),a(75," Abrir popover "),o(),t(76,"div",30)(77,"p",31),a(78,"Conte\xFAdo rico"),o(),t(79,"p",32),a(80," Qualquer conte\xFAdo aqui dentro. Fecha com Esc ou clique fora, e flipa se faltar espa\xE7o. "),o()()()(),t(81,"demo-section",33),y(82,U,2,3,"atm-button",34,E),o(),t(84,"demo-section",35)(85,"atm-button",36),n("clicked",function(){return e.toast.success("Sucesso!","Registro salvo.")}),a(86," Success "),o(),t(87,"atm-button",37),n("clicked",function(){return e.toast.error("Erro","Algo deu errado.")}),a(88," Error "),o(),t(89,"atm-button",38),n("clicked",function(){return e.toast.warning("Aten\xE7\xE3o","Verifique os dados.")}),a(90," Warning "),o(),t(91,"atm-button",39),n("clicked",function(){return e.toast.info("Info","Nova vers\xE3o dispon\xEDvel.")}),a(92," Info "),o(),t(93,"atm-button",36),n("clicked",function(){return e.toastWithTimer()}),a(94,"Com timer"),o(),t(95,"atm-button",40),n("clicked",function(){return e.toastCollapsible()}),a(96,"Colaps\xE1vel"),o(),t(97,"atm-button",41),n("clicked",function(){return e.toastWithAction()}),a(98,"Com a\xE7\xE3o"),o()()()),s&2&&(l(),c("code",e.modalCode),l(3),p("open",e.showModal),l(5),p("ngModel",e.modalName),l(8),c("code",e.dynamicCode),l(3),c("code",e.alertCode),l(5),c("code",e.drawerCode),l(9),p("open",e.showDrawer),c("position",e.drawerPos()),l(2),v("Conte\xFAdo do drawer (",e.drawerPos(),")."),l(4),c("code",e.drawerContainerCode),l(3),p("open",e.showTermsModal),l(13),p("open",e.showModalSheet),l(8),p("ngModel",e.prefPush),l(7),p("ngModel",e.prefEmail),l(),c("code",e.popoverCode),l(9),c("code",e.tooltipCode),l(),b(e.tooltipPlacements),l(2),c("code",e.toastCode))},dependencies:[x,A,M,w,R,V,B,I,F,j,q,H,G],encapsulation:2,changeDetection:0})};export{K as OverlaysPage,k as ProductListDemo};
