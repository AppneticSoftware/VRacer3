import { StartScreen } from "./funcPool/startScreen.js";

window.onload = function () {
  const startScreen = new StartScreen();
  window.app = startScreen;
};
