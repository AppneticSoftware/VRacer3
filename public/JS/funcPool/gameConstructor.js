import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { OrbitControls } from "../../libs/three/jsm/OrbitControls.js";
import { LoadingBar } from "../../libs/LoadingBar.js";

class GameConstructor {
  constructor(startScreen) {
    startScreen.loadGLTF("Car.glb", [0, 0, -5], [5, 5, 5]);
    // const container = document.createElement("div");
    // document.body.appendChild(container);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.camera.position.set(0, 1, 10);
    startScreen.addToSceneAndSceneObjects(this.camera);
    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
    startScreen.addToSceneAndSceneObjects(ambient);
    // this.scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0.2, 1, 1);
    // this.scene.add(light);
    startScreen.addToSceneAndSceneObjects(light);

    // this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.physicallyCorrectLights = true;
    // container.appendChild(this.renderer.domElement);

    // this.loadingBar = new LoadingBar();

    // this.loadGLTF();

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.target.set(0, 0, 0);
    // this.controls.update();

    // window.addEventListener("resize", this.resize.bind(this));
  }
}

export { GameConstructor };
