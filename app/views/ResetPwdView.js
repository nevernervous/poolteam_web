import React from 'react';
import { hashHistory } from 'react-router';
import api from '../api';
import ResetPwd from '../components/ResetPwd';


export default class ResetPwdView extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
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

  /* add / remove all error text & return if the entire form is valid */
  validateForm() {
    const validPassword = this.validatePassword(this.state.password, 'password');
    const validConfirmPassword = this.validatePassword(this.state.confirmPassword, 'confirmPassword');
    const passwordsMatch = this.validatePasswordsMatch();
    return validPassword && validConfirmPassword && passwordsMatch;
  }

  handleReset(evt) {
    evt.preventDefault();
    const isFormValid = this.validateForm();
    if (!isFormValid) return;
    if (this.state.password.value.length < 8){
      this.setState({errorText: "Password is too short."});
      return;
    }

    api.reset_pwd(this.props.params.email, this.props.params.code, this.state.password.value)
    .then(_resp => {
      console.log(_resp);
      hashHistory.push('/login');
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
    const { errorText, password, confirmPassword } = this.state;
    return (
      <ResetPwd
        errorText={errorText}
        password={password}
        confirmPassword={confirmPassword}
        onSubmit={(evt) => this.handleReset(evt)}
      />
    );
  }
}
