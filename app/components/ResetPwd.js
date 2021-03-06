import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { white, yellow600, blue900 } from 'material-ui/styles/colors';
import React from 'react';
import { Link } from 'react-router';
import MessageBox from './MessageBox';

const ResetPwd = ({ errorText, password, confirmPassword, onSubmit }) => (
  <div className="auth-page">
    <AppBar
      iconElementRight={
        <RaisedButton
          containerElement={<Link to="/login" />}
          label="Login"
          secondary
        />
      }
      showMenuIconButton={false}
      style={{ background: white, boxShadow: 'none' }}
    />

    <main className="container container--small">
      <div className="logo-container">
        <img src="images/poolteam_logo.jpg"/>
        <br/><br/>
        <h4>POOLTEAM | Manage Your Pool Remotely</h4>
      </div>

      <h2 style={{ textAlign: 'center' }}>Reset Password</h2>
      {errorText && <MessageBox error text={errorText} />}

      <form onSubmit={onSubmit}>
        <TextField
          hintText="Password"
          floatingLabelText="Password"
          fullWidth
          underlineFocusStyle={{color: blue900}}
          floatingLabelFocusStyle={{color: blue900}}
          required
          type="password"
          {...password}
        />
        <TextField
          hintText="Confirm Password"
          floatingLabelText="Confirm Password"
          fullWidth
          required
          underlineFocusStyle={{color: blue900}}
          floatingLabelFocusStyle={{color: blue900}}
          type="password"
          {...confirmPassword}
        />
        <RaisedButton
          fullWidth
          label="Reset"
          primary
          buttonStyle={{backgroundColor: yellow600}}
          labelStyle={{color: blue900}}
          style={{ marginTop: 16, width: '100%' }}
          type="submit"
        />
      </form>
    </main>
    <footer className="version">
      Version 1.0.0
    </footer>
  </div>
);

ResetPwd.propTypes = {
  errorText: React.PropTypes.string,
  password: React.PropTypes.object.isRequired,
  confirmPassword: React.PropTypes.object.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
};

export default ResetPwd;
