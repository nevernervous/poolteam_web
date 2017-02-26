import React from 'react';
import PoolListItem from './PoolListItem';
import { withRouter } from 'react-router';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import api from '../api';
import {blue900} from 'material-ui/styles/colors';


class PoolListItemContainer extends React.Component {

  constructor(props) {
    super(props);

    let open_dialog = false;
    let txt_dialog = '';
    let btn_dialog = false;
    let isWorking = false;
    let action_type = null;
    this.state = {
      open_dialog,
      txt_dialog,
      btn_dialog,
      isWorking,
      action_type,
    };
  }

  onTouchPoolItem(){
    /*
    When user touches the whole Pool Item, move to its detailed page.
     */
    let serialnumber = this.props.pool.serialnumber;
    this.props.router.push('/pools/' + serialnumber);
  }

  handleCloseDialog(){
    this.setState({open_dialog: false, txt_dialog:''})
  }

  onEventDelete(){
    this.setState({open_dialog: true, action_type: 'delete'})
  }

  onEventEdit(){
    console.log(this.props.pool);
    this.setState({open_dialog: true, action_type: 'edit', txt_dialog: this.props.pool.name})
  }

  performAction(){
    this.setState({isWorking: true});
    if (this.state.action_type == 'delete'){
      api.removePool(this.props.pool.serialnumber)
        .then(response => {
          if (response.payload.status_code == 204){
            console.log("Successfully deleted...");
          }
          this.setState({isWorking: false});
          this.handleCloseDialog()
        })
        .catch(err => {
          console.log("Error");
          console.log(err.toString());
          this.setState({isWorking: false});
      });
    }
    else{
      api.updatePoolName(this.props.pool.serialnumber, this.state.txt_dialog)
        .then(response => {
          if (response.payload.status_code == 204){
            console.log("Successfully updated...");
          }
          this.setState({isWorking: false});
          this.handleCloseDialog()
        })
        .catch(err => {
          console.log("Error");
          console.log(err.toString());
          this.setState({isWorking: false});
      });
    }

  }

  onChangeTextDialog(event){
    let new_val = event.target.value;
    this.setState({txt_dialog: new_val});
    if (this.state.action_type == 'delete')
      if (new_val == 'DELETE'){
        this.setState({btn_dialog: true});
      }
      else {
        this.setState({btn_dialog: false});
      }
    else
      if (new_val.length > 0){
        this.setState({btn_dialog: true});
      }
      else {
        this.setState({btn_dialog: false});
      }
  }

  render() {
    const { name, serialnumber } = this.props.pool;
    const actions_dialog = [
      <FlatButton
        label="CANCEL"
        primary={true}
        keyboardFocused={true}
        labelStyle={{color: blue900}}
        disabled={this.state.isWorking}
        onTouchTap={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        label={this.state.action_type === 'delete' ? "DELETE" : "APPLY"}
        primary={true}
        labelStyle={{color: blue900}}
        disabled={!this.state.btn_dialog || this.state.isWorking}
        onTouchTap={this.performAction.bind(this)}
      />,
    ];

    return (
      <div>
        <PoolListItem
          name={name}
          serialNumber={serialnumber}
          pool={this.props.pool}
          onTouchThis={this.onTouchPoolItem.bind(this)}
          onDeleteThis={this.onEventDelete.bind(this)}
          onEditThis={this.onEventEdit.bind(this)}
        />
        <Dialog
          title={this.state.action_type === 'delete' ? "Delete Device" : "Device Name"}
          actions={actions_dialog}
          modal={false}
          open={this.state.open_dialog}
          onRequestClose={this.handleCloseDialog.bind(this)}
        >
          {this.state.action_type === 'delete' ?
            <div>WARNING: This action cannot be undone. The device {name} will be deleted permanently.</div>
            : <div>Change device name</div>}

          <br/>
          <TextField
            hintText={this.state.action_type === 'delete' ? "Type 'DELETE' to confirm" : "Device name"}
            floatingLabelText={this.state.action_type === 'delete' ? "Type 'DELETE' to confirm" : "Device name"}
            value={this.state.txt_dialog}
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

PoolListItemContainer.propTypes = {
  pool: React.PropTypes.object.isRequired,
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired
  })
};

export default withRouter(PoolListItemContainer)