import React from 'react';
import api from '../api';
import MessageBox from '../components/MessageBox';
import LoadingIndicator from '../components/LoadingIndicator';
import NavBar from '../components/NavBar';
import store from '../store';
import Sensor from '../components/Sensor';


// Special error for web developers to let them know something is wrong with
// their Murano configuration.
function getMuranoErrorText() {
  return `Murano Error: It appears this serial number was either not
    added as a device, this device was not activated, the product was
    not associated with this solution, or the device has not written
    to the platform.`;
}

export default class SensorView extends React.Component {
  constructor(props) {
    super(props);

    let pool = null;
    let errorText = null;
    if (store.pools) {
      pool = store.pools.filter(wall => wall.serialnumber == props.params.serialnumber)[0];
    }
    this.state = {
      errorText,
      pool,
    };
  }

  componentWillMount() {
    this.mounted = true;
    // this.pollSensorData();
  }

  componentWillUnmount() {
    this.mounted = false;
    // clearTimeout(this.state.timeoutId);
  }

  // pollSensorData() {
  //   api.getPoolData(this.props.params.serialnumber, this.props.params.alias, 10)    // get last 10 values
  //     .then(response => this.handlePoolApiResponse(response))
  //     .catch(err => {
  //       clearTimeout(this.state.timeoutId);
  //       if (!this.mounted) return;
  //       this.setState({
  //         errorText: err.toString(),
  //         values : null,
  //         pool: null,
  //         timeoutId: null,
  //       })
  //     });
  // }

  // handlePoolApiResponse(response) {
  //   if (!this.mounted) return;
  //   const timeoutId = setTimeout(() => this.pollSensorData(), 1000);
  //
  //   // console.log((response.payload));
  //   // console.log(this.props.params);
  //   if (response.status == 304) this.setState({ errorText: null, timeoutId });
  //   else this.setState({values: response.payload});
  // }

  handleSetPoolState(serialNumber, state) {
    // if (this.state.isChangingWallState) return; // no need to send off another request
    // this.setState({ isChangingWallState: true });
    // api.setPoolState(serialNumber, state)
    //   .then(() => this.setState({ isChangingWallState: false }))
    //   .catch(err => this.setState({ errorText: err.toString() }));
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

  renderMainContent() {
    const { errorText, pool } = this.state;
    if (errorText) return this.renderErrorMessage();
    if (pool == null) return this.renderErrorMessage();
    return (
      <Sensor sn={this.props.params.serialnumber} alias={this.props.params.alias} name={this.state.pool.name}/>
    );
  }

  render() {
    return (
      <div>
        <NavBar showHomeButton />
        {this.renderMainContent()}
      </div>
    );
  }
}
