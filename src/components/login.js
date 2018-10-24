import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import { firebaseAuth, googleProvider, database } from "../firebase-config";

class Login extends React.Component {
  state = {};

  static getDerivedStateFromProps(props, state) {
    if (props.app.isLogin) {
      props.history.push("/");
    }

    return null;
  }

  authWithGG = () => {
    googleProvider.addScope("profile");
    googleProvider.addScope("email");
    firebaseAuth
      .signInWithPopup(googleProvider)
      .then(result => {
        let user = result.user;

        database.ref(`users/${user.uid}`).once("value", snapshot => {
          if (!snapshot.val()) {
            database.ref(`users/${user.uid}`).set({
              name: user.displayName,
              email: user.email,
              avatar: user.photoURL,
              rooms: {}
            });
          }
        });
      })
      .catch(err => {
        console.log("err auth", err);
      });
  };

  render() {
    return (
      <Wrapp>
        <Content>
          <h1 className="center">FireChat</h1>
          <FCButton text="Login with Facebook" background="#2962FF" fullWidth />
          <FCButton
            text="Login with Google"
            fullWidth
            onClick={this.authWithGG}
          />
          <p className="center">Or</p>
          <FCInput icon="fa fa-user-circle" placeholder="Username" />
          <FCInput icon="fa fa-unlock" placeholder="Password" />
          <br />
          <FCButton text="Login " background="#1DE9B6" fullWidth />

          <p>Note: You can only login by Google account</p>
        </Content>
      </Wrapp>
    );
  }
}

export default connect(({ app }) => ({
  app
}))(Login);

const Wrapp = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9e9e9;
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #bfbfbf;
  background: white;
  box-shadow: 0px 0px 10px 5px #aaaaaa;

  .center {
    text-align: center;
  }
`;

function FCButton({
  text,
  background = "#f44336",
  fullWidth = false,
  onClick = () => {}
}) {
  return (
    <WrappButton background={background} fullWidth={fullWidth}>
      <div onClick={onClick}>{text}</div>
    </WrappButton>
  );
}

const WrappButton = styled.div`
  display: flex;
  margin-bottom: 10px;

  div {
    padding: 5px 20px;
    background: ${({ background }) => background};
    border-radius: 20px;
    color: white;
    width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
    text-align: center;
  }
`;

function FCInput({ icon, ...inputData }) {
  return (
    <WrappInput>
      <div>
        <i className={icon} />
        <input {...inputData} />
      </div>
    </WrappInput>
  );
}

const WrappInput = styled.div`
  display: flex;
  margin-bottom: 10px;
  div {
    width: 100%;

    input {
      margin-left: 05px;
      font-size: 16px;
      border: none;
    }
    padding: 5px 0;
    border-bottom: 1px solid #e3e3e3;
  }
`;
