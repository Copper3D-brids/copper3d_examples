import{b as m}from"./bundle.umd.d7d646f1.js";/* empty css              */import{d as b,c as N,a as d,e as v,o as S,f as D,_ as E,r as n,b as j,g as F,h as y}from"./index.029fba82.js";import"./___vite-browser-external_commonjs-proxy.cbdc8e07.js";const U={class:"nav"},$={class:"content"},H={class:"arrows"},T=b({__name:"NavBar",props:{min:{default:0},max:{default:160}},emits:["onSliceChange"],setup(g,{emit:l}){const s=g;let a=0;const r=()=>{s.max&&s.max!=0&&(a<s.max&&a++,l("onSliceChange",1))},t=()=>{s.min>=0&&(a>s.min&&a--,l("onSliceChange",-1))};return(u,f)=>{const _=D("ion-icon");return S(),N("div",U,[d("div",$,[d("div",H,[d("span",{onClick:t},[v(_,{name:"chevron-back-outline"})]),d("span",{onClick:r},[v(_,{name:"chevron-forward-outline"})])])])])}}});const W=E(T,[["__scopeId","data-v-ca61cb6b"]]),q={ref:"c_gui_2",id:"gui_2"},X=b({__name:"example10_segmentaion_v2",setup(g){let l=n(),s=n(),a,r,t,u=n(!1),f=n(!1),_=n(!1),x=n(!1),C=n(!1),w=n(0),h=n(0);j(()=>{F().proxy,a=new m.exports.copperMSceneRenderer(l.value,1),r=new m.exports.nrrd_tools(a.sceneInfos[0].container),r.setContrastDisplayInMainArea(),t=m.exports.loading(),r.mainDisplayArea.appendChild(t.loadingContainer),a.sceneInfos[0].addSubView(),A("/copper3d_examples/nrrd/segmentation/ax dyn pre.nrrd","nrrd0",a.sceneInfos[0]),a.animate()});const k=i=>{u&&f&&_&&x&&C&&r.setSliceMoving(i)};function M(){a.sceneInfos.forEach(i=>{i.resetView()})}function A(i,B,e,G){const V=(c,p,o)=>{a.sceneInfos[0].loadViewUrl("/copper3d_examples/nrrd_view.json"),a.sceneInfos[0].subScene.add(p.z),r.setVolumeAndSlice(c,o.z),u.value=!0,h.value=r.getMaxSliceNum(),r.dragImageWithMode(e.controls,{mode:"mode1",showNumber:!0}),r.draw(e.controls,e,e.gui),a.sceneInfos[0].addPreRenderCallbackFunction(r.start)},z=(c,p,o)=>{r.setContrast1OriginCanvas(o.z),f.value=!0},O=(c,p,o)=>{r.setContrast2OriginCanvas(o.z),_.value=!0},P=(c,p,o)=>{r.setContrast3OriginCanvas(o.z),x.value=!0},R=(c,p,o)=>{r.setContrast4OriginCanvas(o.z),C.value=!0};e&&(e==null||e.loadNrrd(i,t,V),e==null||e.loadNrrd("/copper3d_examples/nrrd/segmentation/ax dyn 1st pass.nrrd",t,z),e==null||e.loadNrrd("/copper3d_examples/nrrd/segmentation/ax dyn 2nd pass.nrrd",t,O),e==null||e.loadNrrd("/copper3d_examples/nrrd/segmentation/ax dyn 3rd pass.nrrd",t,P),e==null||e.loadNrrd("/copper3d_examples/nrrd/segmentation/ax dyn 4th pass.nrrd",t,R),e.loadViewUrl("/copper3d_examples/nrrd_view.json")),e.updateBackground("#18e5a7","#ff00ff"),m.exports.setHDRFilePath("venice_sunset_1k.hdr"),a.updateEnvironment(e)}return(i,B)=>(S(),N("div",{id:"bg",ref_key:"base_container",ref:l},[d("div",{ref_key:"c_gui",ref:s,id:"gui"},null,512),d("div",q,null,512),d("button",{class:"btn",ref:"btn",onClick:M},"reset",512),v(W,{onOnSliceChange:k,min:y(w),max:y(h)},null,8,["min","max"])],512))}});export{X as default};