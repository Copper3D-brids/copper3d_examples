import{G as u,c,f as x,s as f}from"./index.981bc946.js";import{d as g,r as n,e as h,g as y,c as v,a as k,o as w}from"./index.e993aee8.js";import"./___vite-browser-external_commonjs-proxy.1a3c0f4d.js";const B={id:"bg",ref:"base_container"},R=g({__name:"example12_2d_texture_heart",setup(b){let l=null,r,a,d=n(null),o=n(null),t=new u({width:350,autoPlace:!1});h(()=>{let{$refs:i}=y().proxy;l=i,d=l.base_container,o=i.c_gui,o.appendChild(t.domElement),r=new c(d,{guiOpen:!0,camera:!0,performance:!0,light:!0}),r.closeGui(),document.addEventListener("keydown",e=>{e.code==="KeyF"&&x(d)});const s=[];for(let e=1;e<=32;e++)s.push(`/copper3d_examples/mri_4ch/${e}.dcm`);p(s,"texture2d"),r.animate()});function p(i,s){a=r.getSceneByName(s),a==null&&(a=r.createScene(s),a&&(r.setCurrentScene(a),a.loadViewUrl("/copper3d_examples/texture2d_view_array.json"),a.loadDicom(i,{gui:t,getMesh(e){console.log(e)},setAnimation(e,m,_){return e+=_,e>m&&(e=0),e}}),a.loadGltf("/copper3d_examples/heart_2d.gltf",e=>{e.scale.set(4,4,4),e.rotation.set(2.8,3.9,4.2),e.position.set(-7.6,20.8,-1.7),t.add(e.rotation,"x").min(.1).max(10).step(.1),t.add(e.rotation,"y").min(.1).max(10).step(.1),t.add(e.rotation,"z").min(.1).max(10).step(.1),t.add(e.scale,"x").min(.1).max(10).step(.1),t.add(e.scale,"y").min(.1).max(10).step(.1),t.add(e.scale,"z").min(.1).max(10).step(.1),t.add(e.position,"x").min(-100).max(100).step(.1),t.add(e.position,"y").min(-100).max(100).step(.1),t.add(e.position,"z").min(-100).max(100).step(.1),a==null||a.setPlayRate(3.5)}),a.updateBackground("#5454ad","#18e5a7")),f("/copper3d_examples/footprint_court_2k.hdr"),r.updateEnvironment())}return(i,s)=>(w(),v("div",B,[k("div",{ref_key:"c_gui",ref:o,id:"gui"},null,512)],512))}});export{R as default};