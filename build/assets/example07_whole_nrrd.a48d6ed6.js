import{l as h,s as b}from"./index.4ecf1bb4.js";/* empty css              */import{d as v,r as d,b as x,g as w,c as k,a,o as B}from"./index.029fba82.js";import{c as y}from"./copperMSceneRenderer.5c3e2dcf.js";import"./dat.gui.module.6914edc7.js";import"./___vite-browser-external_commonjs-proxy.cbdc8e07.js";const N={id:"bg",ref:"base_container"},C={ref:"c_gui_2",id:"gui_2"},P=v({__name:"example07_whole_nrrd",setup(E){let n=null,s=d(null),t,o=d(null),l;x(()=>{let{$refs:e}=w().proxy;n=e,s=n.base_container,o=n.c_gui,t=new y(s,1),l=h(),_("/copper3d_examples/nrrd/breast-224.nrrd","nrrd0",t.sceneInfos[0],o),t.animate()});function i(){t.sceneInfos.forEach(e=>{e.resetView()})}function _(e,c,r,u){const p={openGui:!0,container:u},f=(M,R,m,g)=>{g.closed=!0,r.drawWholeNrrd(m)};r&&(r.loadNrrd(e,l,f,p),r.loadViewUrl("/copper3d_examples/nrrd_view.json")),r.updateBackground("#18e5a7","#000"),b("venice_sunset_1k.hdr"),t.updateEnvironment(r)}return(e,c)=>(B(),k("div",N,[a("div",{ref_key:"c_gui",ref:o,id:"gui"},null,512),a("div",C,null,512),a("button",{class:"btn",ref:"btn",onClick:i},"reset",512)],512))}});export{P as default};
