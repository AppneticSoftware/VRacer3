import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { CanvasUI } from "../../libs/CanvasUI.js";
import { LoadingBar } from "../../libs/LoadingBar.js";
import { VRButton } from "../../libs/three/jsm/VRButton.js";
import { XRControllerModelFactory } from "../../libs/three/jsm/XRControllerModelFactory.js";
import { GameConstructor } from "./gameConstructor.js";
import { OrbitControls } from "../../libs/three/jsm/OrbitControls.js";
import { Communication } from "./communication.js";
import { Stats } from "../../libs/stats.module.js";
import { GameController } from "./steering.js";

class StartScreen {
  constructor() {
    this.startScreenIdentifier = "startScreen";
    this.clock = new THREE.Clock();
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
    this.scene.background = new THREE.Color(0xc9e9f6);

    const ambient = new THREE.HemisphereLight(0xc9e9f6, 0xbbbbff, 0.5);
    this.addObjectToScene(ambient, this.startScreenIdentifier);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 100, 50);
    this.addObjectToScene(light, this.startScreenIdentifier);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();
    this.stats = new Stats();

    this.loadingBar = new LoadingBar();

    this.loadGLTF(
      "Stadium.glb",
      [-181.5, 0, 130],
      [1, 1, 1],
      this.startScreenIdentifier
    );

    this.setupVRButton();
    this.setupCameraAndUI();

    // this.communication.emitSomething("Hello From StartScreen 2");

    window.addEventListener("resize", this.resize.bind(this));
  }

  startSocketCommunication() {
    this.communication = new Communication(this);
    this.communication.startCommunication();
  }

  testOrbisControlls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, -5);
    this.controls.update();
  }

  //TODO: REFACTOR (Var Input)
  loadGLTF(nameOfFile, pos = [3], scale = [3], scriptID) {
    const loader = new GLTFLoader().setPath("../../Assets/");
    const self = this;
    this.loadingBar.visible = true;
    console.log("NEW MODEL");
    // Load a glTF resource
    loader.load(
      // resource URL
      nameOfFile,
      // called when the resource is loaded
      function (gltf) {
        self.model = gltf.scene;
        self.model.position.set(pos[0], pos[1], pos[2]);
        self.model.scale.set(scale[0], scale[1], scale[2]);

        self.addObjectToScene(self.model, scriptID);

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

  setObjectWithName_Invisible(name) {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name == name) {
        this.scene.children[i].visible = false;
      }
    }
  }

  setObjectWithName_Visible(name) {
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
        this.startSocketCommunication();
      }
      this.ui.update();

      if (this.controllers && this.dolly.visible) {
        const self = this;
        this.controllers.forEach((controller) => {
          self.handleController(controller);
        });
      }

      if (this.gameController != null) {
        const dt = this.clock.getDelta();
        if (this.elapsedTime === undefined) this.elapsedTime = 0;
        this.elapsedTime += dt;
        if (this.elapsedTime > 0.3) {
          this.gameController.updateGamepadState();
          this.elapsedTime = 0;
        }
      }
    } else {
      this.stats.update();
    }
    // console.log(this.communication.roomsMemberCounterArray);
    this.renderer.render(this.scene, this.camera);
  }

  setupVRButton() {
    this.renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(this.renderer));
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  renderFunc() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  setupCameraAndUI() {
    this.dolly = new THREE.Object3D();
    this.dolly.position.set(0, 65, 0);
    this.dolly.rotation.x = -(30 * Math.PI) / 180;
    this.addCameraToDolly();
    this.controllers = this.setupControllers();
    this.addObjectToScene(this.dolly, this.startScreenIdentifier);
    // this.addObjectToScene(this.dolly);
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  addCameraToDolly() {
    this.dolly.add(this.camera);
  }

  removeCameraFromDolly() {
    this.dolly.remove(this.camera);
  }

  setupControllers() {
    const controllers = [];
    const controllerModelFactory = new XRControllerModelFactory();

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    const line = new THREE.Line(geometry);
    line.scale.z = 100;

    for (let index = 0; index < 2; index++) {
      // controller
      const controller = this.renderer.xr.getController(index);
      this.dolly.add(controller);
      const controllerGrip = this.renderer.xr.getControllerGrip(index);
      controllerGrip.add(
        controllerModelFactory.createControllerModel(controllerGrip)
      );
      controllers.push(controller);
      controller.add(line.clone());
      this.dolly.add(controllerGrip);
    }
    return controllers;
  }

  handleController(controller) {
    controller.children[0].scale.z = 100;

    this.workingMatrix.identity().extractRotation(controller.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.workingMatrix);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      controller.children[0].scale.z = intersects[0].distance;
    }
  }

  createUIForUserInteraction() {
    this.createUI();
    this.ui.update();
    this.ui.mesh.position.set(0, 65, -2);
    this.ui.mesh.rotation.x = -(45 * Math.PI) / 180;
    // this.addObjectToScene(this.ui.mesh, this.startScreenIdentifier);
    this.addObjectToScene(this.ui.mesh, this.startScreenIdentifier);
    console.log(this);
  }

  joinGame(callback) {
    this.setObjectWithName_Invisible(this.startScreenIdentifier);
    this.removeCameraFromDolly();
    this.gameController = new GameController(this);
    this.gameConstructor = new GameConstructor(this);
    if (typeof callback == "function") callback();
  }

  //TODO: REFACTOR - NOTWENDIG?
  askToJoinGame(roomName) {
    //func to join room of name "roomName"
    this.communication.joinRoom(roomName);
  }

  showErrorMsg(msg) {
    console.log("Error: " + msg);
    this.ui.updateElement("errorMsg", msg);
    this.ui.update();
  }

  createUI() {
    const self = this;

    function onJoinRoomOne() {
      self.askToJoinGame("roomOne");
    }

    function onJoinRoomTwo() {
      self.askToJoinGame("roomTwo");
    }

    function onJoinRoomThree() {
      self.askToJoinGame("roomThree");
    }

    const config = {
      header: {
        type: "text",
        position: { top: 0 },
        paddingTop: 30,
        height: 70,
        textAlign: "center",
      },
      subheader: {
        type: "text",
        position: { top: 70 },
        height: 40,
        padding: 15,
        textAlign: "center",
        fontSize: 20,
      },
      footer: {
        type: "text",
        position: { bottom: 0 },
        paddingTop: 30,
        height: 70,
        fontSize: 19,
        textAlign: "center",
      },
      errorMsg: {
        type: "text",
        position: { bottom: 70 },
        paddingTop: 30,
        height: 70,
        fontSize: 19,
        fontColor: "#FF0000",
        textAlign: "center",
      },
      roomOne: {
        type: "text",
        position: { top: 140, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        width: 250,
        textAlign: "right",
      },
      joinBtnOne: {
        type: "button",
        position: { top: 150, right: 100 },
        width: 100,
        height: 25,
        fontSize: 20,
        padding: 10,
        fontColor: "#fff",
        backgroundColor: "#1bf",
        hover: "#3df",
        onSelect: onJoinRoomOne,
      },
      roomTwo: {
        type: "text",
        position: { top: 190, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        width: 250,
        textAlign: "right",
      },
      joinBtnTwo: {
        type: "button",
        position: { top: 200, right: 100 },
        width: 100,
        height: 25,
        fontSize: 20,
        padding: 10,
        fontColor: "#fff",
        backgroundColor: "#1bf",
        hover: "#3df",
        onSelect: onJoinRoomTwo,
      },
      roomThree: {
        type: "text",
        position: { top: 240, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        width: 250,
        textAlign: "right",
      },
      joinBtnThree: {
        type: "button",
        position: { top: 250, right: 100 },
        width: 100,
        height: 25,
        fontSize: 20,
        padding: 10,
        fontColor: "#fff",
        backgroundColor: "#1bf",
        hover: "#3df",
        onSelect: onJoinRoomThree,
      },
      renderer: this.renderer,
    };
    const content = {
      header: "Welcome to VRacer3",
      subheader: "join one of the following rooms:",
      //main: "the following rooms are available:",
      //@Herr Roessler - bitte im Code lassen, damit die App mehr Downloads erhält :) Herzlichen Dnak
      //Natürlich sollten die Studis das Spiel erst nach der VL runterladen ...
      footer: 'Download "Papermade" - for iOS and Android!',
      roomOne: "Room 1 (0/4)",
      joinBtnOne: "Join",
      roomTwo: "Room 2 (0/4)",
      joinBtnTwo: "Join",
      roomThree: "Room 3 (0/4)",
      joinBtnThree: "Join",
      errorMsg: "",
    };
    this.ui = new CanvasUI(content, config);
  }

  updateRoomNumbers(roomNumbers) {
    const self = this;
    self.ui.updateElement("roomOne", "Room 1 (" + roomNumbers[0] + "/4)");
    self.ui.updateElement("roomTwo", "Room 2 (" + roomNumbers[1] + "/4)");
    self.ui.updateElement("roomThree", "Room 3 (" + roomNumbers[2] + "/4)");
    self.ui.update();
  }
}

export { StartScreen };
