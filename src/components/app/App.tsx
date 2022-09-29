import { useContext, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Context } from '../..';
import { AppRouter } from '../AppRouter';
import { Navbar } from '../navbar/Navbar';
import { WindowOffer } from '../windowOffer/WindowOffer';
import cl from "./App.module.css"

function App() {
  const dispatch = useDispatch()
  const { auth, firestore } = useContext(Context);
  const [user] = useAuthState(auth)
  const [allUsers] = useCollectionData(
    firestore.collection("allUsers")
  )

  useEffect(() => {
    if (user && allUsers) {
      allUsers.map(oneUser => {
        if (oneUser.id === user.uid) {
          let userData = {
            name: oneUser.name,
            firstName: oneUser.firstName,
            id: oneUser.id,
            phone: oneUser.phone,
            email: oneUser.email,
            photo: oneUser.photo,
            gender: oneUser.gender
          }
  
          dispatch({type: "addUserData", payload: userData})
          dispatch({type: "auth"})
        }
      })
    }
  },[allUsers])

  return (
    <div className={cl.app}>
      <BrowserRouter>
        <Navbar />
        <AppRouter />
        <WindowOffer/>
      </BrowserRouter>
    </div>
  );
}

export default App;