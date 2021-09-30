import * as THREE from "../../libs/three/three.module.js";
import { LoadingBar } from "../../libs/LoadingBar.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";

class GameConstructor {
  constructor(startScreen) {
    //damit man alle Objekte aus der Scene deaktivieren kann
    this.gameConstructorIdentifier = "gameConstructor";
    this.startScreen = startScreen;
    this.assetArray = [
      ["Racetrack2.glb", [110, 0, 0], [5, 5, 5]],
      ["blueBike.glb", [-41, 0, -300], [550, 550, 550]],
      ["greenBike.glb", [-19, 0, -300], [550, 550, 550]],
      ["redBike.glb", [5, 0, -300], [550, 550, 550]],
      ["yellowBike.glb", [27, 0, -300], [550, 550, 550]],
    ];

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
    startScreen.addObjectToScene(ambient, this.gameConstructorIdentifier);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0.2, 1, 1);
    startScreen.addObjectToScene(light, this.gameConstructorIdentifier);

    this.loadingBar = new LoadingBar();

    this.loadRaceTrack();
    // this.startScreen.communication.userSuccessfullyJoined(true);
  }

  //---------------------------------------------------------------------------------

  setupCameraAndUI() {
    this.cameraDolly = new THREE.Object3D();
    this.cameraDolly.position.set(0, 13, 0);
    this.cameraDolly.rotation.x = (15 * Math.PI) / 180;
    this.cameraDolly.rotation.y = -(180 * Math.PI) / 180;
    this.cameraDolly.add(this.startScreen.camera);
    // this.addObjectToStartScreenScene(this.cameraDolly);
    // this.startScreen.renderFunc();
  }

  loadGLTF_ToScene(nameOfFile, pos = [3], scale = [3], nameOfAsset) {
    const loader = new GLTFLoader().setPath("../../Assets/");
    const self = this;
    this.loadingBar.visible = true;
    // Load a glTF resource
    return loader.load(
      // resource URL
      nameOfFile,
      // called when the resource is loaded
      function (gltf) {
        const model = gltf.scene;
        model.position.set(pos[0], pos[1], pos[2]);
        model.scale.set(scale[0], scale[1], scale[2]);
        self.addObjectToStartScreenScene(model, nameOfAsset);
        self.loadingBar.visible = false;
        self.startScreen.renderFunc();
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

  loadGLTF_ToOtherObject(nameOfFile, scale = [3], nameOfAsset, otherObject) {
    const loader = new GLTFLoader().setPath("../../Assets/");
    const self = this;
    this.loadingBar.visible = true;
    // Load a glTF resource
    return loader.load(
      // resource URL
      nameOfFile,
      // called when the resource is loaded
      function (gltf) {
        const model = gltf.scene;
        // model.position.set(pos[0], pos[1], pos[2]);
        model.scale.set(scale[0], scale[1], scale[2]);
        model.name = nameOfAsset;
        otherObject.add(model);
        self.loadingBar.visible = false;
        self.startScreen.renderFunc();
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

  loadRaceTrack() {
    this.loadGLTF_ToScene(
      this.assetArray[0][0],
      this.assetArray[0][1],
      this.assetArray[0][2],
      this.gameConstructorIdentifier
    );
  }

  initPlayers(roomUserData, ownSocketId) {
    this.roomUserData = roomUserData;
    this.userID = ownSocketId;
    this.racerGroup = new THREE.Group();

    if (roomUserData == "AnErrorAppeared") {
      //TODO: EXIT FUNCTION
      console.log("An Error Appeared while trying to get Room User Data.");
    } else {
      for (let index = 0; index < roomUserData.length; index++) {
        if (roomUserData[index] == ownSocketId) {
          this.initOwnPlayerWithCamera(1 + index);
        } else if (roomUserData[index] != 0) {
          this.addNewPlayerToRacerGroup(1 + index, roomUserData[index]);
        }
      }
    }

    this.addObjectToStartScreenScene(this.racerGroup);
  }

  initOwnPlayerWithCamera(index) {
    this.setupCameraAndUI();
    this.raceDolly = new THREE.Object3D();
    this.loadGLTF_ToOtherObject(
      this.assetArray[index][0],
      this.assetArray[index][2],
      this.assetArray[index][0],
      this.raceDolly
    );
    const posBike = this.getPosVectorOfArray(this.assetArray[index][1]);
    this.raceDolly.position.x = posBike.x;
    this.raceDolly.position.y = posBike.y;
    this.raceDolly.position.z = posBike.z;
    this.raceDolly.add(this.cameraDolly);
    this.addObjectToStartScreenScene(this.raceDolly);
    this.startScreen.renderFunc();
  }

  addNewPlayerToRacerGroup(index, id) {
    this.loadGLTF_ToScene(
      this.assetArray[index][0],
      this.assetArray[index][1],
      this.assetArray[index][2],
      id
    );
  }

  removePlayerFromRacer(userID) {
    //REMOVE OF RACER QAD  - better https://newbedev.com/how-do-i-clear-three-js-scene
    const sceneChildren = this.startScreen.scene.children;
    for (let index = 0; index < sceneChildren.length; index++) {
      if (sceneChildren[index].name == userID) {
        this.startScreen.scene.remove(this.startScreen.scene.children[index]);
      }
    }
  }

  addNewPlayerToScene(userID) {
    if (this.isPlayerAlreadyInScene(userID) == false) {
      const amountOfPlayers = this.getAmountOfPlayers();
      this.addNewPlayerToRacerGroup(amountOfPlayers + 1, userID);
      this.roomUserData[amountOfPlayers] = userID;
      console.log(this.roomUserData);
    }
  }

  isPlayerAlreadyInScene(userID) {
    const sceneChildren = this.startScreen.scene.children;
    for (let index = 0; index < sceneChildren.length; index++) {
      if (sceneChildren[index].name == userID) {
        return true;
      }
    }
    return false;
  }

  addObjectToStartScreenScene(
    object,
    nameOfAsset = this.gameConstructorIdentifier
  ) {
    this.startScreen.addObjectToScene(object, nameOfAsset);
  }

  getPosVectorOfArray(array) {
    return new THREE.Vector3().fromArray(array);
  }

  getAmountOfPlayers() {
    let i = 0;
    for (let index = 0; index < this.roomUserData.length; index++) {
      if (this.roomUserData[index] != "0") {
        i++;
      }
    }
    return i;
  }
}

export { GameConstructor };
