import{a as E,b as A}from"./chunk-KGAQSRHR.js";import{A as d,F as m,Ia as f,Q as u,R as h,X as c,f as g,gc as D,n as a,o as y,v,w as C,x as t,y as i,z as r}from"./chunk-BJZMHQD7.js";var b=()=>[],k=()=>["--atm-success"],_=()=>["--atm-warning"],T=()=>["--atm-primary","--atm-info","--atm-success","--atm-warning","--atm-danger"],w=()=>["#8b5cf6","#14b8a6"],F=(p,l)=>l.label;function M(p,l){if(p&1&&(i(0,"div",48)(1,"p",51),u(2),r(),i(3,"p",52),u(4),r(),d(5,"atm-chart",53),r()),p&2){let s=l.$implicit;a(2),h(s.label),a(2),h(s.value),a(),t("type",s.type)("labels",s.labels)("datasets",s.datasets)("height",56)("grid",!1)("xAxis",!1)("yAxis",!1)("legend",!1)("markers",!1)}}var P=class p{toast=g(f);meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];semanas=["S1","S2","S3","S4","S5","S6","S7","S8"];trimestres=["T1","T2","T3","T4"];produtos=["Plano Pro","Plano Business","Plano Starter","Add-on API","Consultoria"];origens=["Org\xE2nico","Pago","Social","E-mail","Direto"];categorias=["Pessoal","Infra","Marketing","Opera\xE7\xE3o"];skills=["Frontend","Backend","DevOps","UX","Dados","Mobile"];etapasFin=["Recebido","Transacionado","Investido","Poupado","Livre"];etapasVendas=["Visitantes","Leads","Qualificados","Propostas","Fechados"];brl=l=>l.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});pct=l=>`${Math.round(l)}%`;dias=["01","02","03","04","05","06","07","08","09","10"];faixas=["100","200","300","400","500","600","700","800","900"];regioes=["Los Angeles","New York","Canad\xE1","China","T\xF3quio"];paises=["Brasil","EUA","Portugal"];lineData=[{label:"Receita",data:[42,55,48,63,71,66,80,92,87,95,104,118]},{label:"Despesas",data:[30,34,38,35,42,47,44,51,49,55,58,62],dashed:!0}];areaData=[{label:"Desktop",data:[320,410,380,490,530,470,590,640]},{label:"Mobile",data:[180,220,270,250,330,380,360,450],color:"--atm-info"}];barData=[{label:"2024",data:[1240,1580,1420,1810]},{label:"2025",data:[1490,1730,1690,2140]},{label:"2026",data:[1820,2050,0,0]}];barHData=[{label:"Vendas",data:[860,640,520,310,180]}];stackedData=[{label:"Loja f\xEDsica",data:[44,52,41,64,58,63,70,66]},{label:"E-commerce",data:[31,38,45,40,54,59,62,71]},{label:"Marketplace",data:[12,15,19,22,20,26,24,30]}];mixedData=[{label:"Receita",data:[88,94,81,105,112,98,124,131,119],type:"bar"},{label:"Meta",data:[90,90,95,95,105,105,115,115,125],type:"line",dashed:!0,markers:!1,color:"--atm-danger"},{label:"M\xE9dia m\xF3vel",data:[88,91,88,93,99,105,111,118,125],type:"line",color:"--atm-success"}];rangeData=[{label:"Varia\xE7\xE3o",data:[],ranges:[[3,7],[4,9],[5,8],[2,6],[1,5],[3,9],[5.5,8.5],[4,7],[2.5,6.5],[6,9.5]]}];scatterData=[{label:"Campanha A",data:[],points:this.genPoints(55,1),color:"#f97316"},{label:"Campanha B",data:[],points:this.genPoints(45,2)}];dotsData=[{label:"Mensal",data:[340,420,380,560,610,470,390,430,360],color:"#f97316"},{label:"Anual",data:[280,350,300,480,520,400,310,370,290],color:"#fbbf24"}];segmentsData=[{label:"Receita",data:[270120,219650,200680,168400,122270]}];radialData=[{label:"Meta atingida",data:[86,64,45]}];gaugeData=[{label:"NPS",data:[72]}];gaugeStorageData=[{label:"Armazenamento",data:[58]}];genPoints(l,s){let e=[];for(let n=0;n<l;n++){let o=Math.abs(Math.sin((n+1)*12.9898*s)*43758.5453)%1,S=Math.abs(Math.sin((n+1)*78.233+s*7)*12543.123)%1;e.push({x:Math.round(10+o*90),y:Math.round(200+S*500)})}return e}pieData=[{label:"Visitas",data:[4200,2800,1900,1200,900]}];donutData=[{label:"Gasto",data:[48e3,22e3,15e3,9500]}];radarData=[{label:"Time A",data:[80,92,65,74,60,55]},{label:"Time B",data:[62,70,85,58,88,72],color:"--atm-warning"}];funnelFinData=[{label:"Valor",data:[2957,2129,1360,710,296]}];funnelVendasData=[{label:"Pessoas",data:[12400,5580,2790,1120,430]}];etapasRecrut=["Sourcing","Triagem","Avalia\xE7\xE3o","Entrevista RH","T\xE9cnica","Proposta","Contratados"];funnelRecrutData=[{label:"Candidatos",data:[1380,1100,990,880,740,330,200]}];rnd(l){return Math.abs(Math.sin((l+1)*12.9898)*43758.5453)%1}heatSemanas=Array.from({length:16},(l,s)=>`s${s+1}`);heatFeatures=["Dashboard","Relat\xF3rios","Busca","Perfil","Cobran\xE7a","Config","Inbox","Agenda"];heatData=this.heatFeatures.map((l,s)=>({label:l,data:this.heatSemanas.map((e,n)=>Math.round(this.rnd(s*37+n*3)*100))}));diasSemana=["Seg","Ter","Qua","Qui","Sex","S\xE1b","Dom"];commitsData=this.diasSemana.map((l,s)=>({label:l,data:this.meses.map((e,n)=>Math.round(this.rnd(s*13+n*7+5)*40))}));treemapCidades=[{label:"S\xE3o Paulo",value:486},{label:"Rio de Janeiro",value:297},{label:"Belo Horizonte",value:182},{label:"Curitiba",value:141},{label:"Porto Alegre",value:118},{label:"Recife",value:96},{label:"Salvador",value:84},{label:"Fortaleza",value:63},{label:"Manaus",value:41},{label:"Goi\xE2nia",value:33}];treemapDispositivos=[{label:"Desktops",children:[{label:"Apple",value:383},{label:"Dell",value:246},{label:"Lenovo",value:208},{label:"Acer",value:157},{label:"HP",value:129}]},{label:"Mobile",children:[{label:"Samsung",value:341},{label:"Apple",value:296},{label:"Xiaomi",value:212},{label:"Motorola",value:118}]},{label:"Tablets",children:[{label:"Apple",value:168},{label:"Samsung",value:102},{label:"Amazon",value:58}]},{label:"Wearables",children:[{label:"Apple",value:94},{label:"Garmin",value:47},{label:"Huawei",value:31}]}];treemapRegioes=[{label:"Sudeste",value:4820},{label:"Sul",value:2310},{label:"Nordeste",value:1980},{label:"Centro-Oeste",value:940},{label:"Norte",value:610}];estadosPorRegiao={Sudeste:[["S\xE3o Paulo",2530],["Minas Gerais",1080],["Rio de Janeiro",890],["Esp\xEDrito Santo",320]],Sul:[["Paran\xE1",940],["Rio Grande do Sul",820],["Santa Catarina",550]],Nordeste:[["Bahia",610],["Pernambuco",480],["Cear\xE1",430],["Maranh\xE3o",250],["Outros",210]],"Centro-Oeste":[["Goi\xE1s",390],["Distrito Federal",310],["Mato Grosso",240]],Norte:[["Par\xE1",260],["Amazonas",210],["Outros",140]]};loadEstados=l=>new Promise(s=>setTimeout(()=>{let e=this.estadosPorRegiao[l.label]??[];s(e.map(([n,o])=>({label:n,value:o})))},700));configData=[{label:"Recorrente",data:[42e3,48500,51200,49800,56400,61300]},{label:"Avulso",data:[12800,9400,14100,11700,15900,13200]}];sparkCards=[{label:"Novos usu\xE1rios",value:"+1.284",type:"area",labels:this.semanas,datasets:[{label:"Usu\xE1rios",data:[12,19,15,26,22,31,28,38]}]},{label:"Pedidos",value:"342",type:"bar",labels:this.semanas,datasets:[{label:"Pedidos",data:[31,40,28,51,42,49,60,55],color:"--atm-success"}]},{label:"Churn",value:"2,4%",type:"line",labels:this.semanas,datasets:[{label:"Churn",data:[4.1,3.8,3.9,3.2,3.4,2.9,2.6,2.4],color:"--atm-danger"}]}];onPoint(l){this.toast.info(`${l.datasetLabel}: ${l.value}`,l.label)}onNode(l){this.toast.info(l.path.map(s=>s.label).join(" / "),l.node.label)}onDrill(l){this.toast.info(`Drill-down em ${l.node.label}`,"Treemap")}lineCode=`<atm-chart
  type="line"
  title="Receita x Despesas"
  subtitle="\xDAltimos 12 meses"
  [labels]="meses"
  [datasets]="[
    { label: 'Receita', data: [42, 55, 48, ...] },
    { label: 'Despesas', data: [30, 34, 38, ...], dashed: true },
  ]"
  (pointClick)="onPoint($event)"
/>

<!-- \xC1rea com gradiente -->
<atm-chart type="area" [labels]="semanas" [datasets]="areaData" [height]="260" />`;barCode=`<!-- pointClick emite { index, label, datasetIndex, datasetLabel, value } da barra clicada -->
<atm-chart
  type="bar"
  title="Vendas por trimestre"
  [labels]="trimestres"
  [datasets]="barData"
  (pointClick)="onPoint($event)"
/>

<atm-chart
  type="bar-horizontal"
  [labels]="produtos"
  [datasets]="[{ label: 'Vendas', data: [860, 640, 520, 310, 180] }]"
  [showValues]="true"
  [legend]="false"
/>`;stackedCode=`<atm-chart
  type="bar"
  [stacked]="true"
  [labels]="meses"
  [datasets]="[
    { label: 'Loja f\xEDsica', data: [...] },
    { label: 'E-commerce', data: [...] },
    { label: 'Marketplace', data: [...] },
  ]"
/>`;mixedCode=`<!-- Cada dataset pode ter um type pr\xF3prio: 'bar' | 'line' | 'area' -->
<atm-chart
  type="bar"
  [labels]="meses"
  [datasets]="[
    { label: 'Receita', data: [...], type: 'bar' },
    { label: 'Meta', data: [...], type: 'line', dashed: true, color: '--atm-danger' },
    { label: 'M\xE9dia m\xF3vel', data: [...], type: 'line', color: '--atm-success' },
  ]"
/>`;rangeCode=`<!-- data fica vazio; os intervalos v\xE3o em ranges: [low, high][] -->
<atm-chart
  type="range-bar"
  [labels]="dias"
  [datasets]="[{ label: 'Varia\xE7\xE3o', data: [], ranges: [[3, 7], [4, 9], [5, 8], ...] }]"
  [legend]="false"
/>`;scatterCode=`<!-- cada dataset usa points: { x, y }[] -->
<atm-chart
  type="scatter"
  [datasets]="[
    { label: 'Campanha A', data: [], points: [{ x: 12, y: 340 }, ...], color: '#f97316' },
    { label: 'Campanha B', data: [], points: [{ x: 30, y: 520 }, ...] },
  ]"
/>`;dotsCode=`<atm-chart
  type="dots"
  [labels]="faixas"
  [datasets]="[
    { label: 'Mensal', data: [340, 420, ...], color: '#f97316' },
    { label: 'Anual', data: [280, 350, ...], color: '#fbbf24' },
  ]"
/>`;segmentsCode=`<atm-chart
  type="segments"
  [labels]="['Los Angeles', 'New York', 'Canad\xE1', ...]"
  [datasets]="[{ label: 'Receita', data: [270120, 219650, ...] }]"
  [showValues]="true"
  [format]="brl"
/>`;radialCode=`<!-- An\xE9is conc\xEAntricos; [max] define a escala (ex.: 100 = percentual) -->
<atm-chart
  type="radial-bar"
  [labels]="['Brasil', 'EUA', 'Portugal']"
  [datasets]="[{ label: 'Meta atingida', data: [86, 64, 45] }]"
  [max]="100"
  donutLabel="m\xE9dia"
  legendPosition="right"
  radialStyle="dotted"
/>

<!-- Gauge: usa o primeiro valor do dataset -->
<atm-chart
  type="gauge"
  [datasets]="[{ label: 'NPS', data: [72] }]"
  [max]="100"
  donutLabel="de 100"
  [format]="pct"
/>`;pieCode=`<atm-chart type="pie" [labels]="origens" [datasets]="pieData" [showValues]="true" />

<atm-chart
  type="donut"
  [labels]="categorias"
  [datasets]="donutData"
  donutLabel="Total gasto"
  [format]="brl"
  legendPosition="right"
/>`;radarCode=`<atm-chart
  type="radar"
  [labels]="['Frontend', 'Backend', 'DevOps', 'UX', 'Dados', 'Mobile']"
  [datasets]="[
    { label: 'Time A', data: [80, 92, 65, 74, 60, 55] },
    { label: 'Time B', data: [62, 70, 85, 58, 88, 72], color: '--atm-warning' },
  ]"
/>`;funnelCode=`<!-- Monocrom\xE1tico (tons alternados do primary) -->
<atm-chart
  type="funnel"
  [labels]="['Recebido', 'Transacionado', 'Investido', 'Poupado', 'Livre']"
  [datasets]="[{ label: 'Valor', data: [2957, 2129, 1360, 710, 296] }]"
  [format]="brl"
/>

<!-- Multicolorido: passe uma paleta em [colors] -->
<atm-chart
  type="funnel"
  [labels]="etapas"
  [datasets]="funnelData"
  [colors]="['--atm-primary', '--atm-info', '--atm-success', '--atm-warning', '--atm-danger']"
/>`;heatmapCode=`<!-- labels = colunas; cada dataset \xE9 uma linha da matriz -->
<atm-chart
  type="heatmap"
  title="Uso por funcionalidade"
  [labels]="semanas"
  [datasets]="[
    { label: 'Dashboard', data: [82, 34, 61, ...] },
    { label: 'Relat\xF3rios', data: [12, 78, 44, ...] },
    ...
  ]"
  (pointClick)="onPoint($event)"  <!-- { index: coluna, datasetIndex: linha, value } -->
/>

<!-- Cor customizada (escala de intensidade sobre um \xFAnico tom) -->
<atm-chart type="heatmap" [labels]="meses" [datasets]="commitsData" [colors]="['--atm-success']" />`;treemapCode=`<!-- N\xF3s hier\xE1rquicos: value opcional em grupos (soma dos filhos) -->
<atm-chart
  type="treemap"
  [tree]="[
    { label: 'Desktops', children: [{ label: 'Apple', value: 383 }, ...] },
    { label: 'Mobile', children: [{ label: 'Samsung', value: 341 }, ...] },
  ]"
  (nodeClick)="onNode($event)"   <!-- { node, path } -->
  (drillDown)="onDrill($event)"  <!-- duplo clique adentra o grupo; a seta volta -->
/>

<!-- Drill-down remoto: sem children, o duplo clique chama loadChildren (ex.: API) -->
<atm-chart
  type="treemap"
  [tree]="regioes"
  [loadChildren]="loadEstados"
/>

// loadEstados = (node) => this.api.get(\`/regioes/\${node.label}/estados\`)
//   \u2192 Promise<AtmChartTreeNode[]>`;funnelStylesCode=`<!-- Vertical: barras centradas + conectores + % de convers\xE3o -->
<atm-chart
  type="funnel-vertical"
  [labels]="['Sourcing', 'Triagem', 'Avalia\xE7\xE3o', ...]"
  [datasets]="[{ label: 'Candidatos', data: [1380, 1100, 990, ...] }]"
  (pointClick)="onPoint($event)"
/>

<!-- Pir\xE2mide invertida com r\xF3tulos laterais (paleta do tema por etapa) -->
<atm-chart
  type="funnel-pyramid"
  [labels]="etapas"
  [datasets]="funnelData"
  (pointClick)="onPoint($event)"
/>`;sparkCode=`<atm-chart
  type="area"
  [labels]="semanas"
  [datasets]="[{ label: 'Usu\xE1rios', data: [12, 19, 15, 26, 22, 31, 28, 38] }]"
  [height]="56"
  [grid]="false"
  [xAxis]="false"
  [yAxis]="false"
  [legend]="false"
  [markers]="false"
/>`;configCode=`<atm-chart
  type="bar"
  title="Faturamento mensal"
  [labels]="meses"
  [datasets]="configData"
  [colors]="['#8b5cf6', '#14b8a6']"
  [format]="brl"          <!-- (v) => v.toLocaleString('pt-BR', { style: 'currency', ... }) -->
  [showValues]="true"
  legendPosition="right"  <!-- top | bottom | left | right -->
  xTitle="M\xEAs"
  yTitle="Faturamento"
  [height]="320"
/>`;static \u0275fac=function(s){return new(s||p)};static \u0275cmp=y({type:p,selectors:[["charts-page"]],decls:58,vars:129,consts:[["title","Gr\xE1ficos","description","AtmChart renderiza em canvas HTML5 com anima\xE7\xF5es, tooltip interativo, legenda clic\xE1vel, dark mode autom\xE1tico e responsividade. Tipos: line, area, bar, bar-horizontal, pie, donut, radar, funnel (horizontal, vertical e pir\xE2mide), heatmap, treemap com drill-down e mistos.","importCode","import { AtmChart } from '@atmus/ngui';"],["id","chart-line","title","Linhas & \xC1rea","description","Curvas suaves (smooth), marcadores, s\xE9rie tracejada e gradiente de \xE1rea. Clique na legenda para ocultar s\xE9ries.",3,"code"],[1,"flex","w-full","flex-col","gap-8"],["type","line","title","Receita x Despesas","subtitle","\xDAltimos 12 meses",3,"pointClick","labels","datasets"],["type","area","title","Sess\xF5es por semana",3,"labels","datasets","height"],["id","chart-bar","title","Colunas & Barras","description","Colunas agrupadas e barras horizontais com cantos arredondados. Clique numa coluna \u2014 o pointClick identifica a s\xE9rie exata clicada.",3,"code"],["type","bar","title","Vendas por trimestre",3,"pointClick","labels","datasets","height"],["type","bar-horizontal","title","Top produtos",3,"labels","datasets","height","showValues","legend"],["id","chart-bar-stacked","title","Colunas empilhadas","description","[stacked]='true' empilha as s\xE9ries de barras \u2014 vale tamb\xE9m para bar-horizontal.",3,"code"],["type","bar","title","Faturamento por canal",1,"w-full",3,"labels","datasets","stacked","height"],["id","chart-mixed","title","Gr\xE1fico misto","description","Cada dataset pode sobrescrever o tipo do gr\xE1fico via 'type' \u2014 colunas + linha, \xE1rea + linha etc.",3,"code"],["type","bar","title","Receita x Meta","subtitle","Colunas com linha de tend\xEAncia tracejada",1,"w-full",3,"labels","datasets","height"],["id","chart-range","title","Range bar","description","C\xE1psulas flutuantes representando intervalos [m\xEDn, m\xE1x] \u2014 \xF3timo para oscila\xE7\xF5es de pre\xE7o, temperatura, hor\xE1rios.",3,"code"],["type","range-bar","title","Oscila\xE7\xE3o di\xE1ria",1,"w-full",3,"labels","datasets","height","legend"],["id","chart-scatter","title","Scatter","description","Dispers\xE3o XY com m\xFAltiplas s\xE9ries \u2014 cada dataset usa 'points' com pares x/y.",3,"code"],["type","scatter","title","Ticket x Engajamento",1,"w-full",3,"labels","datasets","height"],["id","chart-dots","title","Colunas de pontos","description","Valores desenhados como colunas de bolinhas empilhadas \u2014 visual leve para dashboards.",3,"code"],["type","dots","title","Sales report",1,"w-full",3,"labels","datasets","height"],["id","chart-segments","title","Progresso segmentado","description","Linhas de progresso com segmentos arredondados \u2014 propor\xE7\xE3o sobre o maior valor (ou [max]).",3,"code"],["type","segments","title","Receita por regi\xE3o",1,"w-full",3,"labels","datasets","height","showValues","format"],["id","chart-heatmap","title","Heatmap","description","Matriz de intensidade \u2014 os labels s\xE3o as colunas e cada dataset vira uma linha. Cor \xFAnica com escala de intensidade, valores opcionais e pointClick por c\xE9lula.",3,"code"],["type","heatmap","title","Uso por funcionalidade","subtitle","Sess\xF5es por semana",3,"pointClick","labels","datasets","height"],["type","heatmap","title","Commits por dia da semana",3,"labels","datasets","colors","height"],["id","chart-treemap","title","Treemap","description","Ret\xE2ngulos proporcionais ao valor (layout squarified). Duplo clique adentra grupos com filhos \u2014 a setinha volta um n\xEDvel. Para dados remotos, use [loadChildren] para buscar os filhos numa API no drill-down.",3,"code"],["type","treemap","title","Vendas por cidade",3,"nodeClick","tree","height","showValues"],["type","treemap","title","Dispositivos","subtitle","Duplo clique num grupo para adentrar \u2014 a seta no canto volta um n\xEDvel",3,"nodeClick","drillDown","tree","height"],["type","treemap","title","Receita por regi\xE3o","subtitle","Duplo clique carrega os estados via API simulada ([loadChildren])",3,"tree","loadChildren","height","showValues","format"],["id","chart-pie","title","Pie & Donut","description","Fatias interativas (hover destaca), percentuais e total no centro do donut.",3,"code"],[1,"grid","w-full","gap-6","sm:grid-cols-2"],["type","pie","title","Tr\xE1fego por origem",3,"labels","datasets","height","showValues"],["type","donut","title","Despesas por categoria","donutLabel","Total gasto","legendPosition","right",3,"labels","datasets","height","format"],["id","chart-radar","title","Radar","description","Compara\xE7\xE3o multidimensional. Por padr\xE3o usa curvas suaves (estilo 'estrela') \u2014 use [smooth]='false' para pol\xEDgonos cl\xE1ssicos.",3,"code"],["type","radar","title","Curvas suaves",3,"labels","datasets","height"],["type","radar","title","Pol\xEDgono cl\xE1ssico",3,"labels","datasets","smooth","height"],["id","chart-radial","title","Radial bar & Gauge","description","An\xE9is conc\xEAntricos (radialStyle 'solid' ou 'dotted') e medidor semicircular com valor central.",3,"code"],["type","radial-bar","title","Metas por pa\xEDs","donutLabel","m\xE9dia","legendPosition","right",3,"labels","datasets","max","height"],["type","radial-bar","title","Variante pontilhada","radialStyle","dotted","donutLabel","m\xE9dia","legendPosition","right",3,"labels","datasets","max","height"],["type","gauge","title","NPS","donutLabel","de 100",3,"labels","datasets","max","height"],["type","gauge","title","Uso de armazenamento","radialStyle","dotted","donutLabel","ocupado",3,"labels","datasets","max","format","height","colors"],["id","chart-funnel","title","Funnel","description","Funil de convers\xE3o com transi\xE7\xF5es suaves, camadas de eco, percentuais e valores por etapa.",3,"code"],["type","funnel","title","Funil financeiro",3,"labels","datasets","height","format"],["type","funnel","title","Funil de vendas","subtitle","Com paleta multicolorida",3,"labels","datasets","colors","height"],["id","chart-funnel-styles","title","Funil vertical & pir\xE2mide","description","Dois estilos al\xE9m do funil horizontal: barras centradas com conectores e percentual de convers\xE3o por etapa (vertical), e pir\xE2mide invertida com r\xF3tulos laterais. Ambos emitem pointClick por etapa.",3,"code"],[1,"grid","w-full","gap-6","lg:grid-cols-2"],["type","funnel-vertical","title","Funil de recrutamento",3,"pointClick","labels","datasets","height"],["type","funnel-pyramid","title","Pir\xE2mide de convers\xE3o",3,"pointClick","labels","datasets","height"],["id","chart-sparkline","title","Sparklines","description","Desligue grid, eixos e legenda para mini-gr\xE1ficos de cards e dashboards.",3,"code"],[1,"grid","w-full","gap-4","sm:grid-cols-3"],[1,"rounded-atm-lg","border","border-line","bg-surface","p-4"],["id","chart-config","title","Configura\xE7\xF5es","description","Cores customizadas, formatador (R$), r\xF3tulos de dados, t\xEDtulos de eixo e posi\xE7\xE3o da legenda.",3,"code"],["type","bar","title","Faturamento mensal","subtitle","Formata\xE7\xE3o BRL + valores vis\xEDveis + legenda \xE0 direita","legendPosition","right","xTitle","M\xEAs","yTitle","Faturamento",1,"w-full",3,"labels","datasets","colors","format","showValues","height"],[1,"text-xs","text-ink-muted"],[1,"mt-0.5","text-xl","font-bold","text-ink"],[1,"mt-2",3,"type","labels","datasets","height","grid","xAxis","yAxis","legend","markers"]],template:function(s,e){s&1&&(i(0,"demo-page",0)(1,"demo-section",1)(2,"div",2)(3,"atm-chart",3),m("pointClick",function(o){return e.onPoint(o)}),r(),d(4,"atm-chart",4),r()(),i(5,"demo-section",5)(6,"div",2)(7,"atm-chart",6),m("pointClick",function(o){return e.onPoint(o)}),r(),d(8,"atm-chart",7),r()(),i(9,"demo-section",8),d(10,"atm-chart",9),r(),i(11,"demo-section",10),d(12,"atm-chart",11),r(),i(13,"demo-section",12),d(14,"atm-chart",13),r(),i(15,"demo-section",14),d(16,"atm-chart",15),r(),i(17,"demo-section",16),d(18,"atm-chart",17),r(),i(19,"demo-section",18),d(20,"atm-chart",19),r(),i(21,"demo-section",20)(22,"div",2)(23,"atm-chart",21),m("pointClick",function(o){return e.onPoint(o)}),r(),d(24,"atm-chart",22),r()(),i(25,"demo-section",23)(26,"div",2)(27,"atm-chart",24),m("nodeClick",function(o){return e.onNode(o)}),r(),i(28,"atm-chart",25),m("nodeClick",function(o){return e.onNode(o)})("drillDown",function(o){return e.onDrill(o)}),r(),d(29,"atm-chart",26),r()(),i(30,"demo-section",27)(31,"div",28),d(32,"atm-chart",29)(33,"atm-chart",30),r()(),i(34,"demo-section",31)(35,"div",28),d(36,"atm-chart",32)(37,"atm-chart",33),r()(),i(38,"demo-section",34)(39,"div",28),d(40,"atm-chart",35)(41,"atm-chart",36)(42,"atm-chart",37)(43,"atm-chart",38),r()(),i(44,"demo-section",39)(45,"div",2),d(46,"atm-chart",40)(47,"atm-chart",41),r()(),i(48,"demo-section",42)(49,"div",43)(50,"atm-chart",44),m("pointClick",function(o){return e.onPoint(o)}),r(),i(51,"atm-chart",45),m("pointClick",function(o){return e.onPoint(o)}),r()()(),i(52,"demo-section",46)(53,"div",47),v(54,M,6,11,"div",48,F),r()(),i(56,"demo-section",49),d(57,"atm-chart",50),r()()),s&2&&(a(),t("code",e.lineCode),a(2),t("labels",e.meses)("datasets",e.lineData),a(),t("labels",e.semanas)("datasets",e.areaData)("height",260),a(),t("code",e.barCode),a(2),t("labels",e.trimestres)("datasets",e.barData)("height",280),a(),t("labels",e.produtos)("datasets",e.barHData)("height",260)("showValues",!0)("legend",!1),a(),t("code",e.stackedCode),a(),t("labels",e.meses.slice(0,8))("datasets",e.stackedData)("stacked",!0)("height",300),a(),t("code",e.mixedCode),a(),t("labels",e.meses.slice(0,9))("datasets",e.mixedData)("height",300),a(),t("code",e.rangeCode),a(),t("labels",e.dias)("datasets",e.rangeData)("height",260)("legend",!1),a(),t("code",e.scatterCode),a(),t("labels",c(122,b))("datasets",e.scatterData)("height",300),a(),t("code",e.dotsCode),a(),t("labels",e.faixas)("datasets",e.dotsData)("height",280),a(),t("code",e.segmentsCode),a(),t("labels",e.regioes)("datasets",e.segmentsData)("height",220)("showValues",!0)("format",e.brl),a(),t("code",e.heatmapCode),a(2),t("labels",e.heatSemanas)("datasets",e.heatData)("height",280),a(),t("labels",e.meses)("datasets",e.commitsData)("colors",c(123,k))("height",220),a(),t("code",e.treemapCode),a(2),t("tree",e.treemapCidades)("height",300)("showValues",!0),a(),t("tree",e.treemapDispositivos)("height",320),a(),t("tree",e.treemapRegioes)("loadChildren",e.loadEstados)("height",300)("showValues",!0)("format",e.brl),a(),t("code",e.pieCode),a(2),t("labels",e.origens)("datasets",e.pieData)("height",260)("showValues",!0),a(),t("labels",e.categorias)("datasets",e.donutData)("height",260)("format",e.brl),a(),t("code",e.radarCode),a(2),t("labels",e.skills)("datasets",e.radarData)("height",300),a(),t("labels",e.skills)("datasets",e.radarData)("smooth",!1)("height",300),a(),t("code",e.radialCode),a(2),t("labels",e.paises)("datasets",e.radialData)("max",100)("height",260),a(),t("labels",e.paises)("datasets",e.radialData)("max",100)("height",260),a(),t("labels",c(124,b))("datasets",e.gaugeData)("max",100)("height",220),a(),t("labels",c(125,b))("datasets",e.gaugeStorageData)("max",100)("format",e.pct)("height",220)("colors",c(126,_)),a(),t("code",e.funnelCode),a(2),t("labels",e.etapasFin)("datasets",e.funnelFinData)("height",300)("format",e.brl),a(),t("labels",e.etapasVendas)("datasets",e.funnelVendasData)("colors",c(127,T))("height",280),a(),t("code",e.funnelStylesCode),a(2),t("labels",e.etapasRecrut)("datasets",e.funnelRecrutData)("height",360),a(),t("labels",e.etapasVendas)("datasets",e.funnelVendasData)("height",360),a(),t("code",e.sparkCode),a(2),C(e.sparkCards),a(2),t("code",e.configCode),a(),t("labels",e.meses.slice(0,6))("datasets",e.configData)("colors",c(128,w))("format",e.brl)("showValues",!0)("height",320))},dependencies:[D,A,E],encapsulation:2,changeDetection:0})};export{P as ChartsPage};
