import React from "react";
import cl from "./Camera.module.css"

const Camera: React.FC = () => {
    return(
        <div className={cl.camera}>
            <div className={cl.body}/>
            <div className={cl.header}/>
        </div>
    )
}

export {Camera}