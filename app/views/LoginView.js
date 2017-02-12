import React from 'react';
import { hashHistory } from 'react-router';
import api from '../api';
import Login from '../components/Login';
import store from '../store';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import {blue900} from 'material-ui/styles/colors';

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export default class LoginView extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      errorText: null,
      infoText: null,
      isAuthenticating: false,
      open_dialog: false,
      btn_dialog: false,
      txt_dialog: ''
    };
  }

  handleSubmit(evt) {
    evt.preventDefault(evt);
    const password = evt.target.elements.password.value;
    const email = evt.target.elements.email.value;
    this.setState({ errorText: null, isAuthenticating: true });
    api.login(email, password)
      .then(response => {
        store.email = email;
        store.token = response.payload.token;
        store.name = response.payload.name;
        store.role = response.payload.role;
        hashHistory.replace('/pools');
      })
      .catch(err => {
        this.setState({
          errorText: err.response.status === 400 ? 'Invalid username or password' : err.toString(),
          isAuthenticating: false,
        });
      });
  }
  handleCloseDialog(){
    this.setState({open_dialog: false})
  }

  handleOpenDialog(){
    this.setState({open_dialog: true, txt_dialog: ''})
  }

  onChangeTextDialog(event){
    let new_val = event.target.value;
    this.setState({txt_dialog: new_val});
    if (validateEmail(new_val)) this.setState({btn_dialog: true})
  }

  performSendForgotEmail(){
    let email = this.state.txt_dialog;
    this.handleCloseDialog();

    // Check if this email is already registered or not
    api.request_recover(email)
      .then(response => {
        console.log(response);
        this.setState({infoText: "Password recovery email sent, please check your mailbox."})
      })
      .catch(err => {
        console.log(err.toString());
        this.setState({errorText: "User email is not registered."})
      });

  }

  render() {
    const { errorText, infoText, isAuthenticating } = this.state;
    const actions_forgot = [
      <FlatButton
        label="CANCEL"
        primary={true}
        labelStyle={{color: blue900}}
        keyboardFocused={true}
        disabled={isAuthenticating}
        onTouchTap={() => this.handleCloseDialog()}
      />,
      <FlatButton
        label="SEND EMAIL"
        primary={true}
        labelStyle={{color: blue900}}
        disabled={!this.state.btn_dialog || isAuthenticating}
        onTouchTap={() => this.performSendForgotEmail()}
      />,
    ];

    return (
      <div>
        <Login
          errorText={errorText}
          infoText={infoText}
          isAuthenticating={isAuthenticating}
          onSubmit={(evt) => this.handleSubmit(evt)}
          handleOpenDialog={() => this.handleOpenDialog()}
        />

        <Dialog
          title="Send Password Recovery Email"
          actions={actions_forgot}
          modal={true}
          open={this.state.open_dialog}
          onRequestClose={() => this.handleCloseDialog()}
        >
          <TextField
            hintText="Password Recovery Email"
            floatingLabelText="Input here"
            value={this.state.txt_dialog}
            underlineFocusStyle={{color: blue900}}
            floatingLabelFocusStyle={{color: blue900}}
            onChange={this.onChangeTextDialog.bind(this)}
            disabled={isAuthenticating}
          />
        </Dialog>
      </div>
    );
  }
}
