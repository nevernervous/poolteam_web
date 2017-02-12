import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import React from 'react';
import MessageBox from './MessageBox';
import {blue900, yellow600} from 'material-ui/styles/colors';


const AddPoolForm = ({
  isAdding,
  formErrorText,
  nameProps,
  onAddPool,
  onCancel,
  serialNumberProps,
}) => (
  <form onSubmit={onAddPool}>
    {formErrorText && <MessageBox error text={formErrorText} />}
    <TextField
      autoFocus
      disabled={isAdding}
      floatingLabelFixed
      floatingLabelText="Name"
      underlineFocusStyle={{color: blue900}}
      floatingLabelFocusStyle={{color: blue900}}
      hintText="E.g. Living Room Lamp"
      {...nameProps}
    />
    <TextField
      disabled={isAdding}
      floatingLabelFixed
      floatingLabelText="Identity / Serial Number"
      hintText="E.g. abcde12345"
      underlineFocusStyle={{color: blue900}}
      floatingLabelFocusStyle={{color: blue900}}
      {...serialNumberProps}
    />
    <div className="dialog__actions">
      <FlatButton
        buttonStyle={{backgroundColor: yellow600}}
        labelStyle={{color: blue900}}
        disabled={isAdding} label="Cancel" onTouchTap={onCancel} primary />
      <RaisedButton
        buttonStyle={{backgroundColor: yellow600}}
        labelStyle={{color: blue900}}
        disabled={isAdding} label="Add" onTouchTap={onAddPool} primary>
        {isAdding && <LinearProgress color={blue900}/>}
      </RaisedButton>
    </div>
</form>
);

AddPoolForm.propTypes = {
  isAdding: React.PropTypes.bool,
  formErrorText: React.PropTypes.string,
  nameProps: React.PropTypes.object.isRequired,
  serialNumberProps: React.PropTypes.object.isRequired,
  onAddPool: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
};

export default AddPoolForm;
