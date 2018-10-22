import React, { Component } from "react";

import { HashRouter, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { firebaseAuth } from "./firebase-config";
import Login from "./components/login";
import Chat from "./components/chat";

import { loginAction, logoutAction } from "./redux/action";

class App extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        // window.location.href = "#/chat";
        const currentUser = firebaseAuth.currentUser;

        if (!!currentUser) {
          dispatch(
            loginAction({
              userName: currentUser.displayName,
              photoUrl: currentUser.photoURL,
              uid: currentUser.uid
            })
          );
        }
      } else {
        // window.location.href = "#";
        dispatch(logoutAction());
        // console.log("log out");
      }
    });
  }

  render() {
    const { info = {}, isLogin } = this.props.app;
    return (
      <HashRouter>
        <div>
          <Route exact path="/login" component={Login} />
          <PrivateRoute path="/" component={Chat} isAuthenticated={isLogin} />
        </div>
      </HashRouter>
    );
  }
}

export default connect(
  ({ app }) => ({ app }),
  dispatch => ({ dispatch })
)(App);

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/login"
          }}
        />
      )
    }
  />
);
