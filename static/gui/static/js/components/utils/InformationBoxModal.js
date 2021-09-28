import React, { useState, useEffect } from 'react';
import { INFOBOXTYPE } from './Constants';
import { PortBoxModalText, SetupBoxModalText, VisionBoxModalText } from './Constants';


const InformationBoxModal = (type) => {
    const [boxText, setBoxText] = useState("");

    useEffect(() => {
        if (type == INFOBOXTYPE.SETUP) {
            setBoxText(SetupBoxModalText);
        } else if (type == INFOBOXTYPE.PORT) {
            setBoxText(PortBoxModalText);
        } else {
            setBoxText(VisionBoxModalText);
        }
    }, type)


    return (
        <div className="modal" tabIndex="-1" id="InformationBox">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        <p>hello</p>
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