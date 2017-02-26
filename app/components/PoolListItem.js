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
  pool,
  onDeleteThis,
}) => (
  <ListItem
    onTouchTap={onTouchThis}
    leftAvatar={
      <img src="images/poolICON.png" width={40} height={40}/>
    }
    primaryText={name || '[unnamed]'}
    secondaryText={
      <p>
        <span>{serialNumber}             </span>
        <span>Temp: </span>
        <span style={{color: black}}>{pool.Temperature}</span><span>°C              </span>
        <span>REDOX: </span>
        <span style={{color: black}}>{pool.ORP}</span><span>mV              </span>
        <span>Flow: </span>
        <span style={{color: black}}>{pool.Flow}</span><span>m3/Hr              </span>
      </p>
    }
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
  pool: React.PropTypes.object.isRequired,
};

export default PoolListItem;
