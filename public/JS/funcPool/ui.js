import { CanvasUI } from "../../libs/CanvasUI.js";

class UI {
  constructor(parentClass) {
    this.uiIdentifier = "ui";
    this.parentClass = parentClass;
  }

  //---------------------------------------------------------------------------------
  //Lobby UI

  setupLobbyUI() {
    this.initLobbyUI();
    this.uiLobbyScreen.update();
    this.uiLobbyScreen.mesh.position.set(0, 65, -2);
    this.uiLobbyScreen.mesh.rotation.x = -(45 * Math.PI) / 180;
    this.set_UI_Visible(false);
  }

  initLobbyUI() {
    const self = this;

    function onJoinRoomOne() {
      self.askToJoinGame("roomOne");
      //   console.log("ASKED TO JOIN ROOM ONE");
    }

    function onJoinRoomTwo() {
      self.askToJoinGame("roomTwo");
      //   console.log("ASKED TO JOIN ROOM TWO");
    }

    function onJoinRoomThree() {
      self.askToJoinGame("roomThree");
      //   console.log("ASKED TO JOIN ROOM THREE");
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
      renderer: this.parentClass.main.renderer,
    };
    const content = {
      header: "Welcome to VRacer3",
      subheader: "join one of the following rooms:",
      //main: "the following rooms are available:",
      //@Herr Roessler - bitte im Code lassen, damit die App mehr Downloads erhält :) Herzlichen Dnak
      //Natürlich sollten die Studis das Spiel erst nach der VL runterladen ...
      footer: 'Download "Papermade" - for iOS and Android!',
      roomOne: "Room 1 (-1/4)",
      joinBtnOne: "Join",
      roomTwo: "Room 2 (-1/4)",
      joinBtnTwo: "Join",
      roomThree: "Room 3 (-1/4)",
      joinBtnThree: "Join",
      errorMsg: "",
    };
    this.uiLobbyScreen = new CanvasUI(content, config);
  }

  set_UI_Visible(visible, lobbyScreen = true) {
    if (lobbyScreen) {
      this.uiLobbyScreen.visible = visible;
    } else {
      this.uiGameScreen.visible = visible;
    }
  }

  showErrorMsg(msg) {
    this.uiLobbyScreen.updateElement("errorMsg", msg);
    this.uiLobbyScreen.update();
  }

  updateRoomNumbers(roomNumbers) {
    const self = this;
    self.uiLobbyScreen.updateElement(
      "roomOne",
      "Room 1 (" + roomNumbers[0] + "/4)"
    );
    self.uiLobbyScreen.updateElement(
      "roomTwo",
      "Room 2 (" + roomNumbers[1] + "/4)"
    );
    self.uiLobbyScreen.updateElement(
      "roomThree",
      "Room 3 (" + roomNumbers[2] + "/4)"
    );
    self.uiLobbyScreen.update();
  }

  //TODO: REFACTOR - NOTWENDIG?
  askToJoinGame(roomName) {
    //func to join room of name "roomName"
    if (this.parentClass.lobbyActive == true) {
      this.parentClass.main.communication.sendJoinRoomRequest(roomName);
    }
  }

  //---------------------------------------------------------------------------------
  //Game UI

  setupGameUI() {
    console.log("UI CREATE");
    const config = {
      body: { type: "text", textAlign: "center" },
    };
    const ui = new CanvasUI({ body: "HELLO EXAMPLE" }, config);
    // ui.mesh.position.set(-40.8, 14.5, -297);
    ui.mesh.position.set(0, 0, 0);
    ui.mesh.rotation.y = -(180 * Math.PI) / 180;
    this.uiGameScreen = ui;
  }
}
export { UI };
