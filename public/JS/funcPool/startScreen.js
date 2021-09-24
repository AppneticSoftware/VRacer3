import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { CanvasUI } from "../../libs/CanvasUI.js";
import { LoadingBar } from "../../libs/LoadingBar.js";
import { VRButton } from "../../libs/three/jsm/VRButton.js";
import { XRControllerModelFactory } from "../../libs/three/jsm/XRControllerModelFactory.js";
import { Game } from "./game.js";

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
        self.stadium.position.set(-181.5, 0, 130);
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
    if (this.renderer.xr.isPresenting) {
      if (this.ui == null) {
        this.createUIForUserInteraction();
      }
      this.ui.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  setupVRButton() {
    this.renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(this.renderer));
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  setupCameraAndUI() {
    this.dolly = new THREE.Object3D();
    this.dolly.position.set(0, 65, 0);
    this.dolly.rotation.x = -(30 * Math.PI) / 180;
    const controllerModelFactory = new XRControllerModelFactory();

    // controller
    this.controller = this.renderer.xr.getController(0);
    this.dolly.add(this.controller);

    this.controllerGrip = this.renderer.xr.getControllerGrip(0);
    this.controllerGrip.add(
      controllerModelFactory.createControllerModel(this.controllerGrip)
    );
    this.dolly.add(this.controllerGrip);

    // controller
    this.controller1 = this.renderer.xr.getController(1);
    this.dolly.add(this.controller1);

    this.controllerGrip1 = this.renderer.xr.getControllerGrip(1);
    this.controllerGrip1.add(
      controllerModelFactory.createControllerModel(this.controllerGrip1)
    );
    this.dolly.add(this.controllerGrip1);

    //
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    const line = new THREE.Line(geometry);
    line.name = "line";
    line.scale.z = 10;

    this.controller.add(line.clone());
    this.controller1.add(line.clone());

    this.dolly.add(this.camera);
    this.scene.add(this.dolly);
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  createUIForUserInteraction() {
    this.createUI();
    this.ui.updateElement("body", "Hello World");
    this.ui.update();
    this.ui.mesh.position.set(0, 65, -2);
    this.ui.mesh.rotation.x = -(45 * Math.PI) / 180;
    this.scene.add(this.ui.mesh);
  }

  createUI() {
    function onJoin() {
      const game = new Game();
      console.log("Join Pressed");
    }

    const config = {
      header: {
        type: "text",
        position: { top: 0 },
        paddingTop: 30,
        height: 70,
        textAlign: "center",
      },
      main: {
        type: "text",
        position: { top: 70 },
        height: 372, // default height is 512 so this is 512 - header height:70 - footer height:70
        backgroundColor: "#bbb",
        fontColor: "#000",
      },
      footer: {
        type: "text",
        position: { bottom: 0 },
        paddingTop: 30,
        height: 70,
        fontSize: 19,
        textAlign: "center",
      },
      joinBtn: {
        type: "button",
        position: { top: 150, right: 150 },
        width: 200,
        height: 52,
        fontColor: "#fff",
        backgroundColor: "#1bf",
        hover: "#3df",
        onSelect: onJoin,
      },
      renderer: this.renderer,
    };
    const content = {
      header: "Welcome to VRacer3",
      //main: "the following rooms are available:",
      //@Herr Roessler - bitte im Code lassen, damit die App mehr Downloads erhält :) Herzlichen Dnak
      //Natürlich sollten die Studis das Spiel erst nach der VL runterladen ...
      footer: 'Download "Papermade" - for iOS and Android!',
      joinBtn: "Join",
    };
    this.ui = new CanvasUI(content, config);
  }
}

export { StartScreen };
