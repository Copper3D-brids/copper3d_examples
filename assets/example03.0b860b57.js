import{l as b,s as x}from"./index.ef0f5e24.js";/* empty css              */import{c as y}from"./copperMSceneRenderer.09285b27.js";import{d as B,r as l,e as j,g as w,c as N,a as u,o as h,_ as E}from"./index.94d28e09.js";import"./FileSaver.min.330e71f6.js";const C={id:"bg",ref:"base_container"},O=B({__name:"example03",setup(R){let c=l(null),o,t=l(null),d=l(null),a=l(null),s;j(()=>{let{$refs:r}=w().proxy;c=r.base_container,t=r.c_gui,d=r.c_gui_2,a=r.c_gui_3,console.log(t),console.log(d),console.log(a),o=new y(c,3),s=b(),m("/copper3d_examples/nrrd/segmentation/c1.nrrd","nrrd0",o.sceneInfos[0],t),m("/copper3d_examples/nrrd/stent.nrrd","nrrd1",o.sceneInfos[1],d),v("/copper3d_examples/nrrd/segmentation/c1.nrrd","nrrd",o.sceneInfos[2],a),o.animate()});function m(r,f,e,_){const i={openGui:!0,container:_},g=(n,p,V,k)=>{e.addObject(p.x),e.addObject(p.y),e.addObject(p.z),k.closed=!0};e&&(e==null||e.loadNrrd(r,s,!1,g,i),e.loadViewUrl("/copper3d_examples/nrrd_view.json")),e.updateBackground("#18e5a7","#000"),x("venice_sunset_1k.hdr"),o.updateEnvironment(e)}function v(r,f,e,_){const i=(g,n)=>{n.closed=!0,_.appendChild(n.domElement)};e&&(e==null||e.loadNrrdTexture3d(r,i),e.loadViewUrl("/copper3d_examples/nrrd_view_texture3d.json")),e.updateBackground("#18e5a7","#000"),x("venice_sunset_1k.hdr"),o.updateEnvironment(e)}return(r,f)=>(h(),N("div",C,[u("div",{ref_key:"c_gui",ref:t,id:"gui"},null,512),u("div",{ref_key:"c_gui_2",ref:d,id:"gui_2"},null,512),u("div",{ref_key:"c_gui_3",ref:a,id:"gui_3"},null,512)],512))}});const G=E(O,[["__scopeId","data-v-4f2708d3"]]);export{G as default};
