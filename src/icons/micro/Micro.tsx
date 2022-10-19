import React from "react";
import { IMicroProps } from "../../types/micro";
import cl from "./Micro.module.css"

const Micro: React.FC<IMicroProps> = ({ bg }) => {
    return (
        <div className={cl.micro}>
            <div
                className={cl.one}
                style={{
                    background: bg
                }}
            />

            <div
                className={cl.two}
                style={{
                    borderTop: `3px solid ${bg}`,
                    borderLeft: `3px solid ${bg}`,
                    borderRight: `3px solid ${bg}`
                }}
            />

            <div
                className={cl.three}
                style={{
                    background: bg
                }}
            />
        </div>
    )
}

export { Micro }