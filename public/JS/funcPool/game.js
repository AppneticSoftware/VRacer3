import * as THREE from "../../libs/three/three.module.js";
import { GLTFLoader } from "../../libs/three/jsm/GLTFLoader.js";
import { UI } from "./ui.js";

class Game {
  constructor(main, roomName) {
    //damit man alle Objekte aus der Scene deaktivieren kann
    this.gameIdentifier = "gameScreen";
    this.main = main;
    this.roomName = roomName;
    this.gameActive = true;
    this.clock = new THREE.Clock();
    this.roundsClock = new THREE.Clock();
    this.collision = false;
    this.assetArray = [
      ["blueBike.glb", [-41, 0, -300], [550, 550, 550]],
      ["greenBike.glb", [-19, 0, -300], [550, 550, 550]],
      ["redBike.glb", [5, 0, -300], [550, 550, 550]],
      ["yellowBike.glb", [27, 0, -300], [550, 550, 550]],
      ["RaceTrack3.glb", [110, 0, 0], [5, 5, 5]],
    ];
    this.boarderArray = [
      [
        //links
        [35, 0, 0],
        [1, 50, 2000],
      ],
      [
        //vorne
        [0, 0, 815],
        [1000, 50, 1],
      ],
      [
        //hinten
        [0, 0, -735],
        [1000, 50, 1],
      ],
      [
        //rechts
        [-455, 0, 0],
        [1, 50, 2000],
      ],
      [
        //mitte
        [-210, 0, 105],
        [300, 50, 820],
      ],
      [
        //mitte-unten
        [-60, 0, -75],
        [5, 50, 1000],
      ],

      [
        //mitte-unten-rechts
        [-330, 0, -630],
        [320, 50, 400],
      ],
    ];

    this.uiVisible = true;

    this.maxSpeed = 15;
    this.maxTurningSpeed = 4;
    this.maxRotation = 0.2;
    this.maxRotationY = (3.6 * Math.PI) / 180;

    this.setupRaceTrackAsset();
    this.createColliders();
  }

  //----------------------------------------------------------------
  //Setup Functions

  setupRaceTrackAsset() {
    this.main.loadGLTF(
      this.assetArray[4][0],
      this.assetArray[4][1],
      this.assetArray[4][2],
      this.gameIdentifier
    );
  }

  setupCamera() {
    this.cameraDolly = new THREE.Object3D();
    this.cameraDolly.position.set(0, 13, 0);
    this.cameraDolly.rotation.x = (15 * Math.PI) / 180;
    this.cameraDolly.rotation.y = -(180 * Math.PI) / 180;
    this.addCameraToDolly();
  }

  setupGameUI() {
    if (this.uiInstance == null) {
      this.uiInstance = new UI(this);
      this.uiInstance.setupGameUI();
      this.gameUIDolly = new THREE.Object3D();
      this.gameUIDolly.add(this.uiInstance.uiGameScreen.mesh);
      this.changeVisibilityOfUI(this.uiVisible);
      this.gameUIDolly.position.set(0, 14.5, 2);
    }
  }

  //----------------------------------------------------------------
  //Generell Functions

  addBoarder(pos = [3], size = [3]) {
    const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const material = new THREE.MeshBasicMaterial({
      visible: false,
    });

    const box = new THREE.Mesh(geometry, material);
    box.position.set(pos[0], pos[1] / 2, pos[2]);
    this.main.addObjectToScene(box, this.gameIdentifier);
    this.colliders.push(box);
  }

  createColliders() {
    this.colliders = [];
    for (let index = 0; index < this.boarderArray.length; index++) {
      this.addBoarder(this.boarderArray[index][0], this.boarderArray[index][1]);
    }
    this.addRoundsCountingCollider();
  }

  addRoundsCountingCollider() {
    const geometry = new THREE.BoxGeometry(200, 50, 5);
    const material = new THREE.MeshBasicMaterial({
      visible: true,
    });

    this.roundCounter = new THREE.Mesh(geometry, material);
    this.roundCounter.position.set(19, 0, -200);
    this.main.addObjectToScene(this.roundCounter, this.gameIdentifier);
  }

  addCameraToDolly() {
    this.cameraDolly.add(this.main.camera);
  }

  removeCameraFromDolly() {
    this.cameraDolly.remove(this.main.camera);
  }

  getPosVectorOfArray(array) {
    return new THREE.Vector3().fromArray(array);
  }

  getFreeIndex() {
    for (let index = 0; index < this.roomUserData.length; index++) {
      if (this.roomUserData[index] == "0") {
        return index;
      }
    }
  }
  //REFACTOR MÖGLICH
  loadGLTF_ToOtherObject(nameOfFile, scale = [3], nameOfAsset, otherObject) {
    const loader = new GLTFLoader().setPath("../../Assets/");
    const self = this;
    this.main.loadingBar.visible = true;
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
        self.main.loadingBar.visible = false;
        self.main.exportRenderFunc();
      },
      // called while loading is progressing
      function (xhr) {
        self.main.loadingBar.progress = xhr.loaded / xhr.total;
      },
      // called when loading has errors
      function (error) {
        console.log("LoadGLTF Function: " + error);
      }
    );
  }

  setGameInActive() {
    console.log(this.main.scene.children);
    this.gameActive = false;
    this.main.setObjectWithName_Invisible(this.gameIdentifier);
    this.removeCameraFromDolly();
    this.removeAllPlayerFromRacer();
  }

  setGameActive(roomName) {
    this.gameActive = true;
    this.printWarnMsg("");
    this.roomName = roomName;
    this.main.setObjectWithName_Visible(this.gameIdentifier);
    this.addCameraToDolly();
    //zwecks getDelta - sonst wird meldung bei Exit nicht angezeigt
    this.clock = new THREE.Clock();
    console.log(this.main.scene.children);
  }

  updateControllerValues() {
    this.controllerValues = this.main.controller.buttonStatesRight;
    this.aButton = this.controllerValues.a_button;
    this.bButton = this.controllerValues.b_button;
    this.thumbRest = this.controllerValues.thumbrest;
    this.squeeze = this.controllerValues.xr_standard_squeeze;
    this.trigger = this.controllerValues.xr_standard_trigger;
    this.stickButton = this.controllerValues.xr_standard_thumbstick.button;
    this.xStick = this.controllerValues.xr_standard_thumbstick.xAxis;
    this.yStick = this.controllerValues.xr_standard_thumbstick.yAxis;
  }

  handleUpdatedValuesOfInput() {
    if (this.raceDolly) {
      this.handleRoundCounting();
      this.checkInputChange();
    }
  }

  checkInputChange() {
    if (this.aButton != 0) {
      //Exit game
      this.manageExitButtonPressed();
    }
    if (this.bButton != 0) {
      //Start game
      this.exitGameBtnPressed = false;
      this.elapsedTimeExit = 0;
      this.main.communication.sendUserVoteStartGame();
    }
    if (this.trigger != 0) {
      //Gas + vorwärts oder rückwärts
      this.changeRacerPosZ();
    }
    if (this.stickButton != 0) {
      //Show UI;
      this.manageUI_Visibility();
    }
    if (this.xStick != 0) {
      //Link bzw. Rechts
      // this.changeRacerRotationZ();
      this.changeRacerRotationY();
      this.changeRacerPosX();
    } else {
      this.raceDolly.children[0].rotation.z = 0;
      this.raceDolly.position.y = 0;
    }
  }

  manageUI_Visibility() {
    const dt = this.clock.getDelta();
    if (this.elapsedTimeUI === undefined) {
      this.elapsedTimeUI = 0;
    }
    this.elapsedTimeUI += dt;
    if (this.elapsedTimeUI > 0.9) {
      this.uiVisible = !this.uiVisible;
      this.elapsedTimeUI = 0;
    }
    this.changeVisibilityOfUI(this.uiVisible);
  }

  manageExitButtonPressed() {
    const dt = this.clock.getDelta();
    this.printWarnMsg("Exit Game? Y: Tab 'A' - N: Tab 'B'");
    this.exitGameBtnPressed = true;
    if (this.elapsedTimeExit === undefined) {
      this.elapsedTimeExit = 0;
    }
    this.elapsedTimeExit += dt;
    if (
      this.elapsedTimeExit > 1.2 &&
      this.exitGameBtnPressed == true &&
      this.uiInstance.uiGameScreen.visible == true
    ) {
      this.elapsedTimeExit = 0;
      this.exitGameBtnPressed = false;
      this.main.communication.sendUserExitedGame(this.roomName);
      this.main.backToLobby();
    }
  }

  getDirectionAndMaxSpeed() {
    if (this.yStick > 0.5) {
      return -this.maxSpeed * 0.1;
    } else {
      return this.maxSpeed;
    }
  }

  isSteeringRight() {
    if (this.xStick >= 0) {
      return false;
    } else {
      return true;
    }
  }

  getDrivingRotation() {
    //this.ystick == minus 1 => vorwärts

    if (this.xStick > 0) {
      return -1;
    } else {
      return 1;
    }
  }

  isCollidingZ() {
    const pos = this.raceDolly.position.clone();
    pos.y += 18;
    let dir = new THREE.Vector3();
    this.raceDolly.getWorldDirection(dir);
    if (this.getDirectionAndMaxSpeed() < 0) dir.negate();
    let raycaster = new THREE.Raycaster(pos, dir);
    const colliders = this.colliders;
    if (colliders !== undefined) {
      const intersect = raycaster.intersectObjects(colliders);
      if (intersect.length > 0) {
        if (intersect[0].distance < 15) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  isCollidingWithRoundsCounter() {
    const pos = this.raceDolly.position.clone();
    pos.y += 2;
    let dir = new THREE.Vector3();
    this.raceDolly.getWorldDirection(dir);
    let raycaster = new THREE.Raycaster(pos, dir);
    const intersect = raycaster.intersectObjects([this.roundCounter]);
    if (intersect.length > 0) {
      console.log(intersect[0].distance);
      if (intersect[0].distance < 15) {
        return true;
      } else {
        return false;
      }
    }
  }

  handleRoundCounting() {
    const dt = this.roundsClock.getDelta();
    if (this.isCollidingWithRoundsCounter() && dt > 12.0) {
      this.printWarnMsg(String(dt));
    }
  }
  changeRacerPosZ() {
    if (this.isCollidingZ() == false) {
      this.raceDolly.translateZ(this.trigger * this.getDirectionAndMaxSpeed());
    }
  }

  changeRacerRotationZ() {
    if (
      this.trigger != 0 &&
      this.raceDolly.children[0].rotation.z < 0.66 &&
      this.raceDolly.children[0].rotation.z > -0.66
    ) {
      this.raceDolly.children[0].rotation.z -= this.maxRotation * this.xStick;
    }
    this.raceDolly.position.y = 0;
  }

  changeRacerRotationY() {
    if (this.trigger != 0) {
      this.raceDolly.rotateY(this.maxRotationY * this.xStick * -1);
    }
  }

  isCollidingX() {
    const pos = this.raceDolly.position.clone();
    pos.y += 24;
    let dir = new THREE.Vector3();
    this.raceDolly.getWorldDirection(dir);
    if (this.isSteeringRight()) {
      dir.set(1, 0, 0);
    } else {
      dir.set(-1, 0, 0);
    }

    dir.applyMatrix4(this.raceDolly.matrix);
    dir.normalize();
    let raycaster = new THREE.Raycaster(pos, dir);

    const colliders = this.colliders;
    const intersect = raycaster.intersectObjects(colliders);
    if (intersect.length > 0) {
      if (intersect[0].distance < 20) {
        return true;
      } else {
        return false;
      }
    }
  }

  changeRacerPosX() {
    if (this.trigger != 0 && this.isCollidingX() == false) {
      const numb = this.maxTurningSpeed * this.xStick * -1 * this.trigger;
      this.raceDolly.translateX(numb);
    }
  }

  changeVisibilityOfUI(bool) {
    this.uiInstance.uiGameScreen.visible = bool;
  }

  updateGamePos() {
    //wird in Main aufgerufen
    //ADD UPDATE FOR OTHER PLAYERS
    this.updateOwnPlayerPos();
    this.main.communication.sendPositionOfOwnPlayer(
      this.raceDolly.position,
      this.raceDolly.rotation
    );
  }

  printWarnMsg(str) {
    this.uiInstance.uiGameScreen.updateElement("errorMsg", str);
    this.uiInstance.uiGameScreen.update();
  }

  //----------------------------------------------------------------
  //Player Functions

  updateOwnPlayerPos() {
    this.updateControllerValues();
    this.handleUpdatedValuesOfInput();
  }

  initPlayersAndSetupUI(roomUserData, ownSocketId) {
    this.roomUserData = roomUserData;
    this.userID = ownSocketId;
    this.racerGroup = new THREE.Group();

    if (roomUserData == "AnErrorAppeared") {
      //TODO: EXIT FUNCTION
      console.log("An Error Appeared while trying to get Room User Data.");
    } else {
      for (let index = 0; index < roomUserData.length; index++) {
        if (roomUserData[index] == ownSocketId) {
          this.initOwnPlayerWithCamera(index, ownSocketId);
        } else if (roomUserData[index] != 0) {
          this.addNewPlayerToRacerGroup(index, roomUserData[index]);
        }
      }
    }

    this.main.addObjectToScene(this.racerGroup, this.gameIdentifier);
  }

  updateOtherPlayersPosition(userID, pos, rot) {
    const sceneChildren = this.main.scene.children;
    for (let index = 0; index < sceneChildren.length; index++) {
      if (sceneChildren[index].name == userID) {
        console.log(this.main.scene.children[index]);
        this.main.scene.children[index].position.set(pos.x, pos.y, pos.z);
        // this.main.scene.children[index].rotation.set(rot.x, rot.y, rot.z);
        // console.log(quad);
        break;
      }
    }
  }

  initOwnPlayerWithCamera(index, socketId) {
    this.raceDolly = new THREE.Object3D();
    this.setupCamera();
    this.setupGameUI();
    this.loadGLTF_ToOtherObject(
      this.assetArray[index][0],
      this.assetArray[index][2],
      socketId,
      this.raceDolly
    );
    const posBike = this.getPosVectorOfArray(this.assetArray[index][1]);
    this.raceDolly.position.x = posBike.x;
    this.raceDolly.position.y = posBike.y;
    this.raceDolly.position.z = posBike.z;
    this.raceDolly.add(this.cameraDolly);
    this.raceDolly.add(this.gameUIDolly);
    this.main.addObjectToScene(this.raceDolly, this.gameIdentifier);
    this.main.exportRenderFunc();
  }

  addNewPlayerToRacerGroup(index, id) {
    this.main.loadGLTF(
      this.assetArray[index][0],
      this.assetArray[index][1],
      this.assetArray[index][2],
      id
    );
  }

  removePlayerFromRacer(userID) {
    //REMOVE OF RACER QAD  - better https://newbedev.com/how-do-i-clear-three-js-scene
    const sceneChildren = this.main.scene.children;
    for (let index = 0; index < sceneChildren.length; index++) {
      if (sceneChildren[index].name == userID) {
        this.main.scene.remove(sceneChildren[index]);
        this.deleteUserFromRoomUserData(userID);
      }
    }
  }

  removeAllPlayerFromRacer() {
    for (let index = 0; index < this.roomUserData.length; index++) {
      this.removePlayerFromRacer(this.roomUserData[index]);
    }
    this.main.scene.remove(this.raceDolly);
  }

  deleteUserFromRoomUserData(userId) {
    for (let index = 0; index < this.roomUserData.length; index++) {
      if (this.roomUserData[index] == userId) {
        this.roomUserData[index] = "0";
        break;
      }
    }
    console.log("RoomUserData after disconnect of user: " + this.roomUserData);
  }

  addNewPlayerToScene(userID) {
    if (this.isPlayerAlreadyInScene(userID) == false) {
      console.log(userID + " is joining the game.");
      const newPlayerIndex = this.getFreeIndex();

      this.addNewPlayerToRacerGroup(newPlayerIndex, userID);
      this.roomUserData[newPlayerIndex] = userID;
      console.log(this.roomUserData);
    } else {
      console.log(userID + " is already in the game.");
    }
  }

  isPlayerAlreadyInScene(userID) {
    const sceneChildren = this.main.scene.children;
    for (let index = 0; index < sceneChildren.length; index++) {
      if (sceneChildren[index].name == userID) {
        console.log("isPlayerAlreadyInScene : " + true);
        return true;
      }
    }
    return false;
  }
}

export { Game };
