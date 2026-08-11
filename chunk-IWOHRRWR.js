import{a as R,b as M}from"./chunk-KGAQSRHR.js";import{A as p,F as c,Ia as z,Ma as P,Mb as U,Nb as B,Ob as N,Q as l,S as C,T as _,Tb as I,U as y,Ub as L,V as h,W as v,_a as T,c as E,e as k,f as g,ia as D,ja as x,k as u,n as i,o as A,x as n,y as a,z as r}from"./chunk-BJZMHQD7.js";var f=class b{http=g(x);baseUrl="https://dummyjson.com/users";list(t){let m=Number(t.page??1),e=Number(t.limit??10),s=this.baseUrl,o=new D().set("limit",e).set("skip",(m-1)*e);if(t.sortBy){let[d,S]=String(t.sortBy).split(":");o=o.set("sortBy",d).set("order",(S??"asc").toLowerCase())}let w=Object.entries(t).find(([d])=>d.startsWith("filter."));if(w){let d=w[0].slice(7),S=String(w[1]).split(":").pop()??"";s=`${this.baseUrl}/filter`,o=o.set("key",d).set("value",S)}else t.search&&(s=`${this.baseUrl}/search`,o=o.set("q",String(t.search)));return this.http.get(s,{params:o}).pipe(E(d=>({data:d.users,meta:{itemsPerPage:d.limit,totalItems:d.total,currentPage:m,totalPages:Math.max(Math.ceil(d.total/e),1)}})))}static \u0275fac=function(m){return new(m||b)};static \u0275prov=k({token:b,factory:b.\u0275fac,providedIn:"root"})};var F=[{id:1,name:"Ana Souza",email:"ana@empresa.com",role:"Admin",age:29,salary:12400,hiredAt:"2021-03-15",active:!0},{id:2,name:"Bruno Costa",email:"bruno@empresa.com",role:"Editor",age:36,salary:8300,hiredAt:"2019-11-02",active:!0},{id:3,name:"Carla Dias",email:"carla@empresa.com",role:"Viewer",age:43,salary:5900,hiredAt:"2022-06-20",active:!1},{id:4,name:"Daniel Rocha",email:"daniel@empresa.com",role:"Editor",age:31,salary:9100,hiredAt:"2020-01-08",active:!0},{id:5,name:"Elisa Melo",email:"elisa@empresa.com",role:"Viewer",age:26,salary:4800,hiredAt:"2023-02-27",active:!1},{id:6,name:"F\xE1bio Lima",email:"fabio@empresa.com",role:"Admin",age:39,salary:13800,hiredAt:"2018-07-19",active:!0},{id:7,name:"Gabriela Nunes",email:"gabi@empresa.com",role:"Editor",age:28,salary:7600,hiredAt:"2021-09-01",active:!0},{id:8,name:"Hugo Alves",email:"hugo@empresa.com",role:"Viewer",age:34,salary:5200,hiredAt:"2022-12-05",active:!0},{id:9,name:"Iris Campos",email:"iris@empresa.com",role:"Editor",age:45,salary:8900,hiredAt:"2017-04-11",active:!1},{id:10,name:"Jo\xE3o Pedro",email:"joao@empresa.com",role:"Admin",age:52,salary:15200,hiredAt:"2015-10-23",active:!0},{id:11,name:"Karen Dias",email:"karen@empresa.com",role:"Viewer",age:24,salary:4500,hiredAt:"2024-01-15",active:!0},{id:12,name:"Lucas Prado",email:"lucas@empresa.com",role:"Editor",age:33,salary:8700,hiredAt:"2020-08-30",active:!0}],j=class b{toast=g(z);usersService=g(f);page=u(3);tableLoading=u(!1);users=F;selection=u([]);barSelection=u([]);viewportBar=u(null);columns=[{key:"id",header:"#",sortable:!0,width:"60px"},{key:"name",header:"Nome",sortable:!0},{key:"email",header:"E-mail"},{key:"role",header:"Papel",sortable:!0},{key:"active",header:"Status",align:"center",value:t=>t.active?"\u25CF Ativo":"\u25CB Inativo"}];filterColumns=[{key:"id",header:"#",sortable:!0,width:"60px"},{key:"name",header:"Nome",type:"text",sortable:!0,filterable:!0},{key:"role",header:"Papel",type:"text",filterable:!0},{key:"age",header:"Idade",type:"number",sortable:!0,filterable:!0,align:"center",footer:"M\xE9dia"},{key:"salary",header:"Sal\xE1rio",type:"number",sortable:!0,filterable:!0,align:"right",value:t=>this.currency(t.salary),footerValue:t=>this.currency(t.reduce((m,e)=>m+e.salary,0))},{key:"hiredAt",header:"Admiss\xE3o",type:"date",sortable:!0,filterable:!0},{key:"active",header:"Ativo",type:"boolean",filterable:!0,align:"center",value:t=>t.active?"Sim":"N\xE3o"}];wideColumns=[{key:"id",header:"#",width:"60px",fixed:!0},{key:"name",header:"Nome",width:"180px",fixed:!0},{key:"email",header:"E-mail",width:"220px"},{key:"role",header:"Papel",width:"140px"},{key:"age",header:"Idade",width:"100px",align:"center"},{key:"salary",header:"Sal\xE1rio",width:"140px",align:"right",value:t=>this.currency(t.salary)},{key:"hiredAt",header:"Admiss\xE3o",width:"140px"},{key:"active",header:"Status",width:"120px",align:"center",value:t=>t.active?"Ativo":"Inativo"}];remoteColumns=[{key:"id",header:"#",width:"60px",sortable:!0,fixed:!0},{key:"firstName",header:"Nome",width:"150px",sortable:!0,filterable:!0,fixed:!0},{key:"lastName",header:"Sobrenome",width:"140px",sortable:!0},{key:"age",header:"Idade",width:"90px",type:"number",sortable:!0,align:"center"},{key:"email",header:"E-mail",width:"260px"},{key:"phone",header:"Telefone",width:"170px"},{key:"company.name",header:"Empresa",width:"220px"},{key:"company.title",header:"Cargo",width:"220px"},{key:"address.city",header:"Cidade",width:"150px"},{key:"role",header:"Papel",width:"120px",filterable:!0}];sortedUsers=u(F.slice(0,5));selectionNames(){return this.selection().map(t=>t.name).join(", ")}currency(t){return t.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}onRow(t){this.toast.info("Linha clicada",t.name)}onFilter(t){this.toast.info("Filtros ativos",t.length?JSON.stringify(t):"nenhum")}simulateLoading(){this.tableLoading.set(!0),setTimeout(()=>this.tableLoading.set(!1),2e3)}crumbs=[{label:"Home",link:"/",icon:"ui-home"},{label:"Configura\xE7\xF5es",link:"/data"},{label:"Usu\xE1rios"}];tableCode=`columns: AtmTableColumn<User>[] = [
  { key: 'id', header: '#', sortable: true, width: '60px' },
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'active', header: 'Status', value: (u) => u.active ? 'Ativo' : 'Inativo' },
];

<atm-table
  [columns]="columns"
  [rows]="users"
  [loading]="loading"
  [clickableRows]="true"
  (sortChange)="onSort($event)"
  (rowClick)="open($event)"
/>`;filterCode=`columns: AtmTableColumn<User>[] = [
  { key: 'name', header: 'Nome', type: 'text', filterable: true },
  { key: 'age', header: 'Idade', type: 'number', filterable: true, footer: 'M\xE9dia' },
  {
    key: 'salary', header: 'Sal\xE1rio', type: 'number', filterable: true,
    footerValue: (rows) => total(rows), // totalizador com as linhas vis\xEDveis
  },
  { key: 'hiredAt', header: 'Admiss\xE3o', type: 'date', filterable: true },
  { key: 'active', header: 'Ativo', type: 'boolean', filterable: true },
];

<atm-table
  [columns]="columns"
  [rows]="users"
  [paginator]="true"
  [pageSize]="8"
  (filterChange)="onFilter($event)"
/>`;selectionCode=`<atm-table
  [columns]="columns"
  [rows]="users"
  [selectable]="true"
  [(selection)]="selection"
/>`;scrollCode=`columns: AtmTableColumn<User>[] = [
  { key: 'id', header: '#', width: '60px', fixed: true },
  { key: 'name', header: 'Nome', width: '180px', fixed: true },
  { key: 'email', header: 'E-mail', width: '220px' },
  // ... colunas largas o suficiente para scroll horizontal
];

<atm-table
  [columns]="columns"
  [rows]="users"
  [selectable]="true"
  [scrollable]="true"
  scrollHeight="280px"
/>`;remoteCode=`// Servi\xE7o implementando AtmRemoteDataSource (padr\xE3o nest-paginator)
@Injectable({ providedIn: 'root' })
export class UsersService extends AtmRestService<User> {
  protected override resource = 'users';
}

<atm-table
  [columns]="columns"
  [dataSource]="usersService"
  [paginator]="true"
  [pageSize]="10"
/>

// A tabela envia page, limit, sortBy=key:ASC e filter.key=$op:value
// automaticamente. Para outra API (ex.: dummyjson), basta implementar
// list(query: AtmListQuery): Observable<AtmPaginated<T>> adaptando os params.`;paginationCode='<atm-pagination [totalItems]="240" [pageSize]="10" [(page)]="page" (pageChange)="load($event)" />';breadcrumbsCode=`<atm-breadcrumbs
  [items]="[
    { label: 'Home', link: '/', icon: 'ui-home' },
    { label: 'Configura\xE7\xF5es', link: '/settings' },
    { label: 'Usu\xE1rios' },
  ]"
/>`;actionBarCode=`<!-- container='parent': posiciona dentro do container mais pr\xF3ximo com position: relative -->
<div class="relative">
  <atm-table [columns]="columns" [rows]="users" [selectable]="true" [(selection)]="selection" />

  <atm-action-bar
    container="parent"
    [open]="selection().length > 0"
    [count]="selection().length"
    (closed)="selection.set([])"
  >
    <atm-button size="slim" variant="ghost" color="neutral" icon="ui-edit">Editar</atm-button>
    <atm-button size="slim" variant="ghost" color="neutral" icon="download">Exportar</atm-button>
    <atm-button size="slim" variant="soft" color="danger" icon="ui-delete">Excluir</atm-button>
  </atm-action-bar>
</div>`;actionBarViewportCode=`<!-- padr\xE3o: fixa na viewport, centralizada embaixo -->
<atm-action-bar [open]="open()" position="top" [count]="3" (closed)="open.set(false)">
  <atm-button size="slim" variant="ghost" color="neutral" icon="ui-edit">Editar</atm-button>
  <atm-button size="slim" variant="soft" color="danger" icon="ui-delete">Excluir</atm-button>
</atm-action-bar>

<!-- inputs: open, position (bottom|top), container (viewport|parent),
     size (large|medium|slim), count, showClose, ariaLabel \xB7 output: closed -->`;toolbarCode=`<atm-toolbar>
  <div start><atm-button size="slim" icon="plus">Novo</atm-button></div>
  <div center><atm-search-field size="slim" /></div>
  <div end><atm-button size="slim" variant="ghost" icon="filter" [iconOnly]="true" /></div>
</atm-toolbar>`;static \u0275fac=function(m){return new(m||b)};static \u0275cmp=A({type:b,selectors:[["data-page"]],decls:62,vars:50,consts:[["title","Dados & Navega\xE7\xE3o","description","Tabela com ordena\xE7\xE3o, filtros por coluna, sele\xE7\xE3o, colunas fixas, scroll, footer e dados via API; pagina\xE7\xE3o, breadcrumbs e toolbar.","importCode","import { AtmTable, AtmPagination, AtmBreadcrumbs, AtmToolbar } from '@atmus/ngui';"],["id","table","title","Table","description","Colunas sortable, template customizado por coluna, linhas clic\xE1veis e empty state.",3,"code"],[1,"w-full"],[3,"rowClick","columns","rows","loading","clickableRows"],[1,"mt-3"],["size","slim","variant","soft","color","neutral",3,"clicked"],["id","table-filters","title","Table \u2014 Filtros & Footer","description","filterable abre popup de filtro por coluna. O type ('text' | 'number' | 'date' | 'boolean') define os operadores (cont\xE9m, igual, maior que\u2026). footerValue calcula totais/m\xE9dias com as linhas vis\xEDveis.",3,"code"],["size","slim",1,"w-full",3,"filterChange","columns","rows","paginator","pageSize"],["id","table-selection","title","Table \u2014 Sele\xE7\xE3o","description","selectable adiciona a coluna de checkbox com selecionar todos; [(selection)] mant\xE9m as linhas marcadas.",3,"code"],[3,"selectionChange","columns","rows","selectable","selection"],[1,"mt-2","text-sm","text-ink-muted"],["id","table-scroll","title","Table \u2014 Colunas fixas & Scroll","description","scrollable + scrollHeight limitam a \xE1rea dos registros (header e footer ficam vis\xEDveis); fixed prende colunas \xE0 esquerda no scroll horizontal; width controla a largura da coluna.",3,"code"],["size","slim","scrollHeight","280px",1,"w-full",3,"columns","rows","selectable","scrollable"],["id","table-remote","title","Table \u2014 API (dataSource)","description","Passe um dataSource (AtmRemoteDataSource) e a tabela busca sozinha: pagina\xE7\xE3o, ordena\xE7\xE3o e filtros viram par\xE2metros da query (padr\xE3o nest-paginator). Demo com dummyjson.com/users.",3,"code"],["size","slim","scrollHeight","420px",1,"w-full",3,"columns","dataSource","paginator","pageSize","scrollable"],["id","pagination","title","Pagination","description","Janela deslizante com retic\xEAncias.",3,"code"],[1,"flex","w-full","flex-col","items-start","gap-3"],[3,"pageChange","totalItems","pageSize","page"],["size","slim",3,"totalItems","pageSize"],[1,"text-sm","text-ink-muted"],["id","breadcrumbs","title","Breadcrumbs",3,"code"],[3,"items"],["id","toolbar","title","Toolbar","description","Slots start / center / end.",3,"code"],["start","",1,"flex","items-center","gap-2"],["size","slim","icon","plus"],["size","slim","variant","outline","color","neutral","icon","upload"],["center","",1,"w-full","max-w-xs"],["size","slim"],["end",""],["size","slim","variant","ghost","color","neutral","icon","filter",3,"iconOnly"],["id","action-bar","title","ActionBar","description","Barra flutuante de a\xE7\xF5es contextuais. Aparece centralizada embaixo (ou em cima, via position) da tela \u2014 ou do container com container='parent'. count mostra o total selecionado; o X e a tecla Esc emitem (closed).",3,"code"],[1,"relative","w-full","pb-20"],["container","parent",3,"closed","open","count"],["size","slim","variant","ghost","color","neutral","icon","ui-edit"],["size","slim","variant","ghost","color","neutral","icon","download"],["size","slim","variant","ghost","color","neutral","icon","box"],["size","slim","variant","soft","color","danger","icon","ui-delete"],["id","action-bar-viewport","title","ActionBar \u2014 Tela inteira","description","Sem container='parent' a barra fica fixa na viewport (padr\xE3o). position controla a borda: bottom ou top.",3,"code"],[1,"flex","gap-2"],["size","slim","variant","outline","color","neutral",3,"clicked"],[3,"closed","open","position","count"]],template:function(m,e){m&1&&(a(0,"demo-page",0)(1,"demo-section",1)(2,"div",2)(3,"atm-table",3),c("rowClick",function(o){return e.onRow(o)}),r(),a(4,"div",4)(5,"atm-button",5),c("clicked",function(){return e.simulateLoading()}),l(6," Simular loading "),r()()()(),a(7,"demo-section",6)(8,"atm-table",7),c("filterChange",function(o){return e.onFilter(o)}),r()(),a(9,"demo-section",8)(10,"div",2)(11,"atm-table",9),v("selectionChange",function(o){return h(e.selection,o)||(e.selection=o),o}),r(),a(12,"p",10),l(13),r()()(),a(14,"demo-section",11),p(15,"atm-table",12),r(),a(16,"demo-section",13),p(17,"atm-table",14),r(),a(18,"demo-section",15)(19,"div",16)(20,"atm-pagination",17),v("pageChange",function(o){return h(e.page,o)||(e.page=o),o}),r(),p(21,"atm-pagination",18),a(22,"span",19),l(23),r()()(),a(24,"demo-section",20),p(25,"atm-breadcrumbs",21),r(),a(26,"demo-section",22)(27,"atm-toolbar",2)(28,"div",23)(29,"atm-button",24),l(30,"Novo"),r(),a(31,"atm-button",25),l(32,"Importar"),r()(),a(33,"div",26),p(34,"atm-search-field",27),r(),a(35,"div",28),p(36,"atm-button",29),r()()(),a(37,"demo-section",30)(38,"div",31)(39,"atm-table",9),v("selectionChange",function(o){return h(e.barSelection,o)||(e.barSelection=o),o}),r(),a(40,"atm-action-bar",32),c("closed",function(){return e.barSelection.set([])}),a(41,"atm-button",33),l(42,"Editar"),r(),a(43,"atm-button",34),l(44,"Exportar"),r(),a(45,"atm-button",35),l(46,"Arquivar"),r(),a(47,"atm-button",36),l(48,"Excluir"),r()()()(),a(49,"demo-section",37)(50,"div",38)(51,"atm-button",39),c("clicked",function(){return e.viewportBar.set("bottom")}),l(52," Mostrar embaixo "),r(),a(53,"atm-button",39),c("clicked",function(){return e.viewportBar.set("top")}),l(54," Mostrar em cima "),r()(),a(55,"atm-action-bar",40),c("closed",function(){return e.viewportBar.set(null)}),a(56,"atm-button",33),l(57,"Editar"),r(),a(58,"atm-button",34),l(59,"Exportar"),r(),a(60,"atm-button",36),l(61,"Excluir"),r()()()()),m&2&&(i(),n("code",e.tableCode),i(2),n("columns",e.columns)("rows",e.sortedUsers())("loading",e.tableLoading())("clickableRows",!0),i(4),n("code",e.filterCode),i(),n("columns",e.filterColumns)("rows",e.users)("paginator",!0)("pageSize",8),i(),n("code",e.selectionCode),i(2),n("columns",e.columns)("rows",e.users.slice(0,6))("selectable",!0),y("selection",e.selection),i(2),_(" ",e.selection().length," selecionado(s): ",e.selectionNames()||"\u2014"," "),i(),n("code",e.scrollCode),i(),n("columns",e.wideColumns)("rows",e.users)("selectable",!0)("scrollable",!0),i(),n("code",e.remoteCode),i(),n("columns",e.remoteColumns)("dataSource",e.usersService)("paginator",!0)("pageSize",10)("scrollable",!0),i(),n("code",e.paginationCode),i(2),n("totalItems",240)("pageSize",10),y("page",e.page),i(),n("totalItems",50)("pageSize",10),i(2),C("p\xE1gina atual: ",e.page()),i(),n("code",e.breadcrumbsCode),i(),n("items",e.crumbs),i(),n("code",e.toolbarCode),i(10),n("iconOnly",!0),i(),n("code",e.actionBarCode),i(2),n("columns",e.columns)("rows",e.users.slice(0,6))("selectable",!0),y("selection",e.barSelection),i(),n("open",e.barSelection().length>0)("count",e.barSelection().length),i(9),n("code",e.actionBarViewportCode),i(6),n("open",e.viewportBar()!==null)("position",e.viewportBar()??"bottom")("count",3))},dependencies:[L,N,U,B,I,P,T,M,R],encapsulation:2,changeDetection:0})};export{j as DataPage};
