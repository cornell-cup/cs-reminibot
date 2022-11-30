import React, { useState, useEffect } from 'react';
import { INFOBOXTYPE, INFOBOXID, AprilTagIdBoxModalText } from './Constants';
import { PortBoxModalText, SetupBoxModalText, VisionBoxModalText } from './Constants';


function InformationBoxModal({ type }) {
    const [boxText, setBoxText] = useState("");
    const [boxID, setBoxID] = useState("");

    useEffect(() => {
        if (type == INFOBOXTYPE.SETUP) {
            setBoxText(SetupBoxModalText);
            setBoxID(INFOBOXID.SETUP);
        } else if (type == INFOBOXTYPE.PORT) {
            setBoxText(PortBoxModalText);
            setBoxID(INFOBOXID.PORT);
        } else if (type == INFOBOXTYPE.VISION) {
            setBoxText(VisionBoxModalText);
            setBoxID(INFOBOXID.VISION);
        } else if (type == INFOBOXTYPE.APRIL_TAG_ID) {
            setBoxText(AprilTagIdBoxModalText);
            setBoxID(INFOBOXID.APRIL_TAG_ID);
        }
    }, [type])


    return (
        <div className="modal" tabIndex="-1" id={boxID}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        <p>{boxText}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="submit" value="submit" className="btn btn-primary" data-dismiss="modal">I got this!</button>
                    </div>
                </div>
            </div>
        </div>
    );

}
export default InformationBoxModal;