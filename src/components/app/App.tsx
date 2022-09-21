import React from 'react';
import { Navbar } from '../navbar/Navbar';
import cl from "./App.module.css"

function App() {
  return (
    <div className="App">
      <div className={cl.navbar}>
        <Navbar/>
      </div>

      
    </div>
  );
}

export default App;
