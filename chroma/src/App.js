import React, { Component } from 'react';
import './App.css';

import ColorCube from './ColorCube.js';

class App extends Component {

  pickNewColor = () => {
    return "#"+Math.floor(Math.random()*16777215).toString(16);
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ColorCube/>
        </header>
      </div>
    );
  }
}

export default App;
