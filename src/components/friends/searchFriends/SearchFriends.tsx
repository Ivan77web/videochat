import React, { useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Context } from "../../..";
import { IAllUsers } from "../../../types/searchFrineds";
import { UserCard } from "../../userCard/UserCard";
import cl from "./SearchFriends.module.css"

const SearchFriends: React.FC = () => {
    const { firestore } = useContext(Context);
    const [allUsers] = useCollectionData<IAllUsers>(
        firestore.collection("allUsers")
    )

    if (allUsers) {
        return (
            <div className={cl.searchFriends}>
                <div className={cl.intro}>Поиск друзей</div>

                <div className={cl.users}>
                    {
                        allUsers.map(user =>
                            <UserCard
                                user={user}
                                key={user.id}
                            />
                        )
                    }
                </div>
            </div>
        )
    } else {
        return (
            <div />
        )
    }
}

export { SearchFriends }