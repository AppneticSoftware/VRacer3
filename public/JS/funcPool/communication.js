class Communication {
  constructor(main) {
    this.socket = io();
    this.main = main;
    this.lobby = main.lobby;
    this.uiInstance = main.lobby.uiInstance;
    this.startCommunication();
  }
  startCommunication() {
    this.listenToConnect(this.socket);
    this.listenToLobbyUpdate(this.socket);
    this.listenToRoomPermission(this.socket);
    this.listenToRoomUserData(this.socket);
    this.listenToUserDisconnect(this.socket);
    this.listenToNewPlayerJoined(this.socket);
    this.listenToTest(this.socket);
  }

  //-----------------------------------------------------------------------
  //Socket Functions - Sender
  sendUserSuccessfullyJoined(isJoinedRoom) {
    this.socket.emit("joinConfirmation", isJoinedRoom, this.roomName);
  }

  sendJoinRoomRequest(roomName) {
    this.roomName = roomName;
    this.socket.emit("joinRoom", roomName);
    //NACHFRAGEN: Warum wird dieses Console Log nicht geprintet?
    // console.log("HALLO FROM EMITSOMETHING");
  }

  sendUserExitedGame(roomName) {
    this.socket.emit("userExit", this.socket.id, roomName);
    console.log("EXIT ");
  }

  //-----------------------------------------------------------------------
  //Socket Functions - Listener

  listenToConnect(socket) {
    socket.on("connect", function () {
      console.log("App connected");
    });
  }

  listenToLobbyUpdate(socket) {
    const self = this;
    socket.on("roomAvailability", function (roomUserCounter) {
      if (self.uiInstance == null) {
        self.uiInstance = self.main.lobby.uiInstance;
      } else {
        self.uiInstance.updateRoomNumbers(roomUserCounter);
      }
    });
  }

  listenToRoomPermission(socket) {
    const self = this;
    socket.on("roomPermission", function (isAllowed) {
      if (isAllowed == true) {
        self.main.joinGame(function callFunction() {
          self.sendUserSuccessfullyJoined(true);
        });
      } else {
        self.main.lobby.uiInstance.showErrorMsg(
          "You are not allowed to join this room. Please try another one."
        );
        self.sendUserSuccessfullyJoined(false);
      }
    });
  }

  listenToRoomUserData(socket) {
    const self = this;
    socket.on("roomUserData", function (roomUserData) {
      self.main.game.initPlayersAndSetupUI(roomUserData, socket.id);
    });
  }

  listenToUserDisconnect(socket) {
    const self = this;
    socket.on("userDisconnect", function (userID) {
      console.log(userID + " left the game.");
      self.main.game.removePlayerFromRacer(userID);
    });
  }

  listenToNewPlayerJoined(socket) {
    const self = this;
    socket.on("newPlayerJoined", function (userID) {
      if (self.socket.id != userID) {
        console.log("Add new Player to Scene: " + userID);
        self.main.game.addNewPlayerToScene(userID);
      }
    });
  }

  listenToTest(socket) {
    socket.on("test", function (msg) {
      console.log(msg);
    });
  }
  //-----------------------------------------------------------------------
  //Generall Functions
}

export { Communication };
