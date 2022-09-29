import React from "react";
import { IPhoneProps } from "../../types/Phone";
import cl from "./Phone.module.css"

const Phone: React.FC<IPhoneProps> = ({color}) => {
    return(
        <div className={cl.phone}
            style={{
                color: color
            }}
        >
        <div className="fa fa-phone"></div>
        </div>
    )
}

export {Phone}