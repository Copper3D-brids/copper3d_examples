import{T as j,S as B,a as E,l as L,c as N,f as F,s as U}from"./index.981bc946.js";import{d as H,r as h,e as O,g as G,c as z,a as l,o as A}from"./index.e993aee8.js";import"./___vite-browser-external_commonjs-proxy.1a3c0f4d.js";function D(m,f,n,a,e,s){const c=document.createElement("canvas");c.width=512,c.height=512;const i=c.getContext("2d");i.textBaseline="alphabetic",i.measureText(m).width,i.fillStyle="rgb(255,255,255)",i.textAlign="center",s?i.font=s.font_size+" "+s.font:i.font="30px Helvetica",i.fillText(m,256,256),i.strokeStyle="rgb(255,255,255)",i.strokeText(m,256,256);const p=new j(c);p.needsUpdate=!0;const x=new B({map:p,color:"#ffffff"}),g=new E(x);return g.scale.set(e,e,1),g.position.set(f,n,a),g}function y(m,f,n,a,e,s,c){const i=D(f,n,a,e,s,c);m.addObject(i)}const I={id:"bg",ref:"base_container"},K={class:"btn"},Q=H({__name:"example01",setup(m){let f=null,n,a,e,s=[],c=h(null),i=h(null),k;O(()=>{let{$refs:r}=G().proxy;f=r,c=f.base_container,i=f.c_gui,k=L(),n=new N(c,{guiOpen:!0,camera:!0,performance:!0,light:!0}),n.closeGui(),document.addEventListener("keydown",o=>{o.code==="KeyF"&&F(c)}),n.getCurrentScene().createDemoMesh(),n.animate()});function p(r,t){if(e&&x(e),e=n.getSceneByName(t),e==null){e=n.createScene(t),s.push(e);const o=()=>{window.location.href="https://linkungao.github.io/medtech-heart-vue/model-heart",document.removeEventListener("click",o)},v=["whole-body","whole-body_2","whole-body_1"];e&&(n.setCurrentScene(e),e.controls.staticMoving=!0,t==="test"?e.loadGltf(r,b=>{e&&e.pickModel(b,d=>{d&&d.name==="whole-heart"?document.addEventListener("click",o):document.removeEventListener("click",o),d&&console.log(d.name)},v)}):e.loadGltf(r,b=>{a&&e&&e.updateCamera(a)}),t!="walk"&&(t=="fibrillation"?e.loadViewUrl("/copper3d_examples/arrythmiaActivity_view.json"):t==="test"?(e.loadViewUrl("/copper3d_examples/human_view.json"),y(e,"Digital Twins",23.47044074808355,553.7649452795513,700.421283,600,{font_size:"50px",font:"Raleway"})):(e.loadViewUrl("/copper3d_examples/noInfarct_view.json"),y(e,"left ventricle",-55.056679,-14.82123313284426,5.421283,60),y(e,"right ventricle",-44.323991175632,31.1417335930078,10.421283,60))),e.updateBackground("#5454ad","#18e5a7")),U("/copper3d_examples/footprint_court_2k.hdr"),n.updateEnvironment()}else a&&e.updateCamera(a),n.setCurrentScene(e)}function x(r){const t=[-.9551143646240234,2.91867446899414,2.7563438415527344];a=r.setViewPoint(r.camera,t)}function g(){console.log(s),a=void 0,s.forEach(r=>{r.resetView(),r.isHalfed&&console.log(r.isHalfed)})}let _=1;function R(){_+=1,e&&e.setPlayRate(_),console.log(_)}function T(){_-=1,e&&e.setPlayRate(_),console.log(_)}function S(r,t){if(e=n.getSceneByName(t),e==null){e=n.createScene(t),e==null||e.container.appendChild(k.loadingContainer);const o={openGui:!0,container:i},v=(b,d,u)=>{e==null||e.addObject(d.x),e==null||e.addObject(d.y),e==null||e.addObject(d.z)};e&&(n.setCurrentScene(e),e==null||e.loadNrrd(r,k,v,o),e.loadViewUrl("/copper3d_examples/nrrd_view.json"),s.push(e))}}function V(r,t){e=n.getSceneByName(t);const o="/copper3d_examples/surfaces_lv/model_participant_000_lv_demo_endo_0",v="/copper3d_examples/surfaces_lv/model_participant_000_lv_demo_epi_0";let b=[],d=[];if(e==null){if(e=n.createScene(t),e){n.setCurrentScene(e);for(let u=0;u<31;u++){let C="",w="";u<10?(C=o+"0"+u+".vtk",w=v+"0"+u+".vtk"):(C=o+u+".vtk",w=v+u+".vtk"),b.push(C),d.push(w)}e==null||e.loadVtks([{name:"heart_inner",urls:b},{name:"heart_outer",urls:d}]),e.loadViewUrl("/copper3d_examples/d_heart_view.json"),s.push(e)}}else a&&e.updateCamera(a),n.setCurrentScene(e)}function $(){if(n){const t=n.getCurrentScene().getCurrentTime();console.log(t)}}function M(){e==null||e.addPreRenderCallbackFunction($)}function P(){const t=n.getCurrentScene().getCurrentMixer();console.log(t)}return(r,t)=>(A(),z("div",I,[l("div",{ref_key:"c_gui",ref:i,id:"gui"},null,512),l("div",K,[l("button",{onClick:t[0]||(t[0]=o=>p("/copper3d_examples/heart_2d.gltf","health"))}," Health "),l("button",{onClick:t[1]||(t[1]=o=>p("/copper3d_examples/Minor.glb","minor"))}," Minor "),l("button",{onClick:t[2]||(t[2]=o=>p("/copper3d_examples/normalActivity.glb","normal"))}," Electricity normal "),l("button",{onClick:t[3]||(t[3]=o=>p("/copper3d_examples/Fibrillation.glb","fibrillation"))}," Fibrillation "),l("button",{onClick:t[4]||(t[4]=o=>p("/copper3d_examples/Severe.glb","severe"))}," Severe "),l("button",{onClick:t[5]||(t[5]=o=>p("/copper3d_examples/walkmodel.glb","walk"))}," Walk model "),l("button",{onClick:t[6]||(t[6]=o=>p("/copper3d_examples/test.glb","test"))}," Test "),l("button",{onClick:g},"Reset"),l("button",{onClick:R},"addPlayRate"),l("button",{onClick:T},"minusPlayRate"),l("button",{onClick:t[7]||(t[7]=o=>S("/copper3d_examples/nrrd/segmentation/ax dyn pre.nrrd","nrrd"))}," LoadNrrd "),l("button",{onClick:t[8]||(t[8]=o=>S("/copper3d_examples/nrrd/breast.nrrd","nrrd-breast1"))}," LoadNrrd-breast1 "),l("button",{onClick:t[9]||(t[9]=o=>V("/copper3d_examples/nrrd/breast.vtk","vtk-breast1"))}," LoadVtk-heart "),l("button",{onClick:M},"getTime"),l("button",{onClick:P},"getMixer")])],512))}});export{Q as default};