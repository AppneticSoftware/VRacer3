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

    this.socket.on("roomConfirmed", function (roomName) {
      console.log("Room Confirmed from Server: " + roomName);
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
