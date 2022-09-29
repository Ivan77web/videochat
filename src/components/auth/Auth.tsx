import React, { useContext, useState } from "react";
import cl from "./Auth.module.css"
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { Context } from "../..";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { IDefaultStateDataUser } from "../../types/userDataReducer";
import { useDispatch } from "react-redux";
import { MyButton } from "../ui/myButton/MyButton";
import { MyInput } from "../ui/myInput/MyInput";
import { useNavigate } from "react-router";

const Auth: React.FC = () => {
    const navigate = useNavigate();
    const { auth, firestore } = useContext(Context);
    const dispatch = useDispatch();
    const photo = "https://firebasestorage.googleapis.com/v0/b/videochat-7469a.appspot.com/o/defaultAvatarMen.png?alt=media&token=4508154b-3f2d-474a-bd79-9a8cb39b5d69";
    const [messageNewUser, setMessageNewUser] = useState<boolean>(false);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState();
    const [userEmail, setUserEmail] = useState();
    const [isError, setIsError] = useState<boolean>(false);
    const [allUsers] = useCollectionData(
        firestore.collection("allUsers")
    )

    const login = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        const { user } = await auth.signInWithPopup(provider);

        setUserId(user.uid)
        setUserEmail(user.email)

        checkUser(user.uid)
    }

    const checkUser = (id: string) => {
        let flag = 0;
        if (allUsers) {
            for (let i = 0; i < allUsers.length; i++) {
                if (allUsers[i].id === id) {
                    let userData: IDefaultStateDataUser = {
                        name: allUsers[i].name,
                        id: allUsers[i].id,
                        email: allUsers[i].email,
                        photo: allUsers[i].photo,
                    }

                    addDataUserAndAuthState(userData)

                    flag = 1;
                }
            }

            if (flag === 0) {
                setMessageNewUser(true)
            } else {
                navigate("/")
            }
        }
    }

    const addDataUserAndAuthState = (user: IDefaultStateDataUser) => {
        dispatch({ type: "addUserData", payload: user })
        dispatch({ type: "auth" })
    }

    const addUserInDB = async () => {
        if (name) {
            if (allUsers) {
                let flagName = 0;

                for (let i = 0; i < allUsers.length; i++) {
                    if (allUsers[i].name === name) {
                        flagName = 1;
                    }
                }

                if (flagName === 0) {
                    await setDoc(doc(firestore, "allUsers", `user_${userId}`), {
                        id: userId,
                        email: userEmail,
                        name: name,
                        photo: photo,
                    });

                    const user = {
                        id: userId,
                        email: userEmail,
                        name: name,
                        photo: photo,
                    }

                    dispatch({ type: "addUserData", payload: user })

                    navigate("/profile")
                } else {
                    setIsError(true)
                    setName("")
                }
            }
        }
    }

    return (
        <div className="container">
            <div className={cl.auth}>
                {messageNewUser
                    ?
                    <div className={cl.newUser}>
                        <h3 className={cl.title}>Мы рады приветствовать нового пользователя на нашем сервисе!</h3>

                        <div className={cl.data}>
                            <div className={cl.nameInput}>
                                <MyInput
                                    width="100%"
                                    height="30px"
                                    placeholder="Придумайте свой ник"
                                    value={name}
                                    setValue={setName}
                                />
                            </div>

                            {
                                isError
                                    ?
                                    <div className={cl.errorName}>** Пользователь с таким ником уже существует</div>
                                    :
                                    <div />
                            }

                            <div className={cl.button} onClick={addUserInDB}>
                                <MyButton
                                    width="100%"
                                    height="40px"
                                    bg="rgb(145, 35, 35)"
                                    color="white"
                                    name="Отправить"
                                />
                            </div>
                        </div>
                    </div>
                    :
                    <div className={cl.windowAuth}>
                        <p className={cl.intro}>Войдите с помощью своего Google аккаунта. Это не займет много времени.</p>
                        <p className={cl.buttonAuth} onClick={login}>ВОЙТИ</p>
                    </div>
                }
            </div>
        </div>
    )
}

export { Auth }