import React from "react";
import { IMyInputProps } from "../../../types/myInput";
import cl from "./MyInput.module.css"

const MyInput: React.FC<IMyInputProps> = ({width, height, placeholder, value, setValue}) => {

    const handleChange: React.ChangeEventHandler<HTMLInputElement>  = (e) => {
        setValue(e.target.value)
    }
    return(
        <input 
            className={cl.input}
            style={{
                width: width,
                height: height
            }}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
        />
    )
}

export {MyInput}