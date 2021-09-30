class Communication {
  constructor(startScreen) {
    this.socket = io();
    this.startScreen = startScreen;
  }
  startCommunication() {
    const self = this;
    //PRÄSENTATION: SCOPE BEISPIEL
    // console.log(this);
    this.socket.on("connect", function () {
      console.log("App connect");
      // console.log(this);
    });

    this.socket.on("roomAvailability", function (roomUserCounter) {
      self.startScreen.updateRoomNumbers(roomUserCounter);
    });

    this.socket.on("roomPermission", function (isAllowed) {
      if (isAllowed == true) {
        console.log("Joining is allowed");
        self.startScreen.joinGame(function callFunction() {
          self.userSuccessfullyJoined(true);
        });
      } else {
        console.log("Joining is not allowed");
        self.startScreen.showErrorMsg(
          "You are not allowed to join this room. Please try another one."
        );
        self.userSuccessfullyJoined(false);
      }
    });

    this.socket.on("roomUserData", function (roomUserData) {
      console.log(roomUserData);
      self.startScreen.gameConstructor.initPlayers(
        roomUserData,
        self.socket.id
      );
    });

    this.socket.on("userDisconnect", function (userID) {
      console.log(userID + " left the game.");
      self.startScreen.gameConstructor.removePlayerFromRacer(userID);
    });

    this.socket.on("newPlayerJoined", function (userID) {
      console.log(self.socket.id);
      if (self.socket.id != userID) {
        console.log("Add new Player to Scene: " + userID);
        self.startScreen.gameConstructor.addNewPlayerToScene(userID);
        console.log("Player will not be added to scene: " + userID);
      } else {
      }
    });
  }

  joinRoom(roomName) {
    this.roomName = roomName;
    this.socket.emit("joinRoom", roomName);

    //NACHFRAGEN: Warum wird dieses Console Log nicht geprintet?
    // console.log("HALLO FROM EMITSOMETHING");
  }

  userSuccessfullyJoined(isJoinedRoom) {
    this.socket.emit("joinConfirmation", isJoinedRoom, this.roomName);
  }
}

export { Communication };
