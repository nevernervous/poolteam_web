import { ListItem } from 'material-ui/List';
import { black, grey400, white, yellow500 } from 'material-ui/styles/colors';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import React from 'react';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import {browserHistory} from 'react-router';
import FontIcon from 'material-ui/FontIcon';
import store from '../store';

const iconButtonElement = (
  <IconButton
    touch={true}
    tooltip="more"
    tooltipPosition="bottom-left"
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);

const PoolListItem = ({
  name,
  serialNumber,
  onTouchThis,
  onEditThis,
  onDeleteThis,
}) => (
  <ListItem
    onTouchTap={onTouchThis}
    leftAvatar={
      <img src="images/poolICON.png" width={40} height={40}/>
    }
    primaryText={name || '[unnamed]'}
    secondaryText={serialNumber}
    rightIconButton={
      <IconMenu iconButtonElement={iconButtonElement}>
        {store.role === 'admin' ?
          <MenuItem onTouchTap={onEditThis} leftIcon={<FontIcon className="material-icons">edit</FontIcon>}>EDIT</MenuItem>
          :
          null}
        <MenuItem onTouchTap={onDeleteThis} leftIcon={<FontIcon className="material-icons">delete</FontIcon>}>DELETE</MenuItem>
      </IconMenu>
    }
    rightIcon={<MoreVertIcon />}
  />
);

PoolListItem.propTypes = {
  name: React.PropTypes.string,
  serialNumber: React.PropTypes.string.isRequired,
  onTouchThis: React.PropTypes.func.isRequired,
  onEditThis: React.PropTypes.func,
  onDeleteThis: React.PropTypes.func,
};

export default PoolListItem;
