import React from "react";
import cl from "./Friends.module.css"
import { SearchFriends } from "./searchFriends/SearchFriends";

const Friends: React.FC = () => {
    return (
        <div className="container">
            <div className={cl.friends}>
                <div className={cl.myFriends}>
                    <div className={cl.intro}>Мои друзья</div>
                </div>

                <div className={cl.searchFriends}>
                    <SearchFriends />
                </div>
            </div>
        </div>
    )
}

export { Friends }