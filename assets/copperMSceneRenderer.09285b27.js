var m=Object.defineProperty;var l=(s,e,t)=>e in s?m(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var n=(s,e,t)=>(l(s,typeof e!="symbol"?e+"":e,t),t);import{W as p,P as u,b as f,q as S,e as g,R as w,r as v}from"./index.ef0f5e24.js";class C{constructor(e,t,r){n(this,"numberOfScene");n(this,"container");n(this,"elems");n(this,"scenes");n(this,"cameras");n(this,"renderer",new p({alpha:!0,antialias:!0}));n(this,"canvas");n(this,"sceneInfos");n(this,"pmremGenerator");n(this,"renderSceneInfo",e=>{const t=e.container,{left:r,right:i,top:o,bottom:a,width:c,height:h}=t.getBoundingClientRect();if(a<0||o>this.renderer.domElement.clientHeight||i<0||r>this.renderer.domElement.clientWidth)return;const d=this.renderer.domElement.clientHeight-a;this.renderer.setScissor(r,d,c,h),this.renderer.setViewport(r,d,c,h),e.render()});n(this,"resizeRendererToDisplaySize",()=>{const e=this.renderer.domElement.clientWidth,t=this.renderer.domElement.clientHeight;(this.renderer.domElement.width!==e||this.renderer.domElement.height!==t)&&(this.elems.map((i,o)=>{o===this.numberOfScene-1&&this.numberOfScene%2!==0?i.style.width=this.container.clientWidth+"px":i.style.width=this.container.clientWidth/2-2+"px",i.style.height=this.container.clientHeight/Math.ceil(this.numberOfScene/2)+"px"}),this.renderer.setSize(e,t,!1))});n(this,"animate",()=>{const e=new v("#000");this.renderer.setScissorTest(!1),this.renderer.setClearColor(e,0),this.renderer.clear(!0,!0),this.renderer.setScissorTest(!0),this.resizeRendererToDisplaySize(),this.sceneInfos.forEach(r=>{this.renderSceneInfo(r)});const t=`translateY(${window.scrollY}px)`;this.renderer.domElement.style.transform=t,window.requestAnimationFrame(this.animate)});this.numberOfScene=t>0?t:1,this.container=e,this.elems=[],this.scenes=[],this.cameras=[],this.sceneInfos=[],this.canvas=this.renderer.domElement,this.pmremGenerator=new u(this.renderer),this.init()}init(){this.renderer.useLegacyLights=!0,this.renderer.outputColorSpace=f,this.pmremGenerator.compileEquirectangularShader(),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.canvas.className="copper3D_canvas",this.container.className="copper3D_container_root",this.container.appendChild(this.canvas);for(let e=0;e<this.numberOfScene;e++){const t=document.createElement("div");t.className="copper3D_scene_div",this.container.appendChild(t),this.elems.push(t);const r=new S(t,this.renderer);this.updateEnvironment(r),this.sceneInfos.push(r)}}updateEnvironment(e){const t=g.filter(r=>r.name==="Venice Sunset")[0];this.getCubeMapTexture(t).then(r=>{r&&e.vignette&&e.scene.add(e.vignette.mesh),e.scene.environment=r,e.scene.background=r})}getCubeMapTexture(e){const{path:t}=e;return t?new Promise((r,i)=>{new w().load(t,o=>{const a=this.pmremGenerator.fromEquirectangular(o).texture;this.pmremGenerator.dispose(),r(a)},void 0,i)}):Promise.resolve({envMap:null})}}export{C as c};