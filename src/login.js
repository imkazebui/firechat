import React from "react";
import styled from "styled-components";

export default class Login extends React.Component {
  render() {
    return (
      <div>
        <div>
          <p>FireChat</p>
          <FCButton text="Login with Facebook" />
          <FCButton text="Login with Google" />
        </div>
        <p>Or</p>
        <FCInput icon="fa fa-user-circle" placeholder="Username" />
        <FCInput icon="fa fa-unlock" placeholder="Password" />
        <FCButton text="Login " />
        <p>Create an account</p>
        <p>Forgot password</p>
      </div>
    );
  }
}

function FCButton({ text }) {
  return (
    <WrappButton>
      <div>{text}</div>
    </WrappButton>
  );
}

const WrappButton = styled.div`
  display: flex;

  div {
    padding: 5px 20px;
    background: #f44336;
    border-radius: 20px;
    color: white;
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
