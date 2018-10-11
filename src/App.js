import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import { firebaseAuth, firebaseApp } from "./firebase-config";
import Login from "./login";
import Chat from "./chat";

import "font-awesome/css/font-awesome.min.css";

class App extends Component {
  componentDidMount() {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        console.log("fire", firebaseApp.auth().currentUser);
        const currentUser = firebaseAuth.currentUser;
        if (!!currentUser) {
          this.setState({
            userName: currentUser.displayName,
            photoUrl: currentUser.photoURL
          });
        }
      } else {
        console.log("log out");
      }
    });
  }

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
