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
export const ZIP_FILE_UPLOAD = "./static/img/zipfile.png";

export const commands = {
    "forward": "Minibot moves forward",
    "backward": "Minibot moves backwards",
    "left": "Minibot moves left",
    "right": "Minibot moves right",
    "stop": "Minibot stops",
    "previous": "Run the last program",
    "run": "Run a designated uploaded file"
};

/*
*   Parses commands for basic minibot movements (everything in commands list
    excepts "run").
    Returns: list - [command, command_index + 1]
*/
export function match_command(lst) {
    let command;
    let command_idx = 0;

    // recognize a command as run previous program if the user says "previous" or "last" at some point before "program"
    // i.e. recognizes "last program", "run previous program", "run my last program", etc
    var previousIdx = lst.indexOf("previous")
    var lastIdx = lst.indexOf("last")

    if (commands.hasOwnProperty(lst[lst.length - 2])) {
        command = lst[lst.length - 2];
        command_idx = lst.lastIndexOf(command);
    } else if (previousIdx >= 0 || lastIdx >= 0) {
        // if the mic heard the word "previous" or "last" before the word "program"
        if (previousIdx >= 0 && lst.slice(previousIdx).indexOf("program") ||
            lastIdx >= 0 && lst.slice(lastIdx).indexOf("program")) {
            command = "previous"
            command_idx = lst.lastIndexOf("program")
        }
    }
    // return command_idx + 1 so we know where to cut off the queue
    return [command, command_idx + 1]
}


/*
* Function takes care of command-parsing when the keyword heard is "run", 
* indicating that the user wants to run a uploaded script.
* Returns: list - [command, filename, command_index + 1]
* Current Assumption: files are named with a single word
*/
export function match_file_command(lst) {
    let command;
    let command_idx = 0;
    let filename = "";

    //assuming file is named with one word
    if (commands.hasOwnProperty(lst[lst.length - 3])) {
        command = lst[lst.length - 3];
        command_idx = lst.lastIndexOf(command + 1);
        filename = lst[lst.length - 2];
    }

    //return name of file to be run; assuming file is named with a single word
    return [command, filename, command_idx + 1]

}