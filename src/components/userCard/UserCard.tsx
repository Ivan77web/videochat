import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { Camera } from "../../icons/camera/Camera";
import { Phone } from "../../icons/phone/Phone";
import { IUserCardProps } from "../../types/userCard";
import cl from "./UserCard.module.css"

const UserCard: React.FC<IUserCardProps> = ({ user }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useTypedSelector(state => state.userData);

    const startCall = () => {
        dispatch({ type: "addMainId", payload: id })
        dispatch({ type: "addGuestId", payload: user.id })
        dispatch({ type: "typeIsOffer" })

        navigate("/call")
    }

    if (user.id === id) {
        return (
            <div />
        )
    } else {
        return (
            <div className={cl.card}>
                <div className={cl.avatar}>
                    <img className={cl.photo} src={user.photo} />
                </div>

                <div className={cl.name}>{user.name}</div>

                <div className={cl.cameraLogo} onClick={() => startCall()}>
                    <Camera bg="rgb(50, 34, 124)"/>
                </div>

                <div className={cl.phoneLogo}>
                    <Phone color="rgb(50, 34, 124)" />
                </div>
            </div>
        )
    }
}

export { UserCard }