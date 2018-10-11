import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import Login from "./login";
import Chat from "./chat";

import "font-awesome/css/font-awesome.min.css";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route exact path="/" component={Login} />
          <Route path="/chat" component={Chat} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
