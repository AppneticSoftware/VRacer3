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
        self.startScreen.joinGame();
      } else {
        console.log("Joining is not allowed");
        alert("You are not allowed to join this room. Please try another one.");
      }
    });
  }

  joinRoom(roomName) {
    const self = this;
    this.socket.emit("joinRoom", roomName);

    //NACHFRAGEN: Warum wird dieses Console Log nicht geprintet?
    // console.log("HALLO FROM EMITSOMETHING");
  }
}

export { Communication };
