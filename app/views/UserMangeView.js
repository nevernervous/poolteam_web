import React from 'react';
import { hashHistory } from 'react-router';
import api from '../api';
import MessageBox from '../components/MessageBox';
import LoadingIndicator from '../components/LoadingIndicator';
import NavBar from '../components/NavBar';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar';
import {blue900, cyan50, cyan400, pink200, grey100} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import {yellow600, red500, lime500, pink400, grey400} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import store from '../store';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';


function getMuranoErrorText() {
  return `Murano Error: It appears this serial number was either not
    added as a device, this device was not activated, the product was
    not associated with this solution, or the device has not written
    to the platform.`;
}

function epoch_to_date(sec) {
  let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(sec);
  return d.toLocaleString()
}

function getStatus(code) {
  if (code == 1)
    return "Activated";
  else if (code == 0)
    return "Not Activated";
  else
    return "Disabled"
}


export default class UserMangeView extends React.Component {
  constructor(props) {
    super(props);

    let b_loading = false;
    let errorText = null;
    let users = {};
    let dlg_type = null;
    let dlg_text = '';
    let dlg_open_assign = false;
    let dlg_open_dismiss = false;
    let dlg_open_delete = false;
    let dlg_error = null;
    let dlg_b_button = false;
    let cur_user = {'name': ''};
    let cur_dev = {'name': ''};
    let isWorking = false;
    this.state = {
      b_loading,
      errorText,
      users,
      dlg_type,
      dlg_text,
      dlg_open_assign,
      dlg_open_dismiss,
      dlg_error,
      dlg_b_button,
      cur_user,
      cur_dev,
      isWorking,
      dlg_open_delete,
    };
  }
  componentWillMount() {
    this.mounted = true;
    this.pollUsers();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  pollUsers() {
    this.setState({b_loading: true});
    api.getAllUsers(store.email)
      .then(response => {
        console.log(response.payload);
        if (!this.mounted) return;
        // console.log(response.payload);
        if (response.status === 304) this.setState({ errorText: null, b_loading: false});
        else {
          this.setState({ errorText: null, b_loading: false, users: response.payload});
        }
      })
      .catch(err => {
        if (!this.mounted) return;
        this.setState({
          errorText: err.toString(),
          users: [],
          b_loading: false
        })
      });
  }

  performAction(){
    this.setState({isWorking: true});
    if (this.state.dlg_type == 'assign'){
      api.assignDeviceToUser(store.email, this.state.cur_user.id, this.state.dlg_text)
      .then(response => {
        let users = this.state.users;
        for (let i=0; i < users.length; i++)
          if (users[i].id == this.state.cur_user.id)
            if (users[i].devices.length > 0)
              users[i].devices.push({"name": response.payload, "sn": this.state.dlg_text});
            else
              users[i].devices = [{"name": response.payload, "sn": this.state.dlg_text}];
        this.setState({ dlg_error: null, isWorking: false, dlg_open_assign: false, users: users});
      })
      .catch(err => {
        this.setState({
          dlg_error: err.toString(),
          isWorking: false
        })
      });
    }
    else if (this.state.dlg_type == 'dismiss'){
      api.dismissDeviceFromUser(store.email, this.state.cur_user.id, this.state.cur_dev.sn)
      .then(response => {
        let users = this.state.users;
        if (response.payload == 'Ok'){
          for (let i=0; i < users.length; i++)
            if (users[i].id == this.state.cur_user.id)
              for (let j=0; j < users[i].devices.length; j++)
                if (users[i].devices[j].sn == this.state.cur_dev.sn)
                  users[i].devices.splice(j, 1);
        }
        this.setState({ dlg_error: null, isWorking: false, dlg_open_dismiss: false, users: users});
      })
      .catch(err => {
        this.setState({
          dlg_error: err.toString(),
          isWorking: false
        })
      });
    }
    else{
      console.log('Deleting', this.state.cur_user.id);
      api.deleteUser(this.state.cur_user.id)
      .then(response => {
        console.log(response.status);
        if (response.status == 200)
          this.pollUsers();
        this.setState({ dlg_error: null, isWorking: false, dlg_open_delete: false});
      })
      .catch(err => {
        this.setState({
          dlg_error: err.toString(),
          isWorking: false
        })
      });
    }
  }

  onChangeTextDialog(event){
    let new_val = event.target.value;
    this.setState({dlg_text: new_val});
    if (this.state.dlg_type == 'assign')
      this.setState({dlg_b_button : (new_val.length > 0)});
    else if (this.state.dlg_type == 'dismiss')
      this.setState({dlg_b_button : (new_val == 'DISMISS')});
    else
      this.setState({dlg_b_button : (new_val == 'DELETE')});
  }

  handleCloseDialog(){
    this.setState({dlg_open_assign: false, dlg_open_dismiss: false, dlg_open_delete: false})
  }

  handleBtnDismiss(cur_user, cur_dev){
    this.setState({cur_user: cur_user, cur_dev: cur_dev, dlg_open_dismiss: true, dlg_type:'dismiss', dlg_text: '', dlg_error: null})
  }

  handleBtnAssign(cur_user){
    this.setState({cur_user: cur_user, dlg_open_assign: true, dlg_type:'assign', dlg_text: '', dlg_error: null})
  }

  handleBtnDelete(cur_user){
    this.setState({cur_user: cur_user, dlg_open_delete: true, dlg_type:'delete', dlg_text: '', dlg_error: null})
  }

  renderErrorMessage() {
    return (
      <div className="container container--space">
        <MessageBox error text={this.state.errorText} />
      </div>
    );
  }

  renderMainContent() {
    const { errorText, users } = this.state;
    if (errorText) return this.renderErrorMessage();
    if (this.state.b_loading) return <LoadingIndicator/>;

    return (
      <div style={{margin: 10}}>
        {users.map((user, i) =>
          <Card style={{margin: 5}} key={i}>
            <CardHeader
              title={<span style={{fontSize: 20}}>{user.name}</span>}
              subtitle={user.role === 'admin' ? "Administrator" : "Guest"}
              actAsExpander={true}
              avatar={user.role === 'admin' ?
                <FontIcon className="material-icons" style={{margin: 5}} color={red500}>star</FontIcon>
                :
                <FontIcon className="material-icons" style={{margin: 5}} color={lime500}>person</FontIcon>
              }
              showExpandableButton={true} style={{background: grey100}}
            />
            <CardText expandable={true}>
              <span style={{fontSize: 18}}>User Details</span>
              <Divider/>
              <Table style={{marginLeft: 10, marginTop: 5}}>
                <TableBody displayRowCheckbox={false} selectable={false} stripedRows>
                  <TableRow>
                    <TableRowColumn style={{fontSize: 15}}>User Name</TableRowColumn>
                    <TableRowColumn style={{fontSize: 15}}>{user.name}</TableRowColumn>
                  </TableRow>
                  <TableRow>
                    <TableRowColumn style={{fontSize: 15}}>User email</TableRowColumn>
                    <TableRowColumn style={{fontSize: 15}}>{user.email}</TableRowColumn>
                  </TableRow>
                  <TableRow>
                    <TableRowColumn style={{fontSize: 15}}>Created</TableRowColumn>
                    <TableRowColumn style={{fontSize: 15}}>{epoch_to_date(user.creation_date)}</TableRowColumn>
                  </TableRow>
                  <TableRow>
                    <TableRowColumn style={{fontSize: 15}}>Status</TableRowColumn>
                    <TableRowColumn style={{fontSize: 15}}>{getStatus(user.status)}</TableRowColumn>
                  </TableRow>
                  <TableRow>
                    <TableRowColumn style={{fontSize: 15}}>User Role</TableRowColumn>
                    <TableRowColumn style={{fontSize: 15}}>{user.role === 'admin' ? "Administrator" : "Guest"}</TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
              {user.role === 'admin' ?
                null
                  :
                <div style={{marginTop: 20}}>
                  <span style={{fontSize: 18}}>Assigned Devices</span>
                  <List style={{marginTop: 5}}>
                    <Divider/>
                    {user.devices.length > 0 ?
                    user.devices.map((dev, i) =>
                      <div>
                        <ListItem key={i}
                                  rightIconButton={
                                    <IconButton tooltip="Dismiss"
                                                onTouchTap={(cur_user, cur_dev) => this.handleBtnDismiss(user, dev)}>
                                      <FontIcon className="material-icons" color={grey400}>cancel</FontIcon>
                                    </IconButton>}
                                  primaryText={dev.name}
                                  secondaryText={dev.sn}
                        />
                        <Divider/>
                      </div>
                    ): null}

                    <br/>
                    <FloatingActionButton mini={true}
                                          onTouchTap={(cur_user) => this.handleBtnAssign(user)}>
                      <ContentAdd />
                    </FloatingActionButton>
                  </List>
                </div>
              }
              <Divider/>
              <div style={{textAlign: 'right'}}>
                <FlatButton label="Delete User" secondary
                            icon={<FontIcon className="material-icons" color={pink400}>delete</FontIcon>}
                            disabled={store.email == user.email}
                            onTouchTap={(cur_user) => this.handleBtnDelete(user)}
                />
              </div>
            </CardText>
          </Card>
        )}
      </div>
    );
  }

  render() {
    const dialog_actions = [
      <FlatButton
        label="CANCEL"
        primary={true}
        keyboardFocused={true}
        disabled={this.state.isWorking}
        onTouchTap={() => this.handleCloseDialog()}
      />,
      <FlatButton
        label={this.state.dlg_type === 'assign' ? "ASSIGN" : (this.state.dlg_type === 'delete' ? "DELETE" : "DISMISS")}
        primary={true}
        disabled={!this.state.dlg_b_button || this.state.isWorking}
        onTouchTap={() => this.performAction()}
      />,
    ];

    return (
      <div>
        <NavBar showHomeButton />
        <AppBar style={{background: blue900}}
                iconElementLeft={<FontIcon className="material-icons" color={yellow600} style={{margin:10}}>people</FontIcon>}
                title={<span style={{color: yellow600}}>User Management</span>}
        />
        {this.renderMainContent()}

        <Dialog
          title={`Dismiss Device (${this.state.cur_dev.name}) from [${this.state.cur_user.name}]`}
          actions={dialog_actions}
          modal={true}
          open={this.state.dlg_open_dismiss}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          {this.state.dlg_error && <MessageBox error text={this.state.dlg_error} />}
          <TextField
            hintText="Type 'DISMISS' to confirm"
            floatingLabelText="Type 'DISMISS' to confirm"
            value={this.state.dlg_text}
            underlineFocusStyle={{color: blue900}}
            floatingLabelFocusStyle={{color: blue900}}
            onChange={this.onChangeTextDialog.bind(this)}
            disabled={this.state.isWorking}
          />
        </Dialog>

        <Dialog
          title={`Assign Device to [${this.state.cur_user.name}]`}
          actions={dialog_actions}
          modal={true}
          open={this.state.dlg_open_assign}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          {this.state.dlg_error && <MessageBox error text={this.state.dlg_error} />}
          <TextField
            hintText="Input Device Serial Number"
            floatingLabelText="Input Device Serial Number"
            value={this.state.dlg_text}
            underlineFocusStyle={{color: blue900}}
            floatingLabelFocusStyle={{color: blue900}}
            onChange={this.onChangeTextDialog.bind(this)}
            disabled={this.state.isWorking}
          />
        </Dialog>
        <Dialog
          title={`Delete [${this.state.cur_user.name}]`}
          actions={dialog_actions}
          modal={true}
          open={this.state.dlg_open_delete}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          {this.state.dlg_error && <MessageBox error text={this.state.dlg_error} />}
          <TextField
            hintText="DELETE"
            floatingLabelText="Type DELETE to confirm"
            value={this.state.dlg_text}
            underlineFocusStyle={{color: blue900}}
            floatingLabelFocusStyle={{color: blue900}}
            onChange={this.onChangeTextDialog.bind(this)}
            disabled={this.state.isWorking}
          />
        </Dialog>

      </div>
    );
  }
}


