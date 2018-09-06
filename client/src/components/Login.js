import React, { Component } from "react";
import { Field, SubmitButton } from "form-components";

class Login extends Component {
  state = {};

  onInputChange = ({ email, password }) => {};

  render() {
    return (
      <section className="loginSection">
        <header class="loginHeader">Login</header>
        <Field />
      </section>
    );
  }
}
