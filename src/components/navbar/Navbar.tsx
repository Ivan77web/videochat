import { Link } from "react-router-dom";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { Login } from "../../icons/login/Login";
import { Search } from "../../icons/search/Search";
import cl from "./Navbar.module.css"

const Navbar = () => {
    const { isAuth } = useTypedSelector(state => state.auth);
    const { photo } = useTypedSelector(state => state.userData);

    return (
        <div className="container">
            <div className={cl.navbar}>
                <Link to="/friends">
                    <div className={cl.search}>
                        <Search />
                    </div>
                </Link>

                <Link to="/chat">
                    <div className={cl.logo}>Час пик</div>
                </Link>

                {
                    isAuth
                        ?
                        <Link to="/profile">
                            <div className={cl.photoBlock}>
                                <img className={cl.photo} src={photo} />
                            </div>
                        </Link>
                        :

                        <Link to="/auth">
                            <div className={cl.login}>
                                <Login />
                            </div>
                        </Link>
                }
            </div>
        </div>
    )
}

export { Navbar }