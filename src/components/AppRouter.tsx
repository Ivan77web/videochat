import { Routes, Route } from "react-router-dom"
import { useTypedSelector } from "../hooks/useTypedSelector"
import { Auth } from "./auth/Auth"
import { Chat } from "./chat/Chat"
import { Friends } from "./friends/Friends"
import { OneCallAnswer } from "./oneCall/oneCallAnswer/OneCallAnswer"
import { OneCallBase } from "./oneCall/oneCallBase/OneCallBase"
import { OneCallOffer } from "./oneCall/oneCallOffer/OneCallOffer"
import { Profile } from "./profile/Profile"

const AppRouter = () => {
    const { isAuth } = useTypedSelector(state => state.auth)

    return (
        isAuth
            ?
            (
                <Routes>
                    <Route path="/" element={<Chat />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/call" element={<OneCallBase/>} />
                    <Route path="*" element={<Chat />} />
                </Routes>
            )
            :
            (
                <Routes>
                    <Route path="/" element={<Chat />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={<Chat />} />
                </Routes>
            )

    )
}

export { AppRouter }