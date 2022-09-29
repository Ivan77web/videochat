import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { Context } from "../..";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import cl from "./Profile.module.css"

const Profile: React.FC = () => {
    const { auth } = useContext(Context);
    const { name } = useTypedSelector(state => state.userData)
    const dispatch = useDispatch()

    const logout = () => {
        auth.signOut();
        dispatch({ type: "logout" })
        dispatch({ type: "deleteData" })
    }

    return (
        <div className="container">
            <div>
                {name}
            </div>
            
            <div className={cl.logout} onClick={logout}>Выйти</div>
        </div>
    )
}

export { Profile }