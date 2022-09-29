import React from "react";
import { IMyButtonProps } from "../../../types/myButton";
import cl from "./MyButton.module.css"

const MyButton: React.FC<IMyButtonProps> = ({width, height, color, bg, name}) => {
    return(
        <div 
            className={cl.button}
            style={{
                width: width,
                height: height,
                color: color,
                background: bg,
                lineHeight: height
            }}
        >
            {name}
        </div>
    )
}

export {MyButton}