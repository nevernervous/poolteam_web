import React from 'react';
import api from '../api';
import {grey500 , cyan400, pink50 } from 'material-ui/styles/colors';
import MessageBox from '../components/MessageBox';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import LoadingIndicator from '../components/LoadingIndicator';
import LinearProgress from 'material-ui/LinearProgress';
import {Grid, Span} from 'react-responsive-grid';
import Divider from 'material-ui/Divider';


const styles = {
  title: {
    cursor: 'pointer',
  },
  appbar: {
    background: cyan400,
  },
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
};

function isNumeric(n) {
  return (!isNaN(parseFloat(n)) && isFinite(n)) || (n == '');
}

export default class SensorRule extends React.Component {

  constructor(props) {
    super(props);
    let errorText = null;
    let high_setpoint = '';
    let low_setpoint = '';
    let alert_high = '';
    let alert_low = '';
    let snackbar_open = false;
    let snackbar_text = '';
    let busy = false;
    let b_loaded = false;

    this.state = {
      errorText,
      high_setpoint,
      low_setpoint,
      alert_high,
      alert_low,
      snackbar_open,
      snackbar_text,
      busy,
      b_loaded,
    };
  }

  componentWillMount() {
    this.mounted = true;
    this.pollSensorData();
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.state.timeoutId);
  }

  pollSensorData() {
    let alias = this.props.alias + '_high_setpoint';
    api.getPoolData(this.props.sn, alias, 1, 'sensor')
      .then(response => {
        // console.log(response.payload);
        // sample response: [[14725465879, "53,4", "action", "mail"],]
        // console.log('High Setpoint:');
        // console.log(response.payload);
        let high_st = response.payload[0][1].split(',');
        this.setState({high_setpoint: high_st[0], alert_high: high_st[1]})
      })
      .catch(err => {
        this.setState({high_setpoint: null});
        console.log('Failed to get high_setpoint, err: ' + err);
      });

    alias = this.props.alias + '_low_setpoint';
    api.getPoolData(this.props.sn, alias, 1, 'sensor')
      .then(response => {
        // sample response: [[14725465879, "53,4", "action", "mail"],]
        // console.log(response.payload);
        let low_st = response.payload[0][1].split(',');
        this.setState({low_setpoint: low_st[0], alert_low: low_st[1]});
      })
      .catch(err => {
        this.setState({low_setpoint: null});
        console.log('Failed to get low_setpoint, err: ' + err);
      });
    this.setState({b_loaded: true})
  }

  renderErrorMessage() {
    return (
      <div className="container container--space">
        <MessageBox error text={this.state.errorText} />
      </div>
    );
  }

  updateSettings(){
    let alias = this.props.alias + '_high_setpoint';
    let high_sp = this.state.high_setpoint + ',' + this.state.alert_high;
    api.updatePoolData(this.props.sn, alias, "update_setpoint", high_sp)
      .then(response => {
        if (response.payload.status_code != 204){
          this.setState({
            snackbar_text: 'Failed to update high setpoint value',
            snackbar_open: true
          });
          return false;
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          snackbar_text: err,
          snackbar_open: true
        });
        return false
      });
    this.setState({busy: true});
    alias = this.props.alias + '_low_setpoint';
    let low_sp = this.state.low_setpoint + ',' + this.state.alert_low;
    api.updatePoolData(this.props.sn, alias, "update_setpoint", low_sp)
      .then(response => {
        if (response.payload.status_code == 204)
          this.setState({
            snackbar_text: 'Successfully updated',
            snackbar_open: true,
            busy: false
          });
        else{
          this.setState({
            snackbar_text: 'Failed to update Low setpoint value',
            snackbar_open: true,
            busy: false
          });
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          snackbar_text: err,
          snackbar_open: true,
          busy: false
        });
      });
  }

  onChangeHighSP(event){
    let new_val = event.target.value;
    if(isNumeric(new_val))
      this.setState({
        high_setpoint : new_val
      })
  }
  onChangeAlertHigh(event){
    let new_val = event.target.value;
    if(isNumeric(new_val))
      this.setState({ alert_high : new_val})
  }
  onChangeAlertLow(event){
    let new_val = event.target.value;
    if(isNumeric(new_val))
      this.setState({ alert_low : new_val})
  }

  onChangeLowSP(event){
    let new_val = event.target.value;
    if(isNumeric(new_val))
      this.setState({
        low_setpoint : new_val
      })
  }

  handleRequestSnackbarClose(){
    this.setState({
      snackbar_open: false,
    });
  };


  renderMainContent() {
    if (this.state.errorText) return this.renderErrorMessage();
    if (!this.state.b_loaded) return <LoadingIndicator />;
    return (
      <div>
        <Grid columns={window.innerWidth > 500 ? 2 : 1} style={{margin: 50}}>
          <Span columns={1} last={window.innerWidth < 500}>
            <h2>SetPoints</h2>
            <Divider/>
            <TextField
                      id="high_setpoint"
                      hintText="Input value here"
                      floatingLabelText="High Set Pt"
                      floatingLabelFixed={true}
                      onChange={this.onChangeHighSP.bind(this)}
                      disabled={this.state.busy}
                      value={this.state.high_setpoint}/>
            <TextField
                    id="low_setpoint"
                    hintText="Input value here"
                    floatingLabelText="Low Set Pt"
                    floatingLabelFixed={true}
                    onChange={this.onChangeLowSP.bind(this)}
                    disabled={this.state.busy}
                    value={this.state.low_setpoint}/>
            <br/><br/><br/>
          </Span>
          <Span columns={1} last>
            <h2>Alerts in minutes</h2>
            <Divider/>
            <TextField
                    floatingLabelText="High SetPoint Alert"
                    disabled={this.state.busy}
                    hintText="Input value here"
                    onChange={this.onChangeAlertHigh.bind(this)}
                    value={this.state.alert_high}
                    floatingLabelFixed={true}/>
            <TextField
                    floatingLabelText="Low SetPoint Alert"
                    disabled={this.state.busy}
                    hintText="Input value here"
                    onChange={this.onChangeAlertLow.bind(this)}
                    value={this.state.alert_low}
                    floatingLabelFixed={true}/>
          </Span>
        </Grid>
        <div style={{margin: 50}}>
          <RaisedButton
            label="Apply"
            primary={true}
            style={{margin: 12}}
            disabled={this.state.busy}
            onClick={this.updateSettings.bind(this)}>
            {this.state.busy && <LinearProgress />}
            </RaisedButton>
        </div>
        <Snackbar
          open={this.state.snackbar_open}
          message={this.state.snackbar_text}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestSnackbarClose.bind(this)}
        />
      </div>
    );
  }
  render() {
    return (
      <div>
        {this.renderMainContent()}
      </div>
    );
  }
}

SensorRule.propTypes = {
  sn: React.PropTypes.string.isRequired,
  alias: React.PropTypes.string.isRequired,
};

SensorRule.defaultProps = {
  sn : '000001',
  alias: 'PH',
};
