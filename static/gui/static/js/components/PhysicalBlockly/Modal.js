import React from "react"
import "./modal.css"

class Modal extends React.Component{

    render(){
        return(
            <div class="modal" id="modal1">
                <div class="modal-dialog">
                    <header class="modal-header">
                    ...
                    <button class="close-modal" aria-label="close modal" data-close>✕</button>
                    </header>
                    <section class="modal-content">...</section>
                    <footer class="modal-footer">...</footer>
                </div>
            </div>
        )
    }
}
export default Modal;