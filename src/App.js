import React, { Component } from "react";

import Login from "./login";

import logo from "./logo.svg";
import "./App.css";
import "font-awesome/css/font-awesome.min.css";

class App extends Component {
  render() {
    return (
      <div>
        <Login />
      </div>
    );
  }
}

export default App;
