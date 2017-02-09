import React from 'react';
import { hashHistory, browserHistory } from 'react-router';
import api from '../api';
import MessageBox from '../components/MessageBox';
import PoolDetail from '../components/PoolDetail';
import LoadingIndicator from '../components/LoadingIndicator';
import NavBar from '../components/NavBar';
import store from '../store';
import RaisedButton from 'material-ui/RaisedButton';
import NotificationSystem from 'react-notification-system';
import { withRouter } from 'react-router';

// Special error for web developers to let them know something is wrong with
// their Murano configuration.
function getMuranoErrorText() {
  return `Murano Error: It appears this serial number was either not
    added as a device, this device was not activated, the product was
    not associated with this solution, or the device has not written
    to the platform.`;
}

class PoolView extends React.Component {
  constructor(props) {
    super(props);

    let pool = null;
    let errorText = null;
    let start_time = (new Date).getTime();
    if (store.pools) {
      pool = store.pools.filter(wall => wall.serialnumber == props.params.serialnumber)[0];
      if (pool && (pool.state === null || !pool.hasOwnProperty('state') || pool.state === "undefined")) {
        pool = null;
        errorText = getMuranoErrorText();
      }
    }

    let b_listview = false;

    this.state = {
      errorText,
      isChangingWallState: false,
      pool,
      start_time,
      b_listview,
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
    if (this.state.pool != null)
      if (this.state.pool.alert != null)
        this.refs['notificationSystem'].addNotification({
          title: 'Pool Notification',
          message: this.state.pool.alert,
          level: 'error',
          dismissible: false,
          position: 'br',
          autoDismiss: 0,
          action: {
            label: 'I Got It',
            callback: this.dismissNotify.bind(this),
          },
        });
  }

  dismissNotify(notification){
    api.dismissAlert(this.state.pool.serialnumber)()
      .then(response => {
        console.log(response.payload);
        notification.removeNotification(notification.uid);
      })
      .catch(err => {
        console.log('Failed to dismiss alert');
        console.log(err.toString());
      });
  }

  pollPools() {
    api.getPools()
      .then(response => this.handlePoolApiResponse(response))
      .catch(err => {
        clearTimeout(this.state.timeoutId);
        if (!this.mounted) return;
        this.setState({
          errorText: err.toString(),
          pool: null,
          timeoutId: null,
        })
      });
  }

  handlePoolApiResponse(response) {
    if (!this.mounted) return;
    const timeoutId = setTimeout(() => this.pollPools(), 1000);
    const { serialnumber } = this.props.params;
    const pools = response.payload;
    // console.log(pools);
    // console.log(this.state.pool);
    const pool = pools.filter(wall => wall.serialnumber == serialnumber)[0];
    if (!pool) return hashHistory.replace('/pools');
    if (response.status === 304)
      this.setState({
        errorText: null,
        timeoutId
      });
    else{
      this.setState({
        errorText: null, pool, timeoutId
      });
    }
  }

  /* called when we know there's an error message. It includes a little bit of
   * presentation but don't tell anybody */
  renderErrorMessage() {
    return (
      <div className="container container--space">
        <MessageBox error text={this.state.errorText} />
      </div>
    );
  }

  handleToggle(e){
    e.preventDefault();
    this.setState({b_listview: !this.state.b_listview});
  }

  handleGotoSolenoid(e){
    let url = "/pool/" + this.state.pool.serialnumber + "/output/Solenoid";
    e.preventDefault();
    if ((new Date).getTime() - this.state.start_time > 1000)
      this.props.router.push(url);
    else
      console.log('Ghost click is detected, ignoring...');
  }

  renderMainContent() {
    const { errorText, pool } = this.state;
    if (!pool) return <LoadingIndicator />;
    if (errorText) return this.renderErrorMessage();

    let columns = 4;
    if (window.innerWidth < 500) columns = 1;
    else if (window.innerWidth < 800) columns = 2;

    let solenoid = parseFloat(pool.Solenoid);
    let light = parseFloat(pool.Light);
    let fertilizer = parseFloat(pool.Fertilizer);
    let temperature = parseFloat(pool.Temperature);
    let ph = parseFloat(pool.PH);
    let ec = parseFloat(pool.EC);
    let leak = parseFloat(pool.Leak);
    let pressure = parseFloat(pool.Pressure);
    let flow = parseFloat(pool.Flow);
    let level = parseFloat(pool.Level);
    let moisture = parseFloat(pool.Moisture);

    return (
      <PoolDetail
        name = {pool.name}
        sn={pool.serialnumber}
        solenoid={solenoid}
        light={light}
        fertilizer={fertilizer}
        temperature={temperature}
        ph={ph}
        ec={ec}
        leak={leak}
        pressure={pressure}
        flow={flow}
        level={level}
        moisture={moisture}
        columns = {columns}
        b_listview={this.state.b_listview}
        onChangeToggle={(e) => this.handleToggle(e)}
        goto_solenoid={(e) => this.handleGotoSolenoid(e)}
      />
    );
  }

  render() {
    return (
      <div>
        <NavBar showHomeButton />
        {this.renderMainContent()}
        <NotificationSystem ref="notificationSystem"/>
      </div>
    );
  }
}

export default withRouter(PoolView);

PoolView.propTypes = {
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired
  }).isRequired
};