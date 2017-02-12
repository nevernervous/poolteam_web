import RaisedButton from 'material-ui/RaisedButton';
import  React from 'react';
import store from '../store';
import {yellow600, blue900} from 'material-ui/styles/colors';

const PoolListEmptyState = ({ onAddPool }) => (
  <div style={{ textAlign: 'center', marginTop: 24 }}>
    {store.role === 'admin' ?
      <div>
        <h3>You don't have any Pool, please add POOL.</h3>
        <RaisedButton
          buttonStyle={{backgroundColor: yellow600}}
          labelStyle={{color: blue900}}
          label="+ Add one" onTouchTap={onAddPool} primary style={{ marginTop: 16 }}/>
      </div>
      :
      <div>
        <h3>You don't have any Pool, please contact administrator to add Pool.</h3>
      </div>
    }

  </div>
);

PoolListEmptyState.propTypes = {
  onAddPool: React.PropTypes.func.isRequired,
};

export default PoolListEmptyState;
