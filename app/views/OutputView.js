import React from 'react';
import api from '../api';
import MessageBox from '../components/MessageBox';
import LoadingIndicator from '../components/LoadingIndicator';
import NavBar from '../components/NavBar';
import TextField from 'material-ui/TextField';
import {lightBlue600, cyan400, orange800, blue900, yellow600 } from 'material-ui/styles/colors';
import store from '../store';
import FontIcon from 'material-ui/FontIcon';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';
import {Grid, Span} from 'react-responsive-grid';
import Toggle from 'material-ui/Toggle';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import PoolHeader from '../components/PoolHeader';
import LinearProgress from 'material-ui/LinearProgress';
import TimePicker from 'material-ui/TimePicker';


function getMuranoErrorText() {
  return `Murano Error: Failed to get output value from Murano service. Please check internet connection or contact 
  customer support.`;
}

function isInteger(n) {
  return (!isNaN(parseInt(n)) && isFinite(n)) || (n == '');
}

export default class OutputView extends React.Component {
  constructor(props) {
    super(props);

    let errorText = null;
    let actions = null;
    let default_toggle = null;
    let defaultCheck = {"Mon": null, 'Tue': null, 'Wed': null, 'Thu': null, 'Fri': null, 'Sat': null, 'Sun': null};
    let start_time = null;
    let stop_time = null;
    let cycle = null;
    let delay = null;
    let busy = false;
    let table_data = null;
    let is_first = true;

    this.state = {
      errorText,
      default_toggle,
      defaultCheck,
      start_time,
      stop_time,
      cycle,
      delay,
      actions,
      busy,
      is_first,
      table_data,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.pollOutputData();
  }

  componentWillUnmount() {
    this.mounted = false;
    // clearTimeout(this.state.timeoutId);
  }

  pollOutputData() {
    console.log('Polling last status of output...');
    api.getPoolData(this.props.params.serialnumber, this.props.params.alias, 100, 'output')    // get last 100 values
      .then(response => this.handleOutputData(response))
      .catch(err => {
        // clearTimeout(this.state.timeoutId);
        if (!this.mounted) return;
        this.setState({
          errorText: err.toString(),
          default_toggle : null,
        })
      });
  }

  handleOutputData(response) {
    if (!this.mounted) return;
    // console.log('Output response: ');
    // console.log(response.payload);

    // Sample value: [[1480063394, "0", "user@user.com", "manual_output"], ]
    if (response.payload.length){
      let last_val = (response.payload)[0][1];
      if (response.status == 304){
        this.setState({ errorText: null });
        return
      }
      if (this.state.is_first){
        if (last_val == '1') this.setState({default_toggle: true});
        else this.setState({default_toggle: false});
        this.setState({is_first: false});
      }
      let buf = response.payload;
      for (var i = 0; i < buf.length; i++) {
        if (buf[i][1] == "1")
          buf[i][1] = "ON";
        else
          buf[i][1] = "OFF";
        if(buf[i][3] == "manual_output")
          buf[i][3] = "Manual Output";
      }

      // Filter output values with "action" field and store
      let manual_outputs = buf.filter(resp => resp[3] == "Manual Output");

      // Get timer data and parse them
      api.getPoolData(this.props.params.serialnumber, this.props.params.alias + '_timer', 100, 'sensor')    // get last value
        .then(response => this.handleTimerData(response, manual_outputs))
        .catch(err => {
          clearTimeout(this.state.timeoutId);
          if (!this.mounted) return;
          this.setState({
            errorText: err.toString(),
            start_time : null,
            stop_time: null,
            cycle: null,
            delay: null,
            // timeoutId: null
          })
        });

    }
    else{
      this.setState({errorText: getMuranoErrorText()})
    }

  }

  handleTimerData(response, manual_outputs) {
    if (!this.mounted) return;

    // const timeoutId = setTimeout(() => this.pollOutputData(), 1000);
    // Sample value: [[1480063394, "Days=Mon/Wed,Start=00:30,Stop=23:33,Cycle=70,Delay=12"], "user@user.com", "update_timer", ]
    // console.log('Timer response: ');
    // console.log(response.payload);

    if (response.payload.length){
      // Update timer fields
      // console.log(response.payload);
      let timer_val = (response.payload)[0][1].split(',');

      let days = timer_val[0].split('=')[1].split('/');
      if (days != null)
        if (days.length){
          let defaultCheck = this.state.defaultCheck;
          for (var i = 0; i < days.length; i++){
            defaultCheck[days[i]] = true
          }
          this.setState({defaultCheck: defaultCheck});
        }

      let tmp_time = new Date();
      let start_time = timer_val[1].split('=')[1];
      tmp_time.setHours(parseInt(start_time.split(':')[0]));
      tmp_time.setMinutes(parseInt(start_time.split(':')[1]));
      // this.setState({start_time: tmp_time});
      this.setState({start_time: start_time});

      let tmp_time1 = new Date();
      let stop_time = timer_val[2].split('=')[1];
      tmp_time1.setHours(parseInt(stop_time.split(':')[0]));
      tmp_time1.setMinutes(parseInt(stop_time.split(':')[1]));
      // this.setState({stop_time: tmp_time1});
      this.setState({stop_time: stop_time});

      let cycle = timer_val[3].split('=')[1];
      this.setState({cycle: cycle});

      let delay = timer_val[4].split('=')[1];
      this.setState({delay: delay});

      // Update table data
      let actions = manual_outputs;    // get manual_outputs
      // console.log("Manual outputs: ", actions);
      if (actions != null)
        if (actions.length){
          actions = actions.concat(response.payload.filter(tt => (tt[3] != "none" && tt[3] != null && tt.length == 4)));
        }
        else{
          actions = response.payload.filter(tt => (tt[3] != "none" && tt[3] != null && tt.length == 4));
        }

      if (actions != null)
        if (actions.length){
          actions.sort(function (a, b) {
            // sort by epoch timestamp
            return b[0] - a[0];
          });
          this.setState({table_data: actions})
        }
      // console.log('Actions: ', actions);
    }
    else{
      console.log('Warning, Timer is not set yet.');
      alert('Timer is not set yet.');
      this.setState({delay: 3})
    }
    this.setState({busy: false});
  }

  handleToggle(event, toggled){
    // this.setState({
          //   [event.target.name]: toggled,
          // });
    // Upload new value to exosite.
    this.setState({busy: true});
    let new_val = '0';
    if (toggled) new_val = '1';
    console.log("New val: ", new_val);
    api.updatePoolData(this.props.params.serialnumber, this.props.params.alias, "manual_output", new_val)
      .then(response => {
        if (response.payload.status_code != 204){
          console.log('Failed to change ' + this.props.params.alias + ' manually');
          console.log(response.payload);
          this.setState({busy: false});
          return false;
        }
        else{
          this.pollOutputData();
          this.setState({default_toggle: toggled});
        }
      })
      .catch(err => {
        console.log('Failed to change ' + this.props.params.alias + ' manually, http error.');
        console.log(err);
        this.setState({busy: false});
        return false
      });
  };

  handleCheck(event, checked){
    let checks = this.state.defaultCheck;
    checks[event.target.name] = checked;
    this.setState({[event.target.name]: checked, defaultCheck: checks});
    // console.log(this.state);
  }

  handleApply(){
    if (!isInteger(this.state.cycle)){
      alert('Please input integer value for Cycle.');
      return
    }
    if (!isInteger(this.state.delay)){
      alert('Please input integer value for Delay.');
      return
    }

    let days = '';
    for (var day in this.state.defaultCheck)
      if (this.state.defaultCheck[day])
        days = days + day + '/';
    if (days == ''){
      alert('At least one day should be enabled.');
      return
    }
    days = days.slice(0, -1);    // remove last '/'

    // let new_start = this.state.start_time.getHours() + ':' + this.state.start_time.getMinutes();
    // let new_stop = this.state.stop_time.getHours() + ':' + this.state.stop_time.getMinutes();
    let new_start = this.state.start_time;
    let new_stop = this.state.stop_time;

    if (!/^([0-1][0-9]|2[0-3]):([0-5][0-9])?$/.test(new_start)){
      alert("Invalid value of START TIME");
      return
    }
    if (!/^([0-1][0-9]|2[0-3]):([0-5][0-9])?$/.test(new_stop)){
      alert("Invalid value of STOP TIME");
      return
    }

    let tmp_start = new_start.split(":");
    let tmp_stop = new_stop.split(":");
    if (parseInt(tmp_start[0]) * 60 + parseInt(tmp_start[1]) >= parseInt(tmp_stop[0]) * 60 + parseInt(tmp_stop[1])){
      alert("Start time must be before the stop time.");
      return
    }

    if (parseInt(this.state.cycle) < parseInt(this.state.delay)){
      alert("Run Cycle should greater than Run Time");
      return
    }

    this.setState({busy: true});

    let req = 'Days=' + days + ',Start=' + new_start + ',Stop=' + new_stop +
      ',Cycle=' + this.state.cycle + ',Delay=' + this.state.delay;

    api.updatePoolData(this.props.params.serialnumber, this.props.params.alias + '_timer', "update_timer", req)
      .then(response => {
        if (response.payload.status_code != 204){
          alert('Failed to update new timer settings');
        }
        else{
          // alert('Successfully update.');
          this.pollOutputData();
        }
        this.setState({busy: false});
      })
      .catch(err => {
        console.log(err);
        alert('Failed to update new timer settings');
        this.setState({busy: false});
      });

  }

  onChangeTextInput(event){
    let new_val = event.target.value;
    this.setState({[event.target.name]: new_val});
  }

  onChangeTimer(event, date, target){
    this.setState({[target]: date})
  }
  renderErrorMessage() {
    return (
      <div className="container container--space">
        <MessageBox error text={this.state.errorText} />
      </div>
    );
  }

  renderMainContent() {

    if (this.state.errorText) return this.renderErrorMessage();
    if (this.state.default_toggle == null || this.state.delay == null) return <LoadingIndicator/>;

    let table_data = null;
    if (this.state.table_data != null)
      table_data = this.state.table_data.map((val) => {
        if (val.length > 0){
          let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
          d.setUTCSeconds(val[0]);
          let time_str = ("0"+(d.getMonth()+1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/"
            + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)
            + ":" + ("0" +  d.getSeconds()).slice(-2);
          return [time_str, val[1].replace("Delay", "Run Time").replace("Cycle", "Run Cycle"), val[2], val[3]]
        }
      });
    // console.log(table_data);
    return (
      <div>
        <div>
          <h1>{this.props.alias}</h1>
          <Grid columns={window.innerWidth > 500 ? 3 : 1} style={{margin: 20}}>
            <Span columns={window.innerWidth > 500 ? 3 : 1} last style={{justifyContent: 'center', display: 'flex', margin: 10}}>
              <div style={{width: '250px', justifyContent: 'center', display: 'flex'}}>
                <br/>
                <ListItem primaryText={"Manual Operation: "}
                          rightToggle={
                            <Toggle
                              name="toggle"
                              label={<span style={{fontSize: 18}}>{this.state.default_toggle ? 'ON' : 'OFF'}</span>}
                              onToggle={this.handleToggle.bind(this)}
                              style={{fontSize: 28}}
                              defaultToggled={this.state.default_toggle}
                              disabled={this.state.busy}
                              labelPosition={'right'}
                            />}
                />
              </div>
            </Span>
            <Span columns={1} last={window.innerWidth < 500} style={{margin: 10}}>
              <div>
                <h3>DAY OF WEEK</h3>
                <Divider/>
                <div>
                  <Checkbox
                    name="Mon"
                    label="Monday"
                    onCheck={this.handleCheck.bind(this)}
                    disabled={this.state.busy}
                    defaultChecked={this.state.defaultCheck.Mon}
                  />
                  <Checkbox
                    name="Tue"
                    label="Tuesday"
                    onCheck={this.handleCheck.bind(this)}
                    disabled={this.state.busy}
                    defaultChecked={this.state.defaultCheck.Tue}
                  />
                  <Checkbox
                    name="Wed"
                    label="Wednesday"
                    onCheck={this.handleCheck.bind(this)}
                    disabled={this.state.busy}
                    defaultChecked={this.state.defaultCheck.Wed}
                  />
                  <Checkbox
                    name="Thu"
                    label="Thursday"
                    onCheck={this.handleCheck.bind(this)}
                    disabled={this.state.busy}
                    defaultChecked={this.state.defaultCheck.Thu}
                  />
                  <Checkbox
                    name="Fri"
                    label="Friday"
                    onCheck={this.handleCheck.bind(this)}
                    disabled={this.state.busy}
                    defaultChecked={this.state.defaultCheck.Fri}
                  />
                  <Checkbox
                    name="Sat"
                    label="Saturday"
                    onCheck={this.handleCheck.bind(this)}
                    disabled={this.state.busy}
                    defaultChecked={this.state.defaultCheck.Sat}
                  />
                  <Checkbox
                    name="Sun"
                    label="Sunday"
                    onCheck={this.handleCheck.bind(this)}
                    disabled={this.state.busy}
                    defaultChecked={this.state.defaultCheck.Sun}
                  />
                </div>
                <Divider />
              </div>
            </Span>
            <Span columns={1} last={window.innerWidth < 500} style={{margin: 10}}>
              <h3>TIMER SETTINGS</h3>
              <Divider/>
              <Grid columns={window.innerWidth > 500 ? 2 : 1} style={{margin: 10}}>
                <Span columns={1} last={window.innerWidth < 500}>
                  {/*<TimePicker*/}
                    {/*name="start_time"*/}
                    {/*format="24hr"*/}
                    {/*floatingLabelText="Start Time"*/}
                    {/*value={this.state.start_time}*/}
                    {/*disabled={this.state.busy}*/}
                    {/*onChange={(event, date, target) => this.onChangeTimer(event, date, 'start_time')}*/}
                  {/*/>*/}
                  <TextField
                    name="start_time"
                    hintText="07:00"
                    underlineFocusStyle={{color: blue900}}
                    floatingLabelFocusStyle={{color: blue900}}
                    floatingLabelText="START TIME"
                    value={this.state.start_time}
                    disabled={this.state.busy}
                    style = {{width: 100}}
                    onChange={this.onChangeTextInput.bind(this)}
                    />
                </Span>
                <Span columns={1} last>
                  {/*<TimePicker*/}
                    {/*name="stop_time"*/}
                    {/*format="24hr"*/}
                    {/*floatingLabelText="Stop Time"*/}
                    {/*value={this.state.stop_time}*/}
                    {/*disabled={this.state.busy}*/}
                    {/*onChange={(event, date, target) => this.onChangeTimer(event, date, 'stop_time')}*/}
                  {/*/>*/}
                  <TextField
                    name="stop_time"
                    hintText="23:00"
                    style = {{width: 100}}
                    floatingLabelText="STOP TIME"
                    underlineFocusStyle={{color: blue900}}
                    floatingLabelFocusStyle={{color: blue900}}
                    value={this.state.stop_time}
                    disabled={this.state.busy}
                    onChange={this.onChangeTextInput.bind(this)}
                    />
                </Span>
                <Span columns={1} last={window.innerWidth < 500}>
                  <TextField
                    name="cycle"
                    hintText="60"
                    style = {{width: 150}}
                    underlineFocusStyle={{color: blue900}}
                    floatingLabelFocusStyle={{color: blue900}}
                    floatingLabelText="Run Cycle(seconds)"
                    value={this.state.cycle}
                    disabled={this.state.busy}
                    onChange={this.onChangeTextInput.bind(this)}
                  />
                </Span>
                <Span columns={1} last>
                  <TextField
                    name="delay"
                    hintText="60"
                    style = {{width: 150}}
                    floatingLabelText="Run Time(seconds)"
                    value={this.state.delay}
                    underlineFocusStyle={{color: blue900}}
                    floatingLabelFocusStyle={{color: blue900}}
                    disabled={this.state.busy}
                    onChange={this.onChangeTextInput.bind(this)}
                  />
                </Span>
              </Grid>
              <Divider/>
              <div style={{maxWidth: 250, overflow: 'hidden', margin: '20px auto 0'}}>
                <RaisedButton
                  label="APPLY"
                  primary={true}
                  buttonStyle={{backgroundColor: yellow600}}
                  labelStyle={{color: blue900}}
                  disabled={this.state.busy}
                  onTouchTap={this.handleApply.bind(this)}>
                  {this.state.busy && <LinearProgress color={blue900}/>}
                  </RaisedButton>
              </div>
              <br/>
              <br/>
            </Span>
            <Span columns={1} last={window.innerWidth < 500} style={{marginRight: 0, marginTop: 10}}>
              <h3>Timer Instruction</h3>
              <Divider/>
              <FontIcon className="material-icons" style={{margin: 5}} color={cyan400}>check</FontIcon>
              The timer will run on any day of the week that is checked
              <br/>
              <FontIcon className="material-icons" style={{margin: 5}} color={cyan400}>check</FontIcon>
              The timer will be active between the start time and stop times
              <br/>
              <FontIcon className="material-icons" style={{margin: 5}} color={cyan400}>check</FontIcon>
              Run Time is the amount of time (seconds) that the irrigation will be ON per Run Cycle (seconds)
            </Span>
            <Span columns={window.innerWidth > 500 ? 3 : 1} last style={{marginTop: 20}}>
              <h3>Actions</h3>
              <Divider/>
              <Table height={(table_data && table_data.length > 5) ? "300px" : 'inherit'} bodyStyle={{overflow:'visible'}}>
                <TableHeader displaySelectAll={false} style={{background: lightBlue600, fontSize: 20}}>
                  <TableRow>
                    <TableHeaderColumn width={145}>Timestamp</TableHeaderColumn>
                    <TableHeaderColumn width={160}>User</TableHeaderColumn>
                    <TableHeaderColumn width={160}>Action</TableHeaderColumn>
                    <TableHeaderColumn width={485}>Value</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                {table_data &&
                  <TableBody showRowHover stripedRows displayRowCheckbox={false}>
                    {table_data.map((row_data, i) =>
                      <TableRow key={i}>
                        <TableRowColumn width={180}>{row_data[0]}</TableRowColumn>
                        <TableRowColumn width={160}>{row_data[2]}</TableRowColumn>
                        <TableRowColumn width={160}>{row_data[3]}</TableRowColumn>
                        <TableRowColumn width={500}>{row_data[1]}</TableRowColumn>
                      </TableRow>
                    )}
                  </TableBody>
                }
              </Table>
            </Span>
          </Grid>
        </div>
      </div>
    );
  }
  render() {
    return(
      <div>
        <NavBar showHomeButton />
        <PoolHeader sn={this.props.params.serialnumber} alias={this.props.params.alias}/>
        {this.renderMainContent()}
      </div>
    )
  }
}

function epoch_to_date(sec, rfc) {
  let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(sec);
  let result = null;
  if (rfc == true)
    result = d;
  else
    if (window.innerWidth < 600)
      result = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    else
      result = d;
  return result
}
