import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { white, blue900, yellow600 } from 'material-ui/styles/colors';
import React from 'react';
import { Link } from 'react-router';

export default class LogoutView extends React.Component {
  componentWillMount() {
    // TODO: make an api endpoint to delete the session & delete the http cookie
  }

  render() {
    return (
      <div className="auth-page">
        <AppBar
          iconElementRight={
            <RaisedButton
              buttonStyle={{backgroundColor: yellow600}}
              labelStyle={{color: blue900}}
              containerElement={<Link to="/login" />}
              label="login"
              secondary
            />
          }
          showMenuIconButton={false}
          style={{ background: white, boxShadow: 'none' }}
        />

      <main className="container container--small" style={{ textAlign: 'center' }}>
          <div className="logo-container">
            <img src="images/poolteam_logo.jpg"/>
            <br/><br/>
            <h4>POOLTEAM | Manage Your Pool Remotely</h4>
          </div>

          <h2 style={{ textAlign: 'center' }}>Logout</h2>
          <p style={{ margin: '8px 0'}}>You've been signed out</p>
          <FlatButton
            containerElement={<Link to="/login" />}
            label="Login again"
            labelStyle={{color: blue900}}
            secondary
          />
        </main>
        <footer className="version">
          Version 1.0.0
        </footer>
      </div>
    );
  }
}
