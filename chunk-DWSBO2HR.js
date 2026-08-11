import{a as q,b as V}from"./chunk-KGAQSRHR.js";import{A as f,Da as M,E as S,F as g,H as A,Ia as z,M as v,Ma as D,Q as s,S as x,Sa as k,U as E,V as P,W as I,db as R,eb as j,f as _,g as m,h as u,k as h,m as y,n as t,o as w,r as b,s as C,va as U,x as r,xa as F,y as n,z as a}from"./chunk-BJZMHQD7.js";function L(c,l){if(c&1&&f(0,"img",31),c&2){let i=A();r("src",i.result(),y)}}function N(c,l){c&1&&(n(0,"div",32),s(1,' Clique em "Gerar recorte" '),a())}var B=`<svg xmlns='http://www.w3.org/2000/svg' width='960' height='640'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#6366f1'/>
      <stop offset='1' stop-color='#0ea5e9'/>
    </linearGradient>
  </defs>
  <rect width='960' height='640' fill='url(#g)'/>
  <circle cx='740' cy='150' r='120' fill='#ffffff' opacity='0.15'/>
  <circle cx='200' cy='520' r='170' fill='#ffffff' opacity='0.12'/>
  <text x='50%' y='48%' fill='#ffffff' font-family='sans-serif' font-size='96'
    font-weight='700' text-anchor='middle'>Atmus UI</text>
  <text x='50%' y='60%' fill='#ffffff' font-family='sans-serif' font-size='34'
    text-anchor='middle' opacity='0.85'>image-crop demo</text>
</svg>`,T=class c{toast=_(z);single=h(null);uploading=h(!1);result=h(null);sampleSrc=`data:image/svg+xml;utf8,${encodeURIComponent(B)}`;onRejected(){this.toast.warning("Arquivo(s) rejeitado(s)","Verifique tipo, tamanho e quantidade.")}async upload(l){let i=l.items();if(!i.length){this.toast.info("Nenhum arquivo","Selecione arquivos antes de enviar.");return}let e=new FormData;i.forEach(o=>e.append("files",o.file,o.file.name)),this.uploading.set(!0),await Promise.all(i.map(o=>this.fakeUpload(l,o.id))),this.uploading.set(!1),this.toast.success("Upload conclu\xEDdo",`${i.length} arquivo(s) enviados.`)}fakeUpload(l,i){return new Promise(e=>{l.patchItem(i,{status:"uploading",progress:0});let o=0,d=setInterval(()=>{o+=Math.random()*22,o>=100?(clearInterval(d),l.patchItem(i,{status:"success",progress:100}),e()):l.patchItem(i,{progress:Math.round(o)})},180)})}async generate(l){let i=await l.toBlob();if(!i)return;let e=this.result();e?.startsWith("blob:")&&URL.revokeObjectURL(e),this.result.set(URL.createObjectURL(i))}basicCode=`<atm-label>Anexo</atm-label>
<atm-file-input [(ngModel)]="single" />`;dropzoneCode=`<atm-file-input
  [multiple]="true"
  accept="image/*,application/pdf"
  [maxSize]="5 * 1024 * 1024"
  [maxFiles]="6"
  (rejected)="onRejected($event)"
/>`;sizesCode=`<atm-file-input size="large" />
<atm-file-input size="medium" />
<atm-file-input size="slim" />`;uploadCode=`// template
<atm-file-input #uploader [multiple]="true" accept="image/*,.pdf" />
<atm-button [loading]="uploading()" (clicked)="upload(uploader)">Enviar</atm-button>

// component \u2014 envio real com progresso por arquivo
async upload(uploader: AtmFileInput) {
  this.uploading.set(true);
  await Promise.all(
    uploader.items().map((item) => {
      const formData = new FormData();
      formData.append('file', item.file, item.file.name);
      uploader.patchItem(item.id, { status: 'uploading', progress: 0 });

      return uploadWithProgress('/api/upload', formData, (p) =>
        uploader.patchItem(item.id, { progress: p }),
      )
        .then(() => uploader.patchItem(item.id, { status: 'success', progress: 100 }))
        .catch((e) => uploader.patchItem(item.id, { status: 'error', error: String(e) }));
    }),
  );
  this.uploading.set(false);
}

// helper reutiliz\xE1vel com XMLHttpRequest (fetch n\xE3o exp\xF5e progresso de upload)
function uploadWithProgress(url: string, body: FormData, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status < 400 ? resolve() : reject(xhr.statusText));
    xhr.onerror = () => reject('Erro de rede');
    xhr.send(body);
  });
}`;cropUploadCode=`<!-- Avatar: recorte circular 1:1 -->
<atm-file-input accept="image/*" [crop]="true" [cropAspect]="1" [cropRound]="true" />

<!-- Capa: recorte livre, m\xFAltiplas imagens -->
<atm-file-input accept="image/*" [multiple]="true" [crop]="true" />`;cropCode=`// template
<atm-image-crop #cropper [src]="file" [aspect]="16 / 9" [height]="260" />
<atm-button (clicked)="generate(cropper)">Gerar recorte</atm-button>

// component
async generate(cropper: AtmImageCrop) {
  const file = await cropper.toFile('recorte.png'); // ou toBlob()
  // ...envie o file / mostre o preview
}`;static \u0275fac=function(i){return new(i||c)};static \u0275cmp=w({type:c,selectors:[["upload-page"]],decls:50,vars:26,consts:[["uploader",""],["cropper",""],["title","Upload & Crop","description","\xC1rea de arrastar-e-soltar com preview, m\xFAltiplos tipos, envio via FormData e recorte de imagens em di\xE1logo.","importCode","import { AtmFileInput, AtmImageCrop, AtmImageCropDialog } from '@atmus/ngui';"],["id","file-input","title","FileInput \u2014 b\xE1sico","description","Um \xFAnico arquivo, integrado a formul\xE1rios com [(ngModel)].",3,"code"],[1,"w-full"],[3,"ngModelChange","ngModel"],[1,"mt-2","text-sm","text-ink-muted"],["id","file-input-dropzone","title","\xC1rea de drop + m\xFAltiplos","description","Arraste v\xE1rios arquivos, com limite de tipo, tamanho e quantidade.",3,"code"],["accept","image/*,application/pdf",3,"rejected","multiple","maxSize","maxFiles"],["id","file-input-sizes","title","Tamanhos","description","large \xB7 medium \xB7 slim.",3,"code"],[1,"flex","w-full","flex-col","gap-4"],["size","large",3,"preview"],["size","medium",3,"preview"],["size","slim",3,"preview"],["id","file-input-upload","title","Envio para API (FormData)","description","Progresso por arquivo via patchItem(). O snippet mostra o upload real com XMLHttpRequest.",3,"code"],[1,"flex","w-full","flex-col","gap-3"],["accept","image/*,.pdf,.zip,.docx,.xlsx",3,"multiple"],[1,"flex","gap-2"],["icon","cloud-upload",3,"clicked","loading"],["variant","soft","color","neutral","icon","eraser",3,"clicked"],["id","file-input-crop","title","Upload com recorte ([crop])","description","Com [crop]=true, toda imagem abre o di\xE1logo de recorte antes de entrar na lista.",3,"code"],[1,"grid","w-full","gap-6","sm:grid-cols-2"],["accept","image/*",3,"crop","cropAspect","cropRound"],["accept","image/*",3,"multiple","crop"],["id","image-crop","title","ImageCrop \u2014 componente","description","Recorte independente: mova/redimensione a caixa e gere o Blob/File na resolu\xE7\xE3o original.",3,"code"],[1,"grid","w-full","gap-6","md:grid-cols-2"],[3,"src","aspect","height"],[1,"mt-3","flex","items-center","gap-2"],["icon","crop",3,"clicked"],["variant","ghost","color","neutral","icon","refresh",3,"clicked"],[1,"flex","flex-col"],["alt","Recorte",1,"max-h-64","w-full","rounded-atm","border","border-line","object-contain","bg-surface-alt",3,"src"],[1,"flex","min-h-40","flex-1","items-center","justify-center","rounded-atm","border","border-dashed","border-line","text-sm","text-ink-faint"]],template:function(i,e){if(i&1){let o=S();n(0,"demo-page",2)(1,"demo-section",3)(2,"div",4)(3,"atm-label"),s(4,"Anexo"),a(),n(5,"atm-file-input",5),I("ngModelChange",function(p){return m(o),P(e.single,p)||(e.single=p),u(p)}),a(),n(6,"p",6),s(7),a()()(),n(8,"demo-section",7)(9,"div",4)(10,"atm-file-input",8),g("rejected",function(){return m(o),u(e.onRejected())}),a()()(),n(11,"demo-section",9)(12,"div",10),f(13,"atm-file-input",11)(14,"atm-file-input",12)(15,"atm-file-input",13),a()(),n(16,"demo-section",14)(17,"div",15),f(18,"atm-file-input",16,0),n(20,"div",17)(21,"atm-button",18),g("clicked",function(){m(o);let p=v(19);return u(e.upload(p))}),s(22),a(),n(23,"atm-button",19),g("clicked",function(){m(o);let p=v(19);return u(p.clear())}),s(24," Limpar "),a()()()(),n(25,"demo-section",20)(26,"div",21)(27,"div")(28,"atm-label"),s(29,"Avatar (recorte circular 1:1)"),a(),f(30,"atm-file-input",22),a(),n(31,"div")(32,"atm-label"),s(33,"Capa (recorte livre, m\xFAltiplas)"),a(),f(34,"atm-file-input",23),a()()(),n(35,"demo-section",24)(36,"div",25)(37,"div"),f(38,"atm-image-crop",26,1),n(40,"div",27)(41,"atm-button",28),g("clicked",function(){m(o);let p=v(39);return u(e.generate(p))}),s(42,"Gerar recorte"),a(),n(43,"atm-button",29),g("clicked",function(){m(o);let p=v(39);return u(p.reset())}),s(44," Redefinir "),a()()(),n(45,"div",30)(46,"atm-label"),s(47,"Resultado"),a(),b(48,L,1,1,"img",31)(49,N,2,0,"div",32),a()()()()}if(i&2){let o,d=v(19);t(),r("code",e.basicCode),t(4),E("ngModel",e.single),t(2),x(" Selecionado: ",((o=e.single())==null?null:o.name)??"nenhum"," "),t(),r("code",e.dropzoneCode),t(2),r("multiple",!0)("maxSize",5*1024*1024)("maxFiles",6),t(),r("code",e.sizesCode),t(2),r("preview",!1),t(),r("preview",!1),t(),r("preview",!1),t(),r("code",e.uploadCode),t(2),r("multiple",!0),t(3),r("loading",e.uploading()),t(),x(" Enviar ",d.items().length," arquivo(s) "),t(3),r("code",e.cropUploadCode),t(5),r("crop",!0)("cropAspect",1)("cropRound",!0),t(4),r("multiple",!0)("crop",!0),t(),r("code",e.cropCode),t(3),r("src",e.sampleSrc)("aspect",16/9)("height",260),t(10),C(e.result()?48:49)}},dependencies:[M,U,F,j,R,D,k,V,q],encapsulation:2,changeDetection:0})};export{T as UploadPage};
