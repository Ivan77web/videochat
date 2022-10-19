import React from "react";
import { ICameraProps } from "../../types/camera";
import cl from "./Camera.module.css"

const Camera: React.FC<ICameraProps> = ({bg}) => {
    return(
        <div className={cl.camera}>
            <div 
                className={cl.body}
                style={{background: bg}}
            />

            <div 
                className={cl.header}
                style={{
                    borderRight: `20px solid ${bg}`
                }}
            />
        </div>
    )
}

export {Camera}