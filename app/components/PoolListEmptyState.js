import RaisedButton from 'material-ui/RaisedButton';
import  React from 'react';
import store from '../store';


const PoolListEmptyState = ({ onAddPool }) => (
  <div style={{ textAlign: 'center', marginTop: 24 }}>
    {store.role === 'admin' ?
      <div>
        <h3>You don't have any Pool, please add POOL.</h3>
        <RaisedButton label="+ Add one" onTouchTap={onAddPool} primary style={{ marginTop: 16 }}/>
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
