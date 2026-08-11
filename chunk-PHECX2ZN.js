import{a as R,b as w}from"./chunk-KGAQSRHR.js";import{A as s,F as b,H as v,Ma as U,Q as l,R as E,S as g,ca as z,f,hc as S,i as h,k as c,n as r,o as y,r as u,s as p,x as o,y as d,z as i}from"./chunk-BJZMHQD7.js";function _(n,a){if(n&1&&(d(0,"span",14),s(1,"span",22),l(2),i()),n&2){let t=v();r(2),g(" Gravando \u2014 ",t.recordingLabel()," ")}}function M(n,a){if(n&1&&(d(0,"p",15),l(1),i()),n&2){let t=v();r(),E(t.micError())}}function x(n,a){n&1&&(d(0,"div",5)(1,"span",6),l(2,"Sua grava\xE7\xE3o"),i(),s(3,"atm-audio-visualizer",23),i()),n&2&&(r(3),o("src",a))}var D="https://d1j1y3gb82cpmr.cloudfront.net/audio_player/download_song_direct/22484103/c96552dccd36161151d40bd8f30fa9e0",C=class n{destroyRef=f(h);demoUrl=D;recording=c(!1);recStream=c(null);recordedUrl=c(null);recSeconds=c(0);micError=c("");recordingLabel=z(()=>{let a=this.recSeconds(),t=Math.floor(a/60),e=(a%60).toString().padStart(2,"0");return`${t}:${e}`});recorder=null;chunks=[];timer=null;constructor(){this.destroyRef.onDestroy(()=>{this.recorder?.stream.getTracks().forEach(t=>t.stop()),this.timer&&clearInterval(this.timer);let a=this.recordedUrl();a&&URL.revokeObjectURL(a)})}toggleRecording(){this.recording()?this.stopRecording():this.startRecording()}async startRecording(){this.micError.set("");try{let a=await navigator.mediaDevices.getUserMedia({audio:!0}),t=this.recordedUrl();t&&URL.revokeObjectURL(t),this.recordedUrl.set(null),this.chunks=[],this.recorder=new MediaRecorder(a),this.recorder.ondataavailable=e=>{e.data.size&&this.chunks.push(e.data)},this.recorder.onstop=()=>{let e=new Blob(this.chunks,{type:this.recorder?.mimeType||"audio/webm"});this.recordedUrl.set(URL.createObjectURL(e)),a.getTracks().forEach(m=>m.stop()),this.recStream.set(null)},this.recorder.start(),this.recStream.set(a),this.recording.set(!0),this.recSeconds.set(0),this.timer=setInterval(()=>this.recSeconds.update(e=>e+1),1e3)}catch{this.micError.set("N\xE3o foi poss\xEDvel acessar o microfone. Verifique as permiss\xF5es do navegador.")}}stopRecording(){this.recorder?.stop(),this.recording.set(!1),this.timer&&(clearInterval(this.timer),this.timer=null)}urlCode='<atm-audio-visualizer src="https://exemplo.com/musica.mp3" />';stylesCode=`<atm-audio-visualizer [src]="url" variant="bars" />
<atm-audio-visualizer [src]="url" variant="wave" color="warning" />
<atm-audio-visualizer [src]="url" variant="ring" size="large" color="info" />`;recorderCode=`<!-- template -->
<atm-audio-visualizer [stream]="recStream()" variant="wave" color="danger" />
@if (recordedUrl(); as url) {
  <atm-audio-visualizer [src]="url" variant="bars" color="success" />
}

// componente
readonly recStream = signal<MediaStream | null>(null);
readonly recordedUrl = signal<string | null>(null);
private recorder!: MediaRecorder;
private chunks: Blob[] = [];

async start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  this.recorder = new MediaRecorder(stream);
  this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
  this.recorder.onstop = () => {
    this.recordedUrl.set(URL.createObjectURL(new Blob(this.chunks)));
    stream.getTracks().forEach((t) => t.stop());
    this.recStream.set(null);
  };
  this.recorder.start();
  this.recStream.set(stream);
}

stop() {
  this.recorder.stop();
}`;colorsCode=`<atm-audio-visualizer [src]="url" size="large" color="success" />
<atm-audio-visualizer [src]="url" size="medium" color="danger" variant="wave" />
<atm-audio-visualizer [src]="url" size="slim" color="neutral" />`;static \u0275fac=function(t){return new(t||n)};static \u0275cmp=y({type:n,selectors:[["audio-page"]],decls:31,vars:19,consts:[["title","\xC1udio","description",`Visualizador de intensidade de \xE1udio com Web Audio API \u2014 toca URLs, reage a
        streams do microfone e anima em tr\xEAs estilos diferentes.`,"importCode","import { AtmAudioVisualizer } from '@atmus/ngui';"],["id","audio-url","title","Player com URL","description",`Passe um src e o componente cuida do play/pause, tempo e visualiza\xE7\xE3o.
          Para URLs remotas o servidor precisa permitir CORS.`,3,"code"],[3,"src"],["id","audio-styles","title","Tr\xEAs estilos","description",`bars (barras arredondadas), wave (ondas espelhadas) e ring (radial pulsante).
          D\xEA play em cada um para ver a anima\xE7\xE3o.`,3,"code"],[1,"flex","w-full","flex-col","gap-8"],[1,"flex","w-full","flex-col","gap-1.5"],[1,"text-xs","font-semibold","text-ink-faint","uppercase"],["variant","bars",3,"src"],["variant","wave","color","warning",3,"src"],["variant","ring","size","large","color","info",3,"src"],["id","audio-recorder","title","Gravador do navegador","description",`MediaRecorder + getUserMedia: o stream do microfone entra no [stream] e a
          intensidade da sua voz aparece ao vivo. Ao parar, o blob gravado vira um player.`,3,"code"],[1,"flex","w-full","flex-col","gap-4"],[1,"flex","items-center","gap-4"],[3,"clicked","color","icon","rounded"],[1,"flex","items-center","gap-2","text-sm","text-ink-muted"],[1,"text-sm","text-danger"],["variant","wave","color","danger",3,"stream"],["id","audio-colors","title","Cores & tamanhos","description","Tokens sem\xE2nticos de cor e a escala large / medium / slim.",3,"code"],[1,"flex","w-full","flex-col","gap-6"],["size","large","color","success",3,"src"],["size","medium","color","danger","variant","wave",3,"src"],["size","slim","color","neutral",3,"src"],[1,"size-2","animate-pulse","rounded-full","bg-danger"],["variant","bars","color","success",3,"src"]],template:function(t,e){if(t&1&&(d(0,"demo-page",0)(1,"demo-section",1),s(2,"atm-audio-visualizer",2),i(),d(3,"demo-section",3)(4,"div",4)(5,"div",5)(6,"span",6),l(7,'variant="bars"'),i(),s(8,"atm-audio-visualizer",7),i(),d(9,"div",5)(10,"span",6),l(11,'variant="wave"'),i(),s(12,"atm-audio-visualizer",8),i(),d(13,"div",5)(14,"span",6),l(15,'variant="ring"'),i(),s(16,"atm-audio-visualizer",9),i()()(),d(17,"demo-section",10)(18,"div",11)(19,"div",12)(20,"atm-button",13),b("clicked",function(){return e.toggleRecording()}),l(21),i(),u(22,_,3,1,"span",14),i(),u(23,M,2,1,"p",15),s(24,"atm-audio-visualizer",16),u(25,x,4,1,"div",5),i()(),d(26,"demo-section",17)(27,"div",18),s(28,"atm-audio-visualizer",19)(29,"atm-audio-visualizer",20)(30,"atm-audio-visualizer",21),i()()()),t&2){let m;r(),o("code",e.urlCode),r(),o("src",e.demoUrl),r(),o("code",e.stylesCode),r(5),o("src",e.demoUrl),r(4),o("src",e.demoUrl),r(4),o("src",e.demoUrl),r(),o("code",e.recorderCode),r(3),o("color",e.recording()?"danger":"primary")("icon",e.recording()?"square":"mic")("rounded",!0),r(),g(" ",e.recording()?"Parar grava\xE7\xE3o":"Gravar"," "),r(),p(e.recording()?22:-1),r(),p(e.micError()?23:-1),r(),o("stream",e.recStream()),r(),p((m=e.recordedUrl())?25:-1,m),r(),o("code",e.colorsCode),r(2),o("src",e.demoUrl),r(),o("src",e.demoUrl),r(),o("src",e.demoUrl)}},dependencies:[S,U,w,R],encapsulation:2,changeDetection:0})};export{C as AudioPage};
