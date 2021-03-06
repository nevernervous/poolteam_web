import React from 'react';
import { hashHistory } from 'react-router';
import api from '../api';
import Signup from '../components/Signup';


function CheckEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export default class SignupView extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      email: {
        errorText: null,
        onBlur: () => { this.validateEmail() },
        onChange: (evt, value) => {
          const email = {
            ...this.state.email,
            value,
          };
          this.setState({ email });
          this.validateEmail(email);
        },
        value: '',
      },
      username: {
        errorText: null,
        onBlur: () => { this.validateUsername() },
        onChange: (evt, value) => {
          const username = {
            ...this.state.username,
            value,
          };
          this.setState({ username });
          this.validateUsername(username);
        },
        value: '',
      },
      password: {
        errorText: null,
        onBlur: () => { this.validatePassword(this.state.password, 'password') },
        onChange: (evt, value) => {
          const password = {
            ...this.state.password,
            value,
          };
          this.setState({ password });
          this.validatePassword(password, 'password');
        },
        value: '',
      },
      confirmPassword: {
        errorText: null,
        onBlur: () => { this.validatePassword(this.state.confirmPassword, 'confirmPassword') },
        onChange: (evt, value) => {
          const confirmPassword = {
            ...this.state.confirmPassword,
            value,
          };
          this.setState({ confirmPassword }),
          this.validatePassword(confirmPassword, 'confirmPassword');
        },
        value: '',
      },
    };
  }

  /* add / remove error text & return if a password field is valid */
  validatePassword(passwordState, key) {
    // passing in the password state and key instead of
    // just using this.state.password because we need to be able to use
    // this method for both password and confirmPassword
    let errorText = null;
    if (!passwordState.value) errorText = 'This field is required';

    if (passwordState.errorText !== errorText) {
      this.setState({
        [key]: {
          ...passwordState, // keep all already existing properties
          errorText,
        },
      })
    }

    return !errorText; // field is valid if there's no error text
  }

  validatePasswordsMatch() {
    let errorText = null;
    if (this.state.password.value !== this.state.confirmPassword.value) {
      errorText = 'Passwords do not match';
    }

    if (errorText && this.state.confirmPassword.errorText !== errorText) {
      this.setState({
        confirmPassword: {
          ...this.state.confirmPassword,
          errorText,
        },
      });
    }

    return !errorText; // passwords match if there's no error text
  }

  /* add / remove error text & return if the email field is valid */
  validateEmail(nextEmailState) {
    const email = nextEmailState || this.state.email;
    let errorText = null;
    if (!email.value) errorText = 'This field is required';
    if (!CheckEmail(email.value)) errorText = 'Invalid email';

    if (email.errorText !== errorText) {
      this.setState({
        email: {
          ...email,
          errorText,
        },
      });
    }

    return !errorText; // email is valid if there's no error text
  }

  validateUsername() {
    const username = this.state.username;
    let errorText = null;
    if (!username.value) errorText = 'This field is required';

    if (username.errorText !== errorText) {
      this.setState({
        username: {
          ...username,
          errorText,
        },
      });
    }

    return !errorText; // email is valid if there's no error text
  }

  /* add / remove all error text & return if the entire form is valid */
  validateForm() {
    const validEmail = this.validateEmail();
    const validUsername = this.validateUsername();
    const validPassword = this.validatePassword(this.state.password, 'password');
    const validConfirmPassword = this.validatePassword(this.state.confirmPassword, 'confirmPassword');
    const passwordsMatch = this.validatePasswordsMatch();

    return validEmail && validPassword && validConfirmPassword && passwordsMatch && validUsername;
  }

  handleSignup(evt) {
    evt.preventDefault();
    const isFormValid = this.validateForm();
    if (!isFormValid) return;

    api.signup(this.state.email.value, this.state.username.value, this.state.password.value)
    .then(_resp => {
      hashHistory.push('/signup-confirmation');
    })
    .catch(err => {
      const stateError = {};
      const payload = err.response && err.response.payload;
      if (typeof payload === 'string') {
        try {
          stateError.errorText = JSON.parse(payload).message;
        } catch (e){
          stateError.errorText = payload;
        }

      } else {
        stateError.errorText = err.message;
      }

      this.setState(stateError);
    });
  }

  render() {
    const { errorText, email, password, username, confirmPassword } = this.state;
    return (
      <Signup
        errorText={errorText}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        username={username}
        onSubmit={(evt) => this.handleSignup(evt)}
      />
    );
  }
}
