import * as THREE from "../../libs/three/three.module.js";
import { XRControllerModelFactory } from "../../libs/three/jsm/XRControllerModelFactory.js";
import {
  Constants as MotionControllerConstants,
  fetchProfile,
  MotionController,
} from "../../libs/three/jsm/motion-controllers.module.js";

const DEFAULT_PROFILES_PATH =
  "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles";
const DEFAULT_PROFILE = "generic-trigger";

class Controller {
  constructor(main) {
    this.controllerIdentifier = "controller";
    this.main = main;
    this.controllers = [];
    this.controllersGrid = [];

    this.raycaster = new THREE.Raycaster();
    this.workingMatrix = new THREE.Matrix4();
    // this.workingVector = new THREE.Vector3();

    this.setupControllers();
  }

  createButtonStatesRight(components) {
    const buttonStates = {};
    this.gamepadIndicesRight = components;

    Object.keys(components).forEach((key) => {
      if (key.indexOf("touchpad") != -1 || key.indexOf("thumbstick") != -1) {
        buttonStates[key] = { button: 0, xAxis: 0, yAxis: 0 };
      } else {
        buttonStates[key] = 0;
      }
    });

    // was ich nachher exportieren muss
    this.buttonStatesRight = buttonStates;
  }

  createButtonStatesLeft(components) {
    const buttonStates = {};
    this.gamepadIndicesLeft = components;

    Object.keys(components).forEach((key) => {
      if (key.indexOf("touchpad") != -1 || key.indexOf("thumbstick") != -1) {
        buttonStates[key] = { button: 0, xAxis: 0, yAxis: 0 };
      } else {
        buttonStates[key] = 0;
      }
    });

    // was ich nachher exportieren muss
    this.buttonStatesLeft = buttonStates;
  }

  updateGamepadStateRight() {
    const session = this.main.renderer.xr.getSession();

    const inputSource = session.inputSources[0];

    if (
      inputSource &&
      inputSource.gamepad &&
      this.gamepadIndicesRight &&
      this.buttonStatesRight
    ) {
      const gamepad = inputSource.gamepad;
      try {
        Object.entries(this.buttonStatesRight).forEach(([key, value]) => {
          const buttonIndex = this.gamepadIndicesRight[key].button;
          if (
            key.indexOf("touchpad") != -1 ||
            key.indexOf("thumbstick") != -1
          ) {
            const xAxisIndex = this.gamepadIndicesRight[key].xAxis;
            const yAxisIndex = this.gamepadIndicesRight[key].yAxis;
            this.buttonStatesRight[key].button =
              gamepad.buttons[buttonIndex].value;
            this.buttonStatesRight[key].xAxis =
              gamepad.axes[xAxisIndex].toFixed(2);
            this.buttonStatesRight[key].yAxis =
              gamepad.axes[yAxisIndex].toFixed(2);
          } else {
            this.buttonStatesRight[key] = gamepad.buttons[buttonIndex].value;
          }
        });
      } catch (e) {
        console.warn(e);
      }
    }
  }

  updateGamepadStateLeft() {
    const session = this.main.renderer.xr.getSession();

    const inputSource = session.inputSources[0];

    if (
      inputSource &&
      inputSource.gamepad &&
      this.gamepadIndicesLeft &&
      this.buttonStatesLeft
    ) {
      const gamepad = inputSource.gamepad;
      try {
        Object.entries(this.buttonStatesLeft).forEach(([key, value]) => {
          const buttonIndex = this.gamepadIndicesLeft[key].button;
          if (
            key.indexOf("touchpad") != -1 ||
            key.indexOf("thumbstick") != -1
          ) {
            const xAxisIndex = this.gamepadIndicesLeft[key].xAxis;
            const yAxisIndex = this.gamepadIndicesLeft[key].yAxis;
            this.buttonStatesLeft[key].button =
              gamepad.buttons[buttonIndex].value;
            this.buttonStatesLeft[key].xAxis =
              gamepad.axes[xAxisIndex].toFixed(2);
            this.buttonStatesLeft[key].yAxis =
              gamepad.axes[yAxisIndex].toFixed(2);
          } else {
            this.buttonStatesLeft[key] = gamepad.buttons[buttonIndex].value;
          }
        });
      } catch (e) {
        console.warn(e);
      }
    }
  }

  setupControllers() {
    const self = this;
    const controllerModelFactory = new XRControllerModelFactory();
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);
    const line = new THREE.Line(geometry);
    line.scale.z = 100;

    function onConnected(event) {
      const info = {};
      fetchProfile(event.data, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE).then(
        ({ profile, assetPath }) => {
          // console.log(JSON.stringify(profile));
          info.name = profile.profileId;
          info.targetRayMode = event.data.targetRayMode;

          Object.entries(profile.layouts).forEach(([key, layout]) => {
            const components = {};
            Object.values(layout.components).forEach((component) => {
              components[component.rootNodeName] = component.gamepadIndices;
            });
            info[key] = components;
          });
          self.createButtonStatesRight(info.right);
          self.createButtonStatesLeft(info.left);

          //self.updateControllers(info);
        }
      );
    }

    for (let index = 0; index < 2; index++) {
      // controller
      const controller = this.main.renderer.xr.getController(index);
      controller.addEventListener("connected", onConnected);
      const controllerGrip = this.main.renderer.xr.getControllerGrip(index);
      controllerGrip.add(
        controllerModelFactory.createControllerModel(controllerGrip)
      );
      this.controllers[index] = controller;
      controller.add(line.clone());
      this.controllersGrid[index] = controllerGrip;
    }
  }

  handleController(controller) {
    controller.children[0].scale.z = 100;

    this.workingMatrix.identity().extractRotation(controller.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.workingMatrix);

    const intersects = this.raycaster.intersectObjects(
      this.main.scene.children
    );

    if (intersects.length > 0) {
      controller.children[0].scale.z = intersects[0].distance;
    }

    this.updateGamepadStateRight();
    this.updateGamepadStateLeft();
  }
}

export { Controller };
