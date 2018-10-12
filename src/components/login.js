import React from "react";
import styled from "styled-components";

import { firebaseApp, googleProvider } from "../firebase-config";

export default class Login extends React.Component {
  authWithGG = () => {
    googleProvider.addScope("profile");
    googleProvider.addScope("email");
    firebaseApp
      .auth()
      .signInWithPopup(googleProvider)
      .then(result => {
        // console.log("result auth", result);
        // console.log("user", result.user);
      })
      .catch(err => {
        console.log("err auth", err);
      });
  };

  render() {
    return (
      <Wrapp>
        <Content>
          <p>FireChat</p>
          <FCButton text="Login with Facebook" background="#2962FF" fullWidth />
          <FCButton
            text="Login with Google"
            fullWidth
            onClick={this.authWithGG}
          />
          <p>Or</p>
          <FCInput icon="fa fa-user-circle" placeholder="Username" />
          <FCInput icon="fa fa-unlock" placeholder="Password" />
          <FCButton text="Login " background="#1DE9B6" fullWidth />
          <p>Create an account</p>
          <p>Forgot password</p>
        </Content>
      </Wrapp>
    );
  }
}

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
  div {
    input {
      margin-left: 05px;

      border: none;
    }
    padding: 5px 0;
    border-bottom: 1px solid #e3e3e3;
  }
`;
