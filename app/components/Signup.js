import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { white, yellow600, blue900 } from 'material-ui/styles/colors';
import React from 'react';
import { Link } from 'react-router';
import MessageBox from './MessageBox';

const Signup = ({ errorText, email, password, username, confirmPassword, onSubmit }) => (
  <div className="auth-page">
    <AppBar
      iconElementRight={
        <RaisedButton
          containerElement={<Link to="/login" />}
          buttonStyle={{backgroundColor: yellow600}}
          labelStyle={{color: blue900}}
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

      <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
      {errorText && <MessageBox error text={errorText} />}

      <form onSubmit={onSubmit}>
          <TextField
              autoFocus
              hintText="User Name"
              floatingLabelText="User Name"
              fullWidth
              underlineFocusStyle={{color: blue900}}
              floatingLabelFocusStyle={{color: blue900}}
              required
              type="text"
              {...username}
          />
        <TextField
          hintText="Email address"
          floatingLabelText="Email address"
          fullWidth
          required
          underlineFocusStyle={{color: blue900}}
          floatingLabelFocusStyle={{color: blue900}}
          type="email"
          {...email}
        />
        <TextField
          hintText="Password"
          floatingLabelText="Password"
          fullWidth
          required
          underlineFocusStyle={{color: blue900}}
          floatingLabelFocusStyle={{color: blue900}}
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
          label="Sign up"
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

Signup.propTypes = {
  errorText: React.PropTypes.string,
  email: React.PropTypes.object.isRequired,
  password: React.PropTypes.object.isRequired,
  username: React.PropTypes.object.isRequired,
  confirmPassword: React.PropTypes.object.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
};

export default Signup;
