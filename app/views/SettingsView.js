import store from '../store';
import React from 'react';
import IconButton from 'material-ui/IconButton';
import { hashHistory } from 'react-router';
import api from '../api';
import MessageBox from '../components/MessageBox';
import LoadingIndicator from '../components/LoadingIndicator';
import NavBar from '../components/NavBar';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar';
import {cyan50, cyan400, grey600, blue900} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import {red500, indigo600, blue500, yellow600} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import base32 from 'base32';


function getMuranoErrorText() {
  return `Murano Error: It appears this serial number was either not
    added as a device, this device was not activated, the product was
    not associated with this solution, or the device has not written
    to the platform.`;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Validate phone number with E.164 standard
function validatePhone(phone_number){
  var re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone_number);
}

function isNumeric(n) {
  return (!isNaN(parseFloat(n)) && isFinite(n)) || (n == '');
}

const iconStyles = {
  marginRight: 24,
};


export default class SettingsView extends React.Component {
  constructor(props) {
    super(props);

    let b_loading = false;
    let errorText = null;
    let alert_emails = [];
    let alert_sms = [];
    let buf_index = null;
    
    let isWorking = false;
    let btn_dialog = false;
    let txt_dialog = '';
    
    let open_delete_dialog = false;
    let open_add_dialog = false;
    let alert_type = '';
    let sender_phone = '';

    this.state = {
      b_loading,
      errorText,
      alert_emails,
      open_delete_dialog,
      buf_index,
      isWorking,
      btn_dialog,
      txt_dialog,
      open_add_dialog,
      alert_sms,
      alert_type,
      sender_phone,
    };
  }
  componentWillMount() {
    this.mounted = true;
    this.pollAlertMails();
    this.pollAlertSms();
    if (store.role == 'admin')
      this.pollSmsPhone();
  }
  componentWillUnmount() {
    this.mounted = false;
  }

  pollSmsPhone(){
    api.getSmsPhone()
      .then(response => {
        if (!this.mounted) return;
        // console.log(response.payload);
        if (response.status === 304) this.setState({ errorText: null, b_loading: false});
        else {
          this.setState({ sender_phone: response.payload});
        }
      })
      .catch(err => {
        if (!this.mounted) return;
        this.setState({
          errorText: err.toString(),
          alert_emails: [],
        })
      });
  }

  pollAlertMails() {
    this.setState({b_loading: true});
    api.get_alert('email')
      .then(response => {
        if (!this.mounted) return;
        // console.log(response.payload);
        if (response.status === 304) this.setState({ errorText: null, b_loading: false});
        else {
          if (response.payload.length > 0){
            let emails = [];
            for (var i=0; i < response.payload.length; i++)
              emails.push(base32.decode(response.payload[i]));
            this.setState({ alert_emails: emails, b_loading: false});
          }
          this.setState({ errorText: null, b_loading: false});
        }
      })
      .catch(err => {
        if (!this.mounted) return;
        this.setState({
          errorText: err.toString(),
          alert_emails: [],
        })
      });
  }

  pollAlertSms() {
    this.setState({b_loading: true});
    api.get_alert('sms')
      .then(response => {
        if (!this.mounted) return;
        // console.log(response.payload);
        if (response.status === 304) this.setState({ errorText: null, b_loading: false});
        else this.setState({ errorText: null, b_loading: false, alert_sms: response.payload});
      })
      .catch(err => {
        if (!this.mounted) return;
        this.setState({
          errorText: err.toString(),
          alert_sms: [],
        })
      });
  }

  handleDeleteAlert(alert_type, index){
    this.setState({buf_index: index, open_delete_dialog: true, alert_type: alert_type});
  }

  onChangeTextDeleteDialog(event){
    let new_val = event.target.value;
    this.setState({txt_dialog: new_val});

    if (new_val == 'DELETE'){
      this.setState({btn_dialog: true});
    }
    else {
      this.setState({btn_dialog: false});
    }
  }
  handleCloseDialog(){
    this.setState({open_delete_dialog: false, txt_dialog:'', open_add_dialog:false, btn_dialog: false})
  }
  openAddAlertModal(alert_type){
    if (alert_type == 'sms') this.setState({txt_dialog: '+'});
    else if (alert_type == 'sender_phone') this.setState({txt_dialog: this.state.sender_phone});
    this.setState({open_add_dialog: true, alert_type: alert_type})
  }

  performDeleteAlert(){
    this.setState({isWorking: true});
    let target_alert = '';
    if (this.state.alert_type == 'email') target_alert = base32.encode(this.state.alert_emails[this.state.buf_index]);
    else target_alert = this.state.alert_sms[this.state.buf_index];

    api.delete_alert(this.state.alert_type, target_alert)
      .then(response => {
        // console.log(response);
        if (response.payload.status == 200){
          console.log("Successfully deleted...");
        }
        this.setState({isWorking: false});
        if (this.state.alert_type == 'email') this.pollAlertMails();
        else this.pollAlertSms();
        this.handleCloseDialog()
      })
      .catch(err => {
        console.log("Error");
        console.log(err);
        this.setState({isWorking: false});
      });
  }

  performAddAlert(){
    this.setState({isWorking: true});

    let target_alert = '';
    if (this.state.alert_type == 'email')   // convert to base32 before uploading
      target_alert = base32.encode(this.state.txt_dialog);
    else // Remove `+` before uploading
      target_alert = this.state.txt_dialog.substr(1);

    if (this.state.alert_type != 'sender_phone')
      api.add_alert(this.state.alert_type, target_alert)
        .then(response => {
          // console.log(response);
          if (response.payload.status == 200){
            console.log("Successfully added...");
          }
          this.setState({isWorking: false});
          if (this.state.alert_type == 'email') this.pollAlertMails();
          else this.pollAlertSms();
          this.handleCloseDialog()
        })
        .catch(err => {
          console.log("Error");
          console.log(err);
          this.setState({isWorking: false});
        });
    else
      api.setSmsPhone(this.state.txt_dialog)
        .then(response => {
          // console.log(response);
          if (response.payload.status == 200){
            console.log("Successfully updated the sender's phone number...");
          }
          this.setState({isWorking: false});
          this.pollSmsPhone();
          this.handleCloseDialog()
        })
        .catch(err => {
          console.log("Error");
          console.log(err);
          this.setState({isWorking: false});
        });
  }

  onChangeTextAddDialog(event){
    let new_val = event.target.value;
    if (this.state.alert_type == 'email')
      this.setState({txt_dialog: new_val, btn_dialog: validateEmail(new_val)});
    else{
      if (isNumeric(new_val.toString().slice(1))) this.setState({txt_dialog: new_val});
      this.setState({btn_dialog: validatePhone(new_val)});
    }
  }

  renderErrorMessage() {
    return (
      <div className="container container--space">
        <MessageBox error text={this.state.errorText} />
      </div>
    );
  }

  renderMainContent() {
    const { errorText, alert_emails, alert_sms } = this.state;
    if (errorText) return this.renderErrorMessage();
    if (this.state.b_loading) return <LoadingIndicator/>;

    const actions_delete = [
      <FlatButton
        label="CANCEL"
        primary={true}
        labelStyle={{color: blue900}}
        keyboardFocused={true}
        disabled={this.state.isWorking}
        onTouchTap={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        label="DELETE"
        primary={true}
        labelStyle={{color: blue900}}
        disabled={!this.state.btn_dialog || this.state.isWorking}
        onTouchTap={this.performDeleteAlert.bind(this)}
      />,
    ];

    const actions_add = [
      <FlatButton
        label="CANCEL"
        primary={true}
        labelStyle={{color: blue900}}
        keyboardFocused={true}
        disabled={this.state.isWorking}
        onTouchTap={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        label={(this.state.alert_type != 'sender_phone') ? "ADD" : "APPLY"}
        primary={true}
        labelStyle={{color: blue900}}
        disabled={!this.state.btn_dialog || this.state.isWorking}
        onTouchTap={this.performAddAlert.bind(this)}
      />,
    ];

    return (
      <div>
        <div style={{margin: 30}}>
          <h2><FontIcon className="material-icons" style={{margin: 5}}>alarm_on</FontIcon> Alerts </h2>
          <br/>
          <h3> Email Addresses <FontIcon className="material-icons" style={{margin: 5}} color={grey600}>email</FontIcon></h3>
          <Divider/>
          {alert_emails.length
            ?
            alert_emails.map((alert, i) => [
              <TextField value={alert} underlineFocusStyle={{color: blue900}}
                         floatingLabelFocusStyle={{color: blue900}}/>,
              <FlatButton
                style={{width:30}}
                labelStyle={{color: blue900}}
                onClick={() => this.handleDeleteAlert('email', i)}
                primary={true}
                icon={<FontIcon name={i} className="material-icons" style={iconStyles} color={red500}>delete_forever</FontIcon>}
              />,
              <br/>
            ])
            :
            <div> {/*Blank space*/}
              <br/>
              <br/>
            </div>
          }
          <FloatingActionButton mini={true} backgroundColor={blue900}
                                onTouchTap={() => this.openAddAlertModal('email')}>
            <FontIcon className="material-icons" color={yellow600}>add</FontIcon>
          </FloatingActionButton>

          <br/><br/><br/><br/>
          {(store.role === 'admin') &&
            <div>
              <h3> SMS Sender Phone Number</h3>
              <h4>Visit <a href="https://www.twilio.com"> twilio</a> and get sender's phone number</h4>
              <Divider />
              <div>
                <TextField value={this.state.sender_phone} underlineFocusStyle={{color: blue900}}
                           floatingLabelFocusStyle={{color: blue900}}/>
                <IconButton iconClassName="material-icons"
                            onClick={() => this.openAddAlertModal('sender_phone')}
                            tooltip="Edit">
                  edit
                </IconButton>
              </div>
              <br/><br/><br/><br/>
            </div>
          }
          <h3> SMS Phone Numbers <FontIcon className="material-icons" style={{margin: 5}} color={grey600}>sms</FontIcon> </h3>
          <Divider/>
          {alert_sms.map((sms, i) => [
            <TextField value={'+' + sms} underlineFocusStyle={{color: blue900}}
                       floatingLabelFocusStyle={{color: blue900}}/>,
            <FlatButton
              style={{width:30}}
              labelStyle={{color: blue900}}
              onClick={() => this.handleDeleteAlert('sms', i)}
              primary={true}
              icon={<FontIcon name={i} className="material-icons" style={iconStyles} color={red500}>delete_forever</FontIcon>}
            />,
            <br/>
          ])}
          <FloatingActionButton mini={true} backgroundColor={blue900}
                                onTouchTap={() => this.openAddAlertModal('sms')}>
            <FontIcon className="material-icons" color={yellow600}>add</FontIcon>
          </FloatingActionButton>
        </div>

        <Dialog
          title={`Delete Alert ${this.state.alert_type}`}
          actions={actions_delete}
          modal={true}
          open={this.state.open_delete_dialog}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <TextField
            hintText="Type 'DELETE' to confirm"
            floatingLabelText="Type 'DELETE' to confirm"
            value={this.state.txt_dialog}
            underlineFocusStyle={{color: blue900}}
            floatingLabelFocusStyle={{color: blue900}}
            onChange={this.onChangeTextDeleteDialog.bind(this)}
            disabled={this.state.isWorking}
          />
        </Dialog>

        <Dialog
          title={(this.state.alert_type != 'sender_phone') ? `Add Alert ${this.state.alert_type}` : `Edit SMS Sender's Phone #` }
          actions={actions_add}
          modal={true}
          open={this.state.open_add_dialog}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          <TextField
            hintText={`Input alert ${this.state.alert_type}`}
            floatingLabelText="Input here"
            value={this.state.txt_dialog}
            underlineFocusStyle={{color: blue900}}
            floatingLabelFocusStyle={{color: blue900}}
            onChange={this.onChangeTextAddDialog.bind(this)}
            disabled={this.state.isWorking}
          />
        </Dialog>

      </div>
    );
  }

  render() {
    return (
      <div>
        <NavBar showHomeButton />
        <AppBar style={{background: blue900}}
                iconElementLeft={<FontIcon className="material-icons" color={yellow600} style={{margin:10}}>settings</FontIcon>}
                title={<span style={{color: yellow600}}>Settings</span>}
        />
        {this.renderMainContent()}
      </div>
    );
  }
}
