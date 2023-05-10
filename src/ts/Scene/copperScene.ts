import * as THREE from "three";
// import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { Copper3dTrackballControls } from "../Controls/Copper3dTrackballControls";

import { CameraViewPoint } from "../Controls/copperControls";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { copperGltfLoader } from "../Loader/copperGltfLoader";
import { pickModelDefault } from "../Utils/raycaster";
import { copperNrrdLoader, optsType } from "../Loader/copperNrrdLoader";
import { copperVtkLoader, copperMultipleVtk } from "../Loader/copperVtkLoader";
import { createTexture2D_Array, createTexture2D_Zip } from "../Utils/texture2d";
import { objLoader } from "../Loader/copperOBJLoader";
import baseScene from "./baseScene";
import { GUI } from "dat.gui";
import { copperDicomLoader } from "../Loader/copperDicomLoader";
import {
  preRenderCallbackFunctionType,
  nrrdMeshesType,
  nrrdSliceType,
  vtkModels,
  copperVolumeType,
  loadingBarType,
  dicomLoaderOptsType,
} from "../types/types";

export default class copperScene extends baseScene {
  clock: THREE.Clock = new THREE.Clock();
  controls: Copper3dTrackballControls;
  // isHalfed: boolean = false;

  private mixer: THREE.AnimationMixer | null = null;
  private playRate: number = 1.0;
  private modelReady: boolean = false;
  private clipAction: any;
  // rayster pick

  // texture2d
  // private depthStep: number = 0.4;
  private texture2dMesh: THREE.Mesh | null = null;
  // private preRenderCallbackFunctions: Array<preRenderCallbackFunctionType> = [];
  // private preRenderCallbackFunctions: preRenderCallbackFunctionType;
  // private sort: boolean = true; //default ascending order

  constructor(
    container: HTMLDivElement,
    renderer: THREE.WebGLRenderer,
    alpha?: boolean
  ) {
    super(container, renderer, alpha);
    this.controls = new Copper3dTrackballControls(
      this.camera,
      this.renderer.domElement
    );
    window.addEventListener("resize", this.onWindowResize, false);
  }

  loadGltf(url: string, callback?: (content: THREE.Group) => void) {
    const loader = copperGltfLoader(this.renderer);

    loader.load(
      url,
      (gltf: GLTF) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        this.controls.maxDistance = size * 10;
        gltf.scene.position.x += gltf.scene.position.x - center.x;
        gltf.scene.position.y += gltf.scene.position.y - center.y;
        gltf.scene.position.z += gltf.scene.position.z - center.z;

        if (!this.cameraPositionFlag) {
          this.camera.position.copy(center);
          this.camera.position.x += size / 2.0;
          this.camera.position.y += size / 5.0;
          this.camera.position.z += size / 2.0;
          this.camera.lookAt(center);
          this.viewPoint = this.setViewPoint(
            this.camera as THREE.PerspectiveCamera,
            [center.x, center.y, center.z]
          );
        }
        this.mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((a: THREE.AnimationClip, index: number) => {
          if (index === 0) this.clipAction = this.mixer?.clipAction(a).play();
          else this.mixer?.clipAction(a).play();
        });
        this.content = gltf.scene;
        this.exportContent.copy(gltf.scene);
        this.exportContent.animations = gltf.animations;
        this.scene.add(gltf.scene);
        this.modelReady = true;
        callback && callback(gltf.scene);
      },
      (error) => {
        // console.log(error);
      }
    );
  }
  // loadOBJ(url: string, callback?: (mesh: THREE.Group) => void) {
  //   objLoader.load(
  //     url,
  //     (obj) => {
  //       obj.traverse((child) => {
  //         if ((child as THREE.Mesh).isMesh) {
  //           // (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
  //           //   side: THREE.DoubleSide,
  //           //   color: 0xffffff,
  //           // });
  //           // ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).color =
  //           //   new THREE.Color(0xffffff);
  //         }
  //       });
  //       const box = new THREE.Box3().setFromObject(obj);
  //       const size = box.getSize(new THREE.Vector3()).length();
  //       const center = box.getCenter(new THREE.Vector3());

  //       this.controls.maxDistance = size * 10;
  //       obj.position.x += obj.position.x - center.x;
  //       obj.position.y += obj.position.y - center.y;
  //       obj.position.z += obj.position.z - center.z;

  //       if (!this.cameraPositionFlag) {
  //         this.camera.position.copy(center);
  //         this.camera.position.x += size / 2.0;
  //         this.camera.position.y += size / 5.0;
  //         this.camera.position.z += size / 2.0;
  //         this.camera.lookAt(center);
  //         this.viewPoint = this.setViewPoint(
  //           this.camera as THREE.PerspectiveCamera,
  //           [center.x, center.y, center.z]
  //         );
  //       }
  //       this.scene.add(obj);
  //       !!callback && callback(obj);
  //     }, // called when loading is in progresses
  //     (xhr: any) => {
  //       console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //     },
  //     // called when loading has errors
  //     (error: any) => {
  //       console.log("An error happened");
  //     }
  //   );
  // }

  loadVtk(url: string) {
    copperVtkLoader(url, this.scene, this.content);
  }

  loadVtks(models: Array<vtkModels>) {
    let count = 0;
    let { vtkLoader } = copperMultipleVtk();

    const group = new THREE.Group();

    const finishInterval = setInterval(() => {
      if (count === models.length) {
        this.scene.add(this.exportContent);

        this.mixer = new THREE.AnimationMixer(group);
        this.exportContent.animations.forEach((clip) => {
          const action = this.mixer?.clipAction(clip);
          (action as THREE.AnimationAction).timeScale = 3;
          (action as THREE.AnimationAction).play();
        });

        this.modelReady = true;
        clearInterval(finishInterval);
      }
    }, 100);

    models.forEach((model) => {
      const geometries: Array<THREE.BufferGeometry> = [];

      model.urls.forEach((url, index) => {
        vtkLoader.load(url, (geometry) => {
          geometry.center();
          geometry.computeVertexNormals();
          geometry.name = index.toString();
          geometries.push(geometry);
          if (geometries.length === model.urls.length) {
            // sort the vtks by index order
            geometries.sort(
              (a: THREE.BufferGeometry, b: THREE.BufferGeometry) => {
                if (this.sort) {
                  return parseInt(a.name) - parseInt(b.name);
                } else {
                  return parseInt(b.name) - parseInt(a.name);
                }
              }
            );
            finishLoad(geometries, model);
            count += 1;
          }
        });
      });
    });

    const finishLoad = (
      geometries: Array<THREE.BufferGeometry>,
      model: vtkModels
    ) => {
      let { vtkmaterial } = copperMultipleVtk(model.opts);
      let geometry = geometries[0];
      const position = geometry.attributes.position;
      geometries.forEach((child, index) => {
        if (index === 0) {
          geometry = child;
          geometry.morphAttributes.position = [];
        } else {
          // if (index == 1) {
          //   geometry.morphAttributes.position.push(position);
          // }
          // if (index == 6) {
          //   geometry.morphAttributes.position.push(child.attributes.position);
          // }
          // if (index == 7) {
          //   geometry.morphAttributes.position.push(position);
          // }
          geometry.morphAttributes.position.push(child.attributes.position);
        }
      });
      const mesh = new THREE.Mesh(geometry, vtkmaterial);
      mesh.scale.multiplyScalar(0.1);

      group.add(mesh);
      this.exportContent.add(group);

      mesh.morphTargetInfluences = [];
      mesh.name = model.name;

      let j = 0;
      let tracks = [];
      let duration = geometries.length - 1;
      // let duration = 5;
      for (let i = 0; i < duration; i++) {
        const track = new THREE.KeyframeTrack(
          `${mesh.name}.morphTargetInfluences[${i}]`,
          [j, j + 1, j + 2],
          [0, 1, 0]
        );
        tracks.push(track);
        j = j + 2;
      }
      const clip = new THREE.AnimationClip(
        `copper3d_heart_morph_${mesh.name}`,
        duration,
        tracks
      );
      this.exportContent.animations.push(clip);
    };
  }

  // texture2d
  texture2d(url: string) {
    createTexture2D_Zip(url, this.scene);

    const textureInterval = setInterval(() => {
      this.scene.children.forEach((child) => {
        if ((child as THREE.Mesh).isMesh) {
          if (child.name === "texture2d_mesh_zip") {
            this.texture2dMesh = child as THREE.Mesh;

            const render_texture2d = () => {
              if (this.texture2dMesh) {
                let value = (this.texture2dMesh.material as any).uniforms[
                  "depth"
                ].value;

                value += this.depthStep;
                if (value > 109.0 || value < 0.0) {
                  if (value > 1.0) value = 109.0 * 2.0 - value;
                  if (value < 0.0) value = -value;

                  this.depthStep = -this.depthStep;
                }

                (this.texture2dMesh.material as any).uniforms["depth"].value =
                  value;
              }
            };
            this.addPreRenderCallbackFunction(render_texture2d);
          }
        }
      });
      if (this.texture2dMesh?.name === "texture2d_mesh_zip") {
        clearInterval(textureInterval);
      }
    }, 500);
  }

  getPlayRate() {
    return this.playRate;
  }

  setPlayRate(playRate: number) {
    this.playRate = playRate;
  }

  setModelPosition(
    model: THREE.Group | THREE.Mesh,
    position: { x?: number; y?: number; z?: number }
  ) {
    if (position.x) model.position.x = position.x;
    if (position.y) model.position.y = position.y;
    if (position.z) model.position.z = position.z;
  }

  resetView() {
    (this.controls as Copper3dTrackballControls).reset();
    this.updateCamera(this.viewPoint);
  }

  updateCamera(viewpoint: CameraViewPoint) {
    this.cameraPositionFlag = true;
    this.copperControl.updateCameraViewPoint(viewpoint);
  }

  getCurrentTime() {
    let currentTime = 0;
    if (this.clipAction) {
      currentTime = this.clipAction.time / this.clipAction._clip.duration;
    }
    return currentTime;
  }

  getCurrentMixer() {
    return this.mixer;
  }

  render() {
    this.controls.update();

    if (this.modelReady) {
      this.mixer && this.mixer.update(this.clock.getDelta() * this.playRate);
    }

    Object.values(this.preRenderCallbackFunctions.cache).forEach((item) => {
      item && item.call(null);
    });

    if (this.subDiv && this.subCamera && this.subRender) {
      this.subCamera.aspect =
        this.subDiv.clientWidth / this.subDiv.clientHeight;
      this.subCamera.updateProjectionMatrix();
      this.subRender.setSize(this.subDiv.clientWidth, this.subDiv.clientHeight);
      this.subCamera.position.copy(this.camera.position);
      this.subCamera.lookAt(this.subScene.position);
      this.subRender.render(this.subScene, this.subCamera);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
