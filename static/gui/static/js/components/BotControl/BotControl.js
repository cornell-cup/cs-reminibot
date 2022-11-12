import React, { useState, useEffect, useRef } from "react";

import AddBot from "./SetupBot/AddBot.js";
import MovementControls from "./MovementControl/MovementControl.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import InformationBoxModal from "../utils/InformationBoxModal.js";
import { INFOBOXTYPE, INFOBOXID, INFO_ICON } from "../utils/Constants.js";
library.add(faInfoCircle);
import UltimateGridview from "../Vision/UltimateGridview.js";


function BotControl({
  selectedBotName,
  setSelectedBotName,
  selectedBotStyle,
  setSelectedBotStyle,
  activeMicComponent,
  setActiveMicComponent,
  botVoiceControlMic,
  setBotVoiceControlMic }) {
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
            setActiveMicComponent={setActiveMicComponent}
            activeMicComponent={activeMicComponent}
            botVoiceControlMic={botVoiceControlMic}
            setBotVoiceControlMic={setBotVoiceControlMic}
          />
        </div>
        <br />
        <div className="row">
          <div className="control-option">
            {/* <div id="component_view" className="box"> */}
            <div className="mb-3 d-flex">
              <h3 className="small-title">
                Vision
                <span style={{ leftMargin: "0.5em" }}> </span>
                <input
                  className="info-box"
                  type="image"
                  data-toggle="modal"
                  data-target={"#" + INFOBOXID.VISION}
                  src={INFO_ICON}
                  width="18"
                  height="18"
                />
              </h3>
            </div>
            <UltimateGridview
              view_width={520}
              view_height={520}
              world_width={300}
              world_height={300}
              defaultEnabled={false}
              experimentalFeaturesEnabled={true} />
            < InformationBoxModal type={INFOBOXTYPE.VISION} />
          </div >
        </div>
      </div>

    </div>
  );
}

export default BotControl;
