import React from "react";
import "./modal.scss";


export default class Modal extends React.Component<{ lable: string, showModal: boolean, onClose: Function }>{
    constructor(props: any) {
        super(props);
    }

    render() {
        if (!this.props.showModal) {
            return null;
        }
        return (
            <div className="modal" id="modal">
                <h2>{this.props.lable}</h2>
                <div className="content">{this.props.children}</div>
                <div className="actions">
                    <button className="toggle-button"
                        onClick={() => { this.props.onClose(); }}
                    >
                        Close
        </button>
                </div>
            </div>
        );
    }
}