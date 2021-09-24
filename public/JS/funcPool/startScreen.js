import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { OrbitControls } from "../../libs/three/jsm/OrbitControls.js";
import { LoadingBar } from "../../libs/LoadingBar.js";
import { VRButton } from "../../libs/three/jsm/VRButton.js";

class StartScreen {
  constructor() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    this.camera.position.set(0, 0, 0);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaaaaa);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
    this.scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0.2, 1, 1);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    container.appendChild(this.renderer.domElement);

    this.loadingBar = new LoadingBar();

    window.addEventListener("resize", this.resize.bind(this));
  }

  loadGLTF(nameOfFile) {
    const loader = new GLTFLoader().setPath("../../Assets/");
    const self = this;

    // Load a glTF resource
    loader.load(
      // resource URL
      nameOfFile,
      // called when the resource is loaded
      function (gltf) {
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        console.log(
          `min:${bbox.min.x.toFixed(2)},${bbox.min.y.toFixed(
            2
          )},${bbox.min.z.toFixed(2)} -  max:${bbox.max.x.toFixed(
            2
          )},${bbox.max.y.toFixed(2)},${bbox.max.z.toFixed(2)}`
        );

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.metalness = 0.2;
          }
        });
        self.stadium = gltf.scene;
        self.stadium.position.set(-180, 0, 200);
        self.stadium.scale.set(1, 1, 1);
        self.scene.add(gltf.scene);

        self.loadingBar.visible = false;

        self.renderer.setAnimationLoop(self.render.bind(self));
      },
      // called while loading is progressing
      function (xhr) {
        self.loadingBar.progress = xhr.loaded / xhr.total;
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      }
    );
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    // this.stadium.rotateY(0.01);
    this.renderer.render(this.scene, this.camera);
  }

  setupVRButton() {
    this.renderer.xr.enabled = true;
    this.setupCameraPositionInVRMode();
    document.body.appendChild(VRButton.createButton(this.renderer));
  }

  setupCameraPositionInVRMode() {
    this.dolly = new THREE.Object3D();
    this.dolly.position.set(1.5, 65, 70);
    this.dolly.rotation.x = -(30 * Math.PI) / 180;
    this.dolly.add(this.camera);
    this.scene.add(this.dolly);
  }
}

export { StartScreen };
