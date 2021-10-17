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
    const config = {
      header: {
        type: "text",
        position: { top: 0 },
        paddingTop: 30,
        height: 70,
        textAlign: "center",
      },
      rowOne: {
        type: "text",
        position: { top: 70, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        textAlign: "center",
      },
      rowTwo: {
        type: "text",
        position: { top: 120, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        textAlign: "center",
      },
      rowThree: {
        type: "text",
        position: { top: 170, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        textAlign: "center",
      },
      rowFour: {
        type: "text",
        position: { top: 220, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        textAlign: "center",
      },
      rowFive: {
        type: "text",
        position: { top: 270, left: 20 },
        height: 40,
        padding: 18,
        fontSize: 20,
        textAlign: "center",
      },
      startMsg: {
        type: "text",
        position: { bottom: 140 },
        paddingTop: 30,
        height: 70,
        fontSize: 19,
        fontColor: "#25e712",
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
      footer: {
        type: "text",
        position: { bottom: 0 },
        paddingTop: 30,
        height: 70,
        textAlign: "center",
        fontSize: 19,
      },
    };

    const content = {
      header: "Welcome to " + this.parentClass.roomName,
      rowOne: "Controlls:",
      rowTwo: "",
      rowThree: "Move forward: Trigger",
      rowFour: "Steering: Joy-Stick ",
      rowFive: "Close UI: Press Joy-Stick ",
      startMsg: "Press 'B' to start the game",
      errorMsg: "",
      footer: 'Download "Papermade" - for iOS and Android!',
    };
    const ui = new CanvasUI(content, config);
    // ui.mesh.position.set(-40.8, 14.5, -297);
    ui.mesh.position.set(0, 0, 0);
    ui.mesh.rotation.y = -(180 * Math.PI) / 180;
    ui.mesh.rotation.x = -(5 * Math.PI) / 180;
    this.uiGameScreen = ui;
  }

  updateCounter(str) {
    this.uiGameScreen.updateElement("rowFour", str);
    this.uiGameScreen.update();
  }

  setupGameStartUI() {
    this.uiGameScreen.updateElement("header", "");
    this.uiGameScreen.updateElement("rowOne", "");
    this.uiGameScreen.updateElement("rowTwo", "Game will start in: ");
    this.uiGameScreen.updateElement("rowThree", "");
    this.uiGameScreen.updateElement("rowFour", "");
    this.uiGameScreen.updateElement("rowFive", "");
    this.uiGameScreen.updateElement("startMsg", "");
    this.uiGameScreen.updateElement("errorMsg", "UI will close automatically.");
    this.set_UI_Visible(true, false);
  }

  showWinnerUI(nameOfWinner) {
    this.uiGameScreen.updateElement("header", "Game Over");
    this.uiGameScreen.updateElement("rowOne", "");
    this.uiGameScreen.updateElement("rowTwo", "The Winner is");
    this.uiGameScreen.updateElement("rowThree", "");
    this.uiGameScreen.updateElement("rowFour", "nameOfWinner");
    this.uiGameScreen.updateElement("rowFive", "");
    this.uiGameScreen.updateElement(
      "startMsg",
      "Press 'B' to start the game again."
    );
    this.uiGameScreen.updateElement("errorMsg", "Press 'A' to exit the game");
    this.set_UI_Visible(true, false);
  }
}
export { UI };
