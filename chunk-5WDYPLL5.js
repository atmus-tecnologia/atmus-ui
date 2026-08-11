import{a as H,b as W}from"./chunk-KGAQSRHR.js";import{A as M,Da as V,E as y,F as f,H as S,Ia as P,M as g,Ma as R,Oa as N,P as D,Q as c,R as w,S as k,Sa as j,U as I,V as B,W as F,e as x,f as v,g as s,h as u,k as b,l as E,n as o,o as _,rb as L,sb as z,tb as U,ub as $,v as h,va as T,w as A,x as l,xa as q,y as t,z as i}from"./chunk-BJZMHQD7.js";var C=class d extends N{resource="contacts";static \u0275fac=(()=>{let n;return function(e){return(n||(n=E(d)))(e||d)}})();static \u0275prov=x({token:d,factory:d.\u0275fac,providedIn:"root"})};var O=(d,n)=>n.name;function J(d,n){if(d&1&&(t(0,"div",12),M(1,"i",20),t(2,"span",21),c(3),i(),t(4,"span",22),c(5),i()()),d&2){let a=n.$implicit;S();let e=g(18);l("atmContextMenu",e)("atmContextMenuData",a)("atmContextMenuHeader",a.name),o(),D("text-ink-muted icofont-"+a.icon),o(2),w(a.name),o(2),w(a.size)}}var G=class d{toast=v(P);contacts=v(C);contactId=b(null);menuItems=[{label:"Editar",icon:"edit",shortcut:"Ctrl+E"},{label:"Duplicar",icon:"copy"},{label:"Arquivar",icon:"archive",disabled:!0},{label:"Excluir",icon:"trash",danger:!0,separatorBefore:!0}];onContact(n){n&&this.toast.success("Selecionado",String(n.name))}files=[{name:"relatorio-2026.pdf",icon:"file-pdf",size:"1,2 MB"},{name:"vendas.xlsx",icon:"file-excel",size:"340 KB"},{name:"logo-atmus.png",icon:"file-image",size:"88 KB"}];areaItems=[{label:"Atualizar",value:"refresh",icon:"refresh",shortcut:"F5"},{label:"Colar",value:"paste",icon:"copy",shortcut:"Ctrl+V",disabled:!0},{label:"Nova pasta",value:"new-folder",icon:"folder",separatorBefore:!0},{label:"Novo arquivo",value:"new-file",icon:"file-text"}];fileItems=[{label:"Abrir",value:"open",icon:"external-link"},{label:"Renomear",value:"rename",icon:"edit",shortcut:"F2"},{label:"Duplicar",value:"duplicate",icon:"copy"},{label:"Excluir",value:"delete",icon:"trash",danger:!0,separatorBefore:!0}];onFileAction(n){let a=n.data;n.item.value==="delete"?this.toast.error(`Excluir "${a.name}"`,"Context menu"):this.toast.info(`${n.item.label} \u2014 ${a.name}`,"Context menu")}dropdownCode=`<atm-dropdown
  [items]="[
    { label: 'Editar', icon: 'edit', shortcut: 'Ctrl+E' },
    { label: 'Excluir', icon: 'trash', danger: true, separatorBefore: true },
  ]"
  [hasActionButton]="true"
  actionButtonLabel="Novo item"
  (itemClick)="onAction($event)"
  (actionClick)="createNew()"
>
  <atm-button variant="outline" iconRight="simple-down">A\xE7\xF5es</atm-button>
</atm-dropdown>`;contextMenuCode=`<!-- Diretiva em qualquer elemento; data/header por linha -->
<div [atmContextMenu]="fileMenu" [atmContextMenuData]="file" [atmContextMenuHeader]="file.name">
  {{ file.name }}
</div>

<atm-context-menu #fileMenu [items]="fileItems" (itemClick)="onFileAction($event)" />

// Itens (iguais ao AtmDropdown):
fileItems: AtmContextMenuItem[] = [
  { label: 'Abrir', value: 'open', icon: 'external-link' },
  { label: 'Renomear', value: 'rename', icon: 'edit', shortcut: 'F2' },
  { label: 'Excluir', value: 'delete', icon: 'trash', danger: true, separatorBefore: true },
];

// O data volta em cada clique:
onFileAction(e: AtmContextMenuSelect) {
  const file = e.data as File;         // quem foi clicado
  switch (e.item.value) { ... }        // qual a\xE7\xE3o
}

// Tamb\xE9m abre imperativamente (menus din\xE2micos \u2014 veja o exemplo no Flow):
menu.open(mouseEvent, { items, header: 'T\xEDtulo', data: alvo });`;remoteCode=`<atm-dropdown-remote
  [dataSource]="contactsService"
  labelField="name"
  valueField="id"
  sortBy="id:DESC"
  [limit]="10"
  [(ngModel)]="contactId"
  [hasActionButton]="true"
  actionButtonLabel="Novo contato"
  (actionClick)="openCreateContactModal()"
  (selectionChange)="onContactSelected($event)"
/>`;serviceCode=`// contacts.service.ts
import { Injectable } from '@angular/core';
import { AtmRestService } from '@atmus/ngui';

export interface Contact {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService extends AtmRestService<Contact> {
  protected override resource = 'contacts';
}

// GET https://api.wizeflows.com.br/v1/contacts?sortBy=id:DESC&page=1&search=as`;static \u0275fac=function(a){return new(a||d)};static \u0275cmp=_({type:d,selectors:[["dropdowns-page"]],decls:35,vars:14,consts:[["areaMenu",""],["fileMenu",""],["title","Dropdown, Context Menu & Remote","description","Menus de a\xE7\xE3o (por clique ou bot\xE3o direito) e sele\xE7\xE3o remota via API. Todos s\xE3o viewport-aware: reposicionam automaticamente quando n\xE3o h\xE1 espa\xE7o.","importCode","import { AtmDropdown, AtmContextMenu, AtmContextMenuTrigger, AtmDropdownRemote } from '@atmus/ngui';"],["id","dropdown","title","Dropdown","description","Menu de a\xE7\xF5es com \xEDcones, separadores, atalhos e footer de a\xE7\xE3o opcional.",3,"code"],[3,"itemClick","items"],["variant","outline","color","neutral","iconRight","simple-down"],["actionButtonLabel","Novo item",3,"itemClick","actionClick","items","hasActionButton"],["variant","soft","iconRight","simple-down"],["id","context-menu","title","Context Menu","description","Clique com o bot\xE3o direito. Use a diretiva [atmContextMenu] em qualquer elemento; [atmContextMenuData] devolve o registro da linha no itemClick \u2014 uma \xFAnica inst\xE2ncia do menu serve para a lista inteira. Suporta teclado (setas, Enter, Esc), header opcional e fecha em clique fora/scroll.",3,"code"],[1,"flex","w-full","flex-col","gap-4"],[1,"flex","h-32","w-full","items-center","justify-center","rounded-atm","border","border-dashed","border-line","bg-surface-alt/40","text-sm","text-ink-muted","select-none",3,"atmContextMenu"],[1,"w-full","max-w-md","overflow-hidden","rounded-atm","border","border-line"],[1,"flex","cursor-default","items-center","gap-2.5","border-b","border-line","px-3","py-2","text-sm","last:border-b-0","hover:bg-surface-alt",3,"atmContextMenu","atmContextMenuData","atmContextMenuHeader"],["header","\xC1rea de trabalho",3,"itemClick","items"],["id","dropdown-remote","title","Dropdown Remote","description","Passe qualquer service que estenda AtmRestService (padr\xE3o nest-paginator). Carrega no m\xE1ximo 10 registros; o restante \xE9 alcan\xE7ado pela busca server-side (debounce 300ms). GET {serverUrl}/contacts?sortBy=id:DESC&page=1&search=termo","language","typescript",3,"code"],[1,"w-full","max-w-sm"],["labelField","name","valueField","id","actionButtonLabel","Novo contato",3,"ngModelChange","actionClick","selectionChange","dataSource","ngModel","hasActionButton"],[1,"text-sm","text-ink-muted"],["title","Criando o service","description","Todo o resto (pagina\xE7\xE3o, busca, URL) vem de gra\xE7a do AtmRestService.","language","typescript",3,"code"],[1,"text-primary"],["aria-hidden","true"],[1,"flex-1","text-ink"],[1,"text-xs","text-ink-faint"]],template:function(a,e){if(a&1){let m=y();t(0,"demo-page",2)(1,"demo-section",3)(2,"atm-dropdown",4),f("itemClick",function(r){return s(m),u(e.toast.info("Clicou",r.label))}),t(3,"atm-button",5),c(4,"A\xE7\xF5es"),i()(),t(5,"atm-dropdown",6),f("itemClick",function(r){return s(m),u(e.toast.info("Clicou",r.label))})("actionClick",function(){return s(m),u(e.toast.success("A\xE7\xE3o do footer","Adicionar novo registro"))}),t(6,"atm-button",7),c(7,"Com footer"),i()()(),t(8,"demo-section",8)(9,"div",9)(10,"div",10),c(11," Clique com o bot\xE3o direito nesta \xE1rea "),i(),t(12,"div",11),h(13,J,6,7,"div",12,O),i()(),t(15,"atm-context-menu",13,0),f("itemClick",function(r){return s(m),u(e.toast.info("A\xE7\xE3o",r.item.label))}),i(),t(17,"atm-context-menu",4,1),f("itemClick",function(r){return s(m),u(e.onFileAction(r))}),i()(),t(19,"demo-section",14)(20,"div",15)(21,"atm-label"),c(22,"Contato"),i(),t(23,"atm-dropdown-remote",16),F("ngModelChange",function(r){return s(m),B(e.contactId,r)||(e.contactId=r),u(r)}),f("actionClick",function(){return s(m),u(e.toast.info("actionClick","Abra seu modal de cadastro aqui."))})("selectionChange",function(r){return s(m),u(e.onContact(r))}),i()(),t(24,"span",17),c(25),i()(),t(26,"demo-section",18)(27,"p",17),c(28," O "),t(29,"code",19),c(30,"serverUrl"),i(),c(31," vem do "),t(32,"code",19),c(33,"provideAtmusUi({ serverUrl })"),i(),c(34," configurado no app.config.ts a partir do environment. "),i()()()}if(a&2){let m=g(16);o(),l("code",e.dropdownCode),o(),l("items",e.menuItems),o(3),l("items",e.menuItems)("hasActionButton",!0),o(3),l("code",e.contextMenuCode),o(2),l("atmContextMenu",m),o(3),A(e.files),o(2),l("items",e.areaItems),o(2),l("items",e.fileItems),o(2),l("code",e.remoteCode),o(4),l("dataSource",e.contacts),I("ngModel",e.contactId),l("hasActionButton",!0),o(2),k("id selecionado: ",e.contactId()??"\u2014"),o(),l("code",e.serviceCode)}},dependencies:[V,T,q,L,z,U,$,R,j,W,H],encapsulation:2,changeDetection:0})};export{G as DropdownsPage};
