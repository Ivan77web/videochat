import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/app/App';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'
import { IValue } from './types';
import { Provider } from 'react-redux';
import { store } from './store';

firebase.initializeApp({
  apiKey: "AIzaSyDcOTkCdtTA7zvEWwbG2K_d9vCn-gyBnQY",
  authDomain: "videochat-7469a.firebaseapp.com",
  projectId: "videochat-7469a",
  storageBucket: "videochat-7469a.appspot.com",
  messagingSenderId: "915803325409",
  appId: "1:915803325409:web:f09b4a61a3658597d6c8a0"
});

export const Context = createContext<IValue>({} as IValue);

const auth = firebase.auth()
const firestore = firebase.firestore();
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const value = {
  firebase,
  auth,
  firestore
}

root.render(
  <Provider store={store}>
    <Context.Provider value={value}>
      <App />
    </Context.Provider>
  </Provider>
);