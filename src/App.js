import React, { Component } from "react";

import { HashRouter, Route } from "react-router-dom";
import { connect } from "react-redux";

import { firebaseAuth, firebaseApp } from "./firebase-config";
import Login from "./components/login";
import Chat from "./components/chat";

import { loginAction, logoutAction } from "./redux/action";

class App extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        window.location.href = "#/chat";
        const currentUser = firebaseAuth.currentUser;
        if (!!currentUser) {
          dispatch(
            loginAction({
              userName: currentUser.displayName,
              photoUrl: currentUser.photoURL
            })
          );
        }
      } else {
        window.location.href = "#";
        dispatch(logoutAction());
        console.log("log out");
      }
    });
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Route exact path="/" component={Login} />
          <Route path="/chat" component={Chat} />
        </div>
      </HashRouter>
    );
  }
}

export default connect(
  null,
  dispatch => ({ dispatch })
)(App);
