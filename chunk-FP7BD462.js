import{a as P,b as W}from"./chunk-KGAQSRHR.js";import{Da as S,F as b,Ia as _,Q as s,S as g,Sa as E,Sb as B,U as d,V as u,W as p,f as v,k as c,mb as f,n,nb as w,o as y,ob as T,qb as A,va as C,x as i,xa as M,y as o,z as a}from"./chunk-BJZMHQD7.js";var D=class h{toast=v(_);status=c("active");multiStatus=c([]);country=c(null);techOptions=[{label:"React",value:{id:1,name:"React"},group:"Frontend"},{label:"Angular",value:{id:2,name:"Angular"},group:"Frontend"},{label:"Vue",value:{id:3,name:"Vue"},group:"Frontend"},{label:"Java",value:{id:4,name:"Java"},group:"Backend"},{label:"Node.js",value:{id:5,name:"Node.js"},group:"Backend"},{label:"Python",value:{id:6,name:"Python"},group:"Backend"}];techs=c([this.techOptions[1].value]);freeTags=c([]);compareById=(l,r)=>l===r||l?.id===r?.id;displayTag=l=>l?.name??String(l);techsJson(){return JSON.stringify(this.techs())}users=[{id:1,name:"Ana Souza",email:"ana@atmus.dev",photo:"https://i.pravatar.cc/64?img=1",role:{name:"Design"}},{id:2,name:"Bruno Lima",email:"bruno@atmus.dev",photo:"https://i.pravatar.cc/64?img=12",role:{name:"Engenharia"}},{id:3,name:"Carla Mendes",email:"carla@atmus.dev",role:{name:"Engenharia"}},{id:4,name:"Diego Rocha",email:"diego@atmus.dev",photo:"https://i.pravatar.cc/64?img=14",role:{name:"Produto"}},{id:5,name:"Elisa Prado",email:"elisa@atmus.dev",photo:"https://i.pravatar.cc/64?img=5",role:{name:"Design"}},{id:6,name:"F\xE1bio Nunes",email:"fabio@atmus.dev",role:{name:"Produto"}},{id:7,name:"Gabriela Reis",email:"gabi@atmus.dev",photo:"https://i.pravatar.cc/64?img=9",role:{name:"Engenharia"}}];userOptions=this.users.map(l=>({label:l.name,value:l,avatar:l.photo,description:l.email}));userTabs=[{label:"Devs",value:"Engenharia"},{label:"Designers",value:"Design"},{label:"PMs",value:"Produto"}];owner=c(null);members=c([this.users[1]]);compareUserById=(l,r)=>l===r||l?.id===r?.id;membersJson(){return JSON.stringify(this.members().map(l=>l.id))}statusOptions=[{label:"Ativo",value:"active",icon:"check-circled",description:"Vis\xEDvel para todos"},{label:"Pausado",value:"paused",icon:"pause"},{label:"Arquivado",value:"archived",icon:"archive",disabled:!0},{label:"Rascunho",value:"draft",icon:"edit"}];countries=[{label:"Brasil",value:"br"},{label:"Portugal",value:"pt"},{label:"Argentina",value:"ar"},{label:"Alemanha",value:"de"},{label:"Austr\xE1lia",value:"au"},{label:"Canad\xE1",value:"ca"},{label:"Estados Unidos",value:"us"},{label:"Jap\xE3o",value:"jp"}];selectCode=`<atm-select
  [options]="[{ label: 'Ativo', value: 'active', icon: 'check-circled' }]"
  [(ngModel)]="status"
  [clearable]="true"
  [hasActionButton]="true"
  actionButtonLabel="Novo status"
  (actionClick)="openCreateModal()"
/>`;listboxCode=`<atm-listbox [options]="options" [(ngModel)]="value" />
<atm-listbox [options]="options" [multiple]="true" [(ngModel)]="values" />`;autocompleteCode=`<atm-autocomplete
  [options]="countries"
  [(ngModel)]="country"
  placeholder="Digite para filtrar..."
/>`;tagsCode=`// options aceitam qualquer objeto como value (+ group opcional)
techOptions: AtmTagsOption<Tech>[] = [
  { label: 'React', value: { id: 1, name: 'React' }, group: 'Frontend' },
  { label: 'Java', value: { id: 4, name: 'Java' }, group: 'Backend' },
];
techs = signal<Tech[]>([]);
compareById = (a: unknown, b: unknown) => (a as Tech)?.id === (b as Tech)?.id;

<atm-tags [options]="techOptions" [(ngModel)]="techs" [compareWith]="compareById" />

<!-- texto livre vira tag (string por padr\xE3o; customize com [createTag]) -->
<atm-tags [options]="techOptions" [allowCustom]="true" [maxTags]="6" [(ngModel)]="freeTags" />`;comboboxUserCode=`// op\xE7\xF5es com avatar; value pode ser o objeto inteiro do backend
userOptions: AtmComboboxUserOption<User>[] = users.map((u) => ({
  label: u.name,
  value: u,
  avatar: u.photo,       // sem foto \u2192 iniciais com cor determin\xEDstica
  description: u.email,
}));

<!-- abas geradas automaticamente pelos valores distintos do path -->
<atm-combobox-user
  [options]="userOptions"
  [(ngModel)]="owner"
  [compareWith]="compareById"
  groupBy="role.name"
/>

<!-- multiselect (chips com foto) + abas com nome customizado -->
<atm-combobox-user
  [options]="userOptions"
  [multiple]="true"
  [(ngModel)]="members"
  [compareWith]="compareById"
  groupBy="role.name"
  [tabs]="[
    { label: 'Devs', value: 'Engenharia' },
    { label: 'Designers', value: 'Design' },
    { label: 'PMs', value: 'Produto' },
  ]"
  allTabLabel="Todo mundo"
  [hasActionButton]="true"
  actionButtonLabel="Convidar pessoa"
  (actionClick)="openInviteModal()"
/>`;static \u0275fac=function(r){return new(r||h)};static \u0275cmp=y({type:h,selectors:[["selects-page"]],decls:52,vars:38,consts:[["title","Select, ListBox e Autocomplete","description","Sele\xE7\xE3o de op\xE7\xF5es locais. O painel detecta o espa\xE7o dispon\xEDvel na viewport e abre para cima quando necess\xE1rio.","importCode","import { AtmSelect, AtmListbox, AtmAutocomplete } from '@atmus/ngui';"],["id","select","title","Select","description","Com teclado (setas + Enter), clearable e footer opcional de a\xE7\xE3o.",3,"code"],[1,"grid","w-full","gap-4","sm:grid-cols-2"],[3,"ngModelChange","options","ngModel","clearable"],["actionButtonLabel","Novo status",3,"actionClick","options","hasActionButton"],["id","listbox","title","ListBox","description","Lista sempre vis\xEDvel, sele\xE7\xE3o \xFAnica ou m\xFAltipla.",3,"code"],[3,"ngModelChange","options","ngModel"],[3,"ngModelChange","options","multiple","ngModel"],["id","autocomplete","title","Autocomplete / ComboBox","description","Filtro local com highlight do termo digitado.",3,"code"],[1,"w-full","max-w-sm"],["placeholder","Digite para filtrar...",3,"ngModelChange","options","ngModel"],[1,"text-sm","text-ink-muted"],["id","tags","title","Tags","description","Multi-select com sugest\xF5es (e grupos). O valor do form \xE9 um array com os values das op\xE7\xF5es \u2014 pode ser objeto vindo do backend (use compareWith). Com allowCustom, texto livre vira tag.",3,"code"],["placeholder","Pesquise...",3,"ngModelChange","options","ngModel","compareWith"],[1,"mt-1","block","text-xs","text-ink-muted"],["placeholder","Digite e pressione Enter...",3,"ngModelChange","options","ngModel","compareWith","displayWith","allowCustom","maxTags"],["id","combobox-user","title","ComboBox User","description","Variante do combobox para pessoas: op\xE7\xF5es com avatar (foto ou iniciais), abas geradas por um path do objeto (groupBy) e modo single ou multiselect \u2014 no multi a sele\xE7\xE3o vira chips com a foto. Use [tabs] para nomear/ordenar as abas.",3,"code"],["groupBy","role.name","placeholder","Selecione um respons\xE1vel...",3,"ngModelChange","options","ngModel","compareWith"],["groupBy","role.name","allTabLabel","Todo mundo","placeholder","Pesquise pessoas...","actionButtonLabel","Convidar pessoa",3,"ngModelChange","actionClick","options","multiple","ngModel","compareWith","tabs","hasActionButton"]],template:function(r,e){r&1&&(o(0,"demo-page",0)(1,"demo-section",1)(2,"div",2)(3,"div")(4,"atm-label"),s(5,"Status"),a(),o(6,"atm-select",3),p("ngModelChange",function(t){return u(e.status,t)||(e.status=t),t}),a()(),o(7,"div")(8,"atm-label"),s(9,"Com bot\xE3o de a\xE7\xE3o"),a(),o(10,"atm-select",4),b("actionClick",function(){return e.toast.info("A\xE7\xE3o!","Abriria um modal de cadastro aqui.")}),a()()()(),o(11,"demo-section",5)(12,"div",2)(13,"div")(14,"atm-label"),s(15,"\xDAnica"),a(),o(16,"atm-listbox",6),p("ngModelChange",function(t){return u(e.status,t)||(e.status=t),t}),a()(),o(17,"div")(18,"atm-label"),s(19,"M\xFAltipla"),a(),o(20,"atm-listbox",7),p("ngModelChange",function(t){return u(e.multiStatus,t)||(e.multiStatus=t),t}),a()()()(),o(21,"demo-section",8)(22,"div",9)(23,"atm-label"),s(24,"Pa\xEDs"),a(),o(25,"atm-autocomplete",10),p("ngModelChange",function(t){return u(e.country,t)||(e.country=t),t}),a()(),o(26,"span",11),s(27),a()(),o(28,"demo-section",12)(29,"div",2)(30,"div")(31,"atm-label"),s(32,"Tecnologias (values s\xE3o objetos)"),a(),o(33,"atm-tags",13),p("ngModelChange",function(t){return u(e.techs,t)||(e.techs=t),t}),a(),o(34,"span",14),s(35),a()(),o(36,"div")(37,"atm-label"),s(38,"Com texto livre (allowCustom)"),a(),o(39,"atm-tags",15),p("ngModelChange",function(t){return u(e.freeTags,t)||(e.freeTags=t),t}),a()()()(),o(40,"demo-section",16)(41,"div",2)(42,"div")(43,"atm-label"),s(44,"Respons\xE1vel (single, abas por role.name)"),a(),o(45,"atm-combobox-user",17),p("ngModelChange",function(t){return u(e.owner,t)||(e.owner=t),t}),a()(),o(46,"div")(47,"atm-label"),s(48,"Participantes (multiple + abas nomeadas)"),a(),o(49,"atm-combobox-user",18),p("ngModelChange",function(t){return u(e.members,t)||(e.members=t),t}),b("actionClick",function(){return e.toast.info("A\xE7\xE3o!","Abriria um modal de convite aqui.")}),a(),o(50,"span",14),s(51),a()()()()()),r&2&&(n(),i("code",e.selectCode),n(5),i("options",e.statusOptions),d("ngModel",e.status),i("clearable",!0),n(4),i("options",e.statusOptions)("hasActionButton",!0),n(),i("code",e.listboxCode),n(5),i("options",e.statusOptions),d("ngModel",e.status),n(4),i("options",e.statusOptions)("multiple",!0),d("ngModel",e.multiStatus),n(),i("code",e.autocompleteCode),n(4),i("options",e.countries),d("ngModel",e.country),n(2),g("valor: ",e.country()??"\u2014"),n(),i("code",e.tagsCode),n(5),i("options",e.techOptions),d("ngModel",e.techs),i("compareWith",e.compareById),n(2),g("valor: ",e.techsJson()),n(4),i("options",e.techOptions),d("ngModel",e.freeTags),i("compareWith",e.compareById)("displayWith",e.displayTag)("allowCustom",!0)("maxTags",6),n(),i("code",e.comboboxUserCode),n(5),i("options",e.userOptions),d("ngModel",e.owner),i("compareWith",e.compareUserById),n(4),i("options",e.userOptions)("multiple",!0),d("ngModel",e.members),i("compareWith",e.compareUserById)("tabs",e.userTabs)("hasActionButton",!0),n(2),g("valor: ",e.membersJson()))},dependencies:[S,C,M,f,w,T,B,A,E,W,P],encapsulation:2,changeDetection:0})};export{D as SelectsPage};
