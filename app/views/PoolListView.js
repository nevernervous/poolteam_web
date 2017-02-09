import React from 'react';
import api from '../api';
import MessageBox from '../components/MessageBox';
import FAB from '../components/FAB';
import LoadingIndicator from '../components/LoadingIndicator';
import AddPoolModal from '../components/AddPoolModal';
import PoolList from '../components/PoolList';
import PoolListEmptyState from '../components/PoolListEmptyState';
import NavBar from '../components/NavBar';
import AppBar from 'material-ui/AppBar';
import store from '../store';
import {cyan400} from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import ChevronRightIcon from 'material-ui/svg-icons/navigation/chevron-right';
import { Link } from 'react-router';
import NotificationSystem from 'react-notification-system';

const HA_POLL_INTERVAL_MS = 1000;

export default class PoolListView extends React.Component {
  /**
   * constructor() is where you initialize the react state. By convention it is
   * the first method defined in any JavaScript class.
   */
  constructor(...args) {
    super(...args);

    this.state = {
      addingPoolErrorText: null,
      errorText: null,
      isAddingPool: false,
      isAddPoolModalOpen: false,
      pools: store.pools || null,
      timeoutId: null,
    };
  }
  componentWillMount() {
    this.mounted = true;
    this.pollPools();
  }
  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.state.timeoutId);
  }

  componentDidMount() {
    if (this.state.pools == null)
      return;
    let alert_msg = [];

    for (var i=0; i < this.state.pools.length; i++){
      let wall = this.state.pools[i];
      if (wall.alert != null)
        alert_msg.push({'device': wall.name, 'msg': wall.alert})
    }
    if (alert_msg.length > 0)
      this.refs['notificationSystem'].addNotification({
        title: 'Pool Notification',
        level: 'error',
        dismissible: false,
        autoDismiss: 0,
        position: 'br',
        uid: 100,
        children: (
          <div style={{margin:10}}>
            {
              alert_msg.map((a, i) =>
                <div>
                  <li>{a.device}</li>
                  <span style={{marginLeft: 15}}>{a.msg}</span>
                  <br/><br/>
                </div>
              )}
            <RaisedButton onTouchTap={this.dismissNotify.bind(this)}>I Got it</RaisedButton>
          </div>
        ),
      });
  }
  dismissNotify(){
    for (var i=0; i < this.state.pools.length; i++){
      if (this.state.pools[i].alert != null)
        api.dismissAlert(this.state.pools[i].serialnumber);
    }
    this.refs['notificationSystem'].removeNotification(100);
  }

  pollPools() {
    api.getPools()
      .then(response => {
        if (!this.mounted) return;
        const timeoutId = setTimeout(() => this.pollPools(), HA_POLL_INTERVAL_MS);
        if (response.status === 304) {
          this.setState({ timeoutId });
        } else {
          store.pools = response.payload;
          this.setState({
            pools: response.payload,
            timeoutId,
          });

        }
      })
      .catch(err => {
        clearTimeout(this.state.timeoutId);
        if (!this.mounted) return;
        store.pools = null;
        this.setState({
          errorText: err.toString(),
          pools: null,
          timeoutId: null,
        });
      });
  }

  /**
   * Set the state so this component re-renders and the modal opens
   */
  openAddPoolModal() {
    this.setState({ isAddPoolModalOpen: true });
  }

  /**
   * Set the state so the component re-renders and the modal closes
   */
  closeAddPoolModal() {
    this.setState({ isAddPoolModalOpen: false });
  }

  renderMainContent() {
    const { errorText, pools } = this.state;
    if (errorText) return <MessageBox error text={errorText} />;
    if (!pools) return <LoadingIndicator />;
    if (pools.length) return <PoolList pools={pools} />;
    return <PoolListEmptyState onAddPool={() => this.openAddPoolModal()} />;
  }

  render() {
    return (
      <div>
        <NavBar />
        <AppBar style={{background: cyan400}} title="My Pools" iconElementLeft={<span/>}/>
        <div className="container" style={{marginTop: 10}}>
          {this.renderMainContent()}
        </div>
        <AddPoolModal
          isOpen={this.state.isAddPoolModalOpen}
          isAdding={this.state.isAddingPool}
          onAdd={(name, serialNumber) => this.addPool(name, serialNumber)}
          onRequestClose={() => this.closeAddPoolModal()}
        />
        {store.role === 'admin' ? <FAB onTouchTap={() => this.openAddPoolModal()} /> : null}
        <NotificationSystem ref="notificationSystem"/>
      </div>
    );
  }
}
