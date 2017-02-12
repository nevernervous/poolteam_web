import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { white, yellow600, blue900 } from 'material-ui/styles/colors';
import React from 'react';
import { Link } from 'react-router';
import MessageBox from './MessageBox';

const Login = ({ errorText, isAuthenticating, infoText, onSubmit, handleOpenDialog }) => (
  <div className="auth-page">
    <AppBar
      iconElementRight={
        <RaisedButton
          containerElement={<Link to="/signup" />}
          label="Sign up"
          buttonStyle={{backgroundColor: yellow600}}
          labelStyle={{color: blue900}}
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

      <h2 style={{ textAlign: 'center' }}>Login</h2>
      {errorText && <MessageBox error text={errorText} />}
      {infoText && <MessageBox info text={infoText} />}

      <form onSubmit={onSubmit}>
        <TextField
          autoFocus
          hintText="Email address"
          floatingLabelText="Email address"
          fullWidth
          name="email"
          required
          type="email"
          underlineFocusStyle={{color: blue900}}
          floatingLabelFocusStyle={{color: blue900}}
        />
        <TextField
          hintText="Password"
          floatingLabelText="Password"
          fullWidth
          name="password"
          required
          type="password"
          underlineFocusStyle={{color: blue900}}
          floatingLabelFocusStyle={{color: blue900}}
        />
        <RaisedButton
          disabled={isAuthenticating}
          fullWidth
          buttonStyle={{backgroundColor: yellow600}}
          labelStyle={{color: blue900}}
          label="Login"
          primary
          style={{ marginTop: 16, width: '100%' }}
          type="submit"
        >
          {isAuthenticating && <LinearProgress color={blue900} />}
        </RaisedButton>
      </form>

      <FlatButton label="Forgot password?" primary
                  labelStyle={{color: blue900}}
                  style={{ width: '100%' }}
                  onTouchTap={handleOpenDialog}
                  disabled={isAuthenticating}
      />
    </main>
    <footer className="version">
      Version 1.0.0
    </footer>
  </div>
);

Login.propTypes = {
  errorText: React.PropTypes.string,
  infoText: React.PropTypes.string,
  isAuthenticating: React.PropTypes.bool,
  onSubmit: React.PropTypes.func.isRequired,
  handleOpenDialog: React.PropTypes.func,
};

export default Login;
