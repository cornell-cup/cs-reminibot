import React, { useState, useEffect, useRef } from "react";

import AddBot from "./SetupBot/AddBot.js";
import MovementControls from "./MovementControl/MovementControl.js";
import GridView from "./gridview.js";
import VisionUserInterface from "./VisionUserInterface.js";

function BotControl({
  selectedBotName,
  setSelectedBotName,
  selectedBotStyle,
  setSelectedBotStyle,
}) {
  return (
    <div className="row">
      <div className="col-md">
        <AddBot
          selectedBotName={selectedBotName}
          setSelectedBotName={setSelectedBotName}
          selectedBotStyle={selectedBotStyle}
          setSelectedBotStyle={setSelectedBotStyle}
        />
      </div>

      <div className="col-md">
        {/* movement controls */}
        <div className="row">
          <MovementControls
            selectedBotName={selectedBotName}
            setSelectedBotName={setSelectedBotName}
            selectedBotStyle={selectedBotStyle}
            setSelectedBotStyle={setSelectedBotStyle}
          />
        </div>
        <br />
        <div className="row">
          <div className="col-10">
            <GridView />
          </div>


          <div className="col-2">
            <VisionUserInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BotControl;
