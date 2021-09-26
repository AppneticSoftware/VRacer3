import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { CanvasUI } from "../../libs/CanvasUI.js";
import { LoadingBar } from "../../libs/LoadingBar.js";
import { VRButton } from "../../libs/three/jsm/VRButton.js";
import { XRControllerModelFactory } from "../../libs/three/jsm/XRControllerModelFactory.js";
import { GameConstructor } from "./gameConstructor.js";

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
    this.camera.name = "NeueCam";

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

    this.loadGLTF("Stadium.glb", [-181.5, 0, 130], [1, 1, 1]);

    window.addEventListener("resize", this.resize.bind(this));
  }

  //TODO: REFACTOR (Var Input)
  loadGLTF(nameOfFile, pos = [3], scale = [3], fileParent) {
    const loader = new GLTFLoader().setPath("../../Assets/");
    const self = this;

    // Load a glTF resource
    loader.load(
      // resource URL
      nameOfFile,
      // called when the resource is loaded
      function (gltf) {
        self.model = gltf.scene;
        self.model.position.set(pos[0], pos[1], pos[2]);
        self.model.scale.set(scale[0], scale[1], scale[2]);

        self.addObjectToScene(self.model, fileParent);

        self.loadingBar.visible = false;
        self.renderer.setAnimationLoop(self.render.bind(self));
      },
      // called while loading is progressing
      function (xhr) {
        self.loadingBar.progress = xhr.loaded / xhr.total;
      },
      // called when loading has errors
      function (error) {
        console.log("LoadGLTF Function: " + error);
      }
    );
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addObjectToScene(newObject, name = "") {
    newObject.name = name;
    this.scene.add(newObject);
  }

  setObjectWithNameInvisible(name) {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name == name) {
        this.scene.children[i].visible = false;
      }
    }
  }

  setObjectWithNameVisible(name) {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name == name) {
        this.scene.children[i].visible = true;
      }
    }
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

  addCameraToDolly() {
    this.dolly.add(this.camera);
    console.log(this.camera.name);
  }

  removeCameraFromDolly() {
    this.dolly.remove(this.camera);
    console.log(this.dolly);
  }

  setupCameraAndUI() {
    this.dolly = new THREE.Object3D();
    this.dolly.position.set(0, 65, 0);
    this.dolly.rotation.x = -(30 * Math.PI) / 180;
    this.addCameraToDolly();
    this.setupControllers();
    this.scene.add(this.dolly);
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  setupControllers() {
    const controllerModelFactory = new XRControllerModelFactory();

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    const line = new THREE.Line(geometry);
    line.name = "line";
    line.scale.z = 10;

    for (let index = 0; index < 2; index++) {
      // controller
      controller = this.renderer.xr.getController(index);
      this.dolly.add(controller);

      controllerGrip = this.renderer.xr.getControllerGrip(index);
      controllerGrip.add(
        controllerModelFactory.createControllerModel(controllerGrip)
      );

      controller.add(line.clone());
      this.dolly.add(controllerGrip);
    }
  }

  createUIForUserInteraction() {
    this.createUI();
    this.ui.update();
    this.ui.mesh.position.set(0, 65, -2);
    this.ui.mesh.rotation.x = -(45 * Math.PI) / 180;
    this.scene.add(this.ui.mesh);
    // this.addToSceneAndSceneObjects(this.ui.mesh);
  }

  createUI() {
    const self = this;

    function onJoin() {
      self.removeAllSceneObjectsFromScene();
      // self.removeCameraFromDolly();
      const game = new GameConstructor(self);
    }

    const config = {
      header: {
        type: "text",
        position: { top: 0 },
        paddingTop: 30,
        height: 70,
        textAlign: "center",
      },
      // main: {
      //   type: "text",
      //   position: { top: 70 },
      //   height: 372, // default height is 512 so this is 512 - header height:70 - footer height:70
      //   backgroundColor: "#bbb",
      //   fontColor: "#000",
      // },
      footer: {
        type: "text",
        position: { bottom: 0 },
        paddingTop: 30,
        height: 70,
        fontSize: 19,
        textAlign: "center",
      },
      continue: {
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
      continue: "Join",
    };
    this.ui = new CanvasUI(content, config);
  }
}

export { StartScreen };
