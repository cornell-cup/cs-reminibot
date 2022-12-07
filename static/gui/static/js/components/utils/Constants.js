export const PortBoxModalText = "Click on the carrot to expand the ports menu. Choose port configurations for the bot.";
export const SetupBoxModalText = "Make sure that bot is on the same network and then click to search for available bots. When the right bot is selected, click on the Add Bot button. You will now be connected and able to communicate with the bot!";
export const VisionBoxModalText = "Overhead Vision System - work in progress";
export const ControlBoxModalText = "Click on any of the movement buttons to make the bot move in a specified direction or stop using the central button. Click on the Start Speech Recognition button to speak commands to the bot. Support available for movement commands by saying move followed by the direction."
export const AprilTagIdBoxModalText = "If you are adding a virtual object, leave this field empty. If you are registering a physical object, then enter the ID number of its AprilTag in this field and feel free to leave the X position, Y position, and Orientation fields empty if you would like."
export const INFOBOXTYPE = {
  PORT: 1,
  SETUP: 2,
  VISION: 3,
  CONTROL: 4,
  APRIL_TAG_ID: 5
};
export const INFOBOXID = {
  PORT: "PortBox",
  SETUP: "SetupBox",
  VISION: "VisionBox",
  CONTROL: "ControlBox",
  APRIL_TAG_ID: "APRIL_TAG_ID",
}
export const CARROT_COLLAPSED = "./static/img/carrot_orange_collapsed.png";
export const CARROT_EXPAND = "./static/img/carrot_orange_expand.png";
export const INFO_ICON = "./static/img/info_icon.png";
export const X_BTN = "./static/img/close_btn.png";
export const MIC_BTN = "./static/img/microphone-white.png";
export const MIC_BTNON = "./static/img/microphone-green.png";
export const ACT_MIC_CHATBOT = "cb_mic";
export const ACT_MIC_COMMAND = "bvc_mic";

export const commands = {
  "forward": "Minibot moves forward",
  "backward": "Minibot moves backwards",
  "left": "Minibot moves left",
  "right": "Minibot moves right",
  "stop": "Minibot stops",
  "previous" : "Run the last program"
};

// TODO write documentation
export function match_command(lst) {
  let command;
  let command_length = 0;

  var previousIdx = lst.indexOf("previous")
  var lastIdx = lst.indexOf("last")

  if (commands.hasOwnProperty(lst[lst.length - 2])) {
    command = lst[lst.length - 2];
    command_length = lst.lastIndexOf(command);
  }
  else if (previousIdx >= 0 || lastIdx >= 0) {
    // if the mic heard the word "previous" or "last" before the word "program"

    if (previousIdx >= 0 && lst.slice(previousIdx).indexOf("program") ||
    lastIdx >= 0 && lst.slice(lastIdx).indexOf("program")) {
      command = "previous"
      command_length = lst.lastIndexOf("program")
    }
  }
  return [command, command_length + 1]
}