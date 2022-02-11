import React, { useState, useEffect, useRef } from 'react';

import AddBot from './SetupBot/AddBot.js';
import MovementControls from './MovementControl/MovementControl.js';
import GridView from './gridview.js';

function BotControl({ selectedBotName, setSelectedBotName, selectedBotStyle, setSelectedBotStyle }) {
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
          <GridView />
        </div>
      </div>
    </div>

  )
}

export default BotControl;