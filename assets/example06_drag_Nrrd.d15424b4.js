import{b as r}from"./bundle.umd.d7554b89.js";/* empty css              */import{d as C,r as _,e as h,g as y,c as B,a as i,o as N}from"./index.94d28e09.js";import"./FileSaver.min.330e71f6.js";const V={id:"bg",ref:"base_container"},E={ref:"c_gui_2",id:"gui_2"},F=C({__name:"example06_drag_Nrrd",setup(R){let t=null,l=_(null),e,s=_(null),a;h(()=>{let{$refs:n}=y().proxy;t=n,l=t.base_container,s=t.c_gui,e=new r.exports.copperMSceneRenderer(l,2),new r.exports.nrrd_tools(e.sceneInfos[0].container),a=r.exports.loading(),r.exports.loading(),e.sceneInfos[0].container.appendChild(a.loadingContainer),u("/copper3d_examples/nrrd/breast-224.nrrd","nrrd0",e.sceneInfos[0],s),e.animate()});function p(){e.sceneInfos.forEach(n=>{n.resetView()})}function u(n,f,o,m){const g={openGui:!0,container:m},x=(S,d,j,b)=>{b.closed=!0,e.sceneInfos[0].scene.add(d.x),e.sceneInfos[1].loadViewUrl("/copper3d_examples/nrrd_view.json"),e.sceneInfos[0].setCameraPosition({x:300,z:0}),o.container.onclick=c=>{const v=c.offsetX,k=c.offsetY,w=o.pickSpecifiedModel(d.x,{x:v,y:k});console.log(w)},e.sceneInfos[1].scene.add(d.z)};o&&(o==null||o.loadNrrd(n,a,!1,x,g),o.loadViewUrl("/copper3d_examples/nrrd_view.json")),o.updateBackground("#18e5a7","#000"),r.exports.setHDRFilePath("venice_sunset_1k.hdr"),e.updateEnvironment(o)}return(n,f)=>(N(),B("div",V,[i("div",{ref_key:"c_gui",ref:s,id:"gui"},null,512),i("div",E,null,512),i("button",{class:"btn",ref:"btn",onClick:p},"reset",512)],512))}});export{F as default};
