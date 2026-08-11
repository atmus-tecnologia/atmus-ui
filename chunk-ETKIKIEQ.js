import{a as g}from"./chunk-KGAQSRHR.js";import{A as l,Db as p,Ma as u,Q as e,n as o,o as r,pa as d,x as a,y as i,z as t,zb as c}from"./chunk-BJZMHQD7.js";var x=class s{installCode=`npm install @atmus/ngui
# yarn add @atmus/ngui
# pnpm add @atmus/ngui
# bun add @atmus/ngui`;configCode=`// app.config.ts
import { provideAtmusUi } from '@atmus/ngui';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideAtmusUi({
      theme: 'system', // 'light' | 'dark' | 'system'
      serverUrl: environment.serverUrl,
    }),
  ],
};

// styles.css
@import '@atmus/ngui/styles.css';`;sizeCode=`<atm-button size="large">large \xB7 h-12</atm-button>
<atm-button size="medium">medium \xB7 h-10</atm-button>
<atm-button size="slim">slim \xB7 h-8</atm-button>`;static \u0275fac=function(n){return new(n||s)};static \u0275cmp=r({type:s,selectors:[["home-page"]],decls:52,vars:3,consts:[[1,"mb-10"],["color","primary","variant","soft"],[1,"mt-4","text-4xl","font-bold","tracking-tight","text-ink"],[1,"mt-3","max-w-2xl","text-base","leading-relaxed","text-ink-muted"],[1,"text-primary"],[1,"mt-6","flex","gap-3"],["routerLink","/buttons","iconRight","simple-right"],["variant","outline","color","neutral","routerLink","/dropdowns"],[1,"mb-10","grid","gap-4","sm:grid-cols-3"],["header","Instal\xE1vel","subheader","npm install @atmus/ngui e pronto \u2014 sem copiar pastas."],["header","Consistente","subheader","Todos os componentes seguem o mesmo size system."],["header","Tem\xE1vel","subheader","Cores em :root \u2014 troque a marca em um lugar s\xF3."],["title","Instala\xE7\xE3o em outro projeto","description","A lib \xE9 publicada no npm como @atmus/ngui, com CSS j\xE1 compilado.","language","bash",3,"code"],[1,"list-inside","list-decimal","space-y-2","text-sm","text-ink-muted"],["title","Configura\xE7\xE3o","description","provideAtmusUi define tema inicial e a URL do servidor para componentes remotos.","language","typescript",3,"code"],[1,"text-sm","text-ink-muted"],["title","Padr\xE3o de tamanhos","description","Todo componente aceita [size] com tr\xEAs valores.","language","html",3,"code"],[1,"flex","items-end","gap-3"],["size","large"],["size","medium"],["size","slim"]],template:function(n,m){n&1&&(i(0,"header",0)(1,"atm-badge",1),e(2,"Angular 20 \xB7 Tailwind 4 \xB7 IcoFont"),t(),i(3,"h1",2),e(4,"Atmus UI"),t(),i(5,"p",3),e(6," Biblioteca de componentes standalone com design consistente \u2014 mesmo arredondamento, alturas padronizadas ("),i(7,"code",4),e(8,"large / medium / slim"),t(),e(9,"), tema claro/escuro via tokens CSS e foco em performance (OnPush + signals em tudo). "),t(),i(10,"div",5)(11,"atm-button",6),e(12,"Explorar componentes"),t(),i(13,"atm-button",7),e(14," Ver Dropdown Remote "),t()()(),i(15,"div",8),l(16,"atm-card",9)(17,"atm-card",10)(18,"atm-card",11),t(),i(19,"demo-section",12)(20,"ol",13)(21,"li")(22,"code",4),e(23,"npm install @atmus/ngui"),t(),e(24," (ou yarn/pnpm/bun)"),t(),i(25,"li"),e(26,"Importe "),i(27,"code",4),e(28,"@atmus/ngui/styles.css"),t(),e(29," no styles.css global"),t(),i(30,"li"),e(31,"Adicione "),i(32,"code",4),e(33,"provideAtmusUi()"),t(),e(34," no app.config.ts"),t()()(),i(35,"demo-section",14)(36,"p",15),e(37," O tema escuro \xE9 aplicado pela classe "),i(38,"code",4),e(39,".dark"),t(),e(40," no "),i(41,"code",4),e(42,"<html>"),t(),e(43," e persistido no localStorage. "),t()(),i(44,"demo-section",16)(45,"div",17)(46,"atm-button",18),e(47,"large \xB7 h-12"),t(),i(48,"atm-button",19),e(49,"medium \xB7 h-10"),t(),i(50,"atm-button",20),e(51,"slim \xB7 h-8"),t()()()),n&2&&(o(19),a("code",m.installCode),o(16),a("code",m.configCode),o(9),a("code",m.sizeCode))},dependencies:[d,u,c,p,g],encapsulation:2,changeDetection:0})};export{x as HomePage};
