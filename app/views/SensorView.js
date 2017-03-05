import React from 'react';
import api from '../api';
import store from '../store';
import { Link, withRouter} from 'react-router';
import {grey500 , yellow500, white, blue900, blue800, blue600} from 'material-ui/styles/colors';
import LoadingIndicator from '../components/LoadingIndicator';
import NavBar from '../components/NavBar';
import MessageBox from '../components/MessageBox';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Chart} from 'react-google-charts';
import DatePicker from 'material-ui/DatePicker';
import FontIcon from 'material-ui/FontIcon';
import {Tabs, Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';


const styles = {
  title: {
    cursor: 'pointer',
  },
  appbar: {
    background: blue800,
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
  table: {
    fontSize: 30,
  },
  tabbar: {
    background: blue800,
    fontSize: 20,
  },
  title_name: {
    cursor: 'pointer',
    fontSize: 25,
    color: yellow500,
  },
  title_alias: {
    cursor: 'pointer',
    fontSize: 22,
    color: yellow500,
  },
};

function getMuranoErrorText() {
  return `Murano Error: It appears this serial number was either not
    added as a device, this device was not activated, the product was
    not associated with this solution, or the device has not written
    to the platform.`;
}

class SensorView extends React.Component {

  constructor(props) {
    super(props);
    let errorText = null;
    let values = null;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    let pool = null;
    const alias = props.params.alias;
    const serial_number = props.params.serialnumber;
    this.state = {
      errorText,
      values,
      itemCount : 30,
      date: date,
      alias,
      slideIndex: 0,
      pool,
      serial_number,
    };
  }

  handleChange(value){
    this.setState({
      slideIndex: value,
    });
  };

  componentWillMount() {
    this.mounted = true;
    this.pollSensorData();
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.state.timeoutId);
  }

  pollSensorData() {
    let start_time = this.state.date.toISOString();
    let tmp = new Date();
    tmp.setDate(this.state.date.getDate() + 1);
    tmp.setHours(0, 0, 0, 0);
    let end_time = tmp.toISOString();
    // console.log('Start time', start_time);
    // console.log('End time', end_time);
    let pool = null;
    if (store.pools) {
      pool = store.pools.filter(pool => pool.serialnumber == this.state.serial_number)[0];
      // console.log('pool', pool);
      this.setState({pool: pool});
      if (pool == null)
        this.setState({errorText: getMuranoErrorText()});
    }

    // console.log(this.state);

    api.getPoolData(pool.serialnumber, this.state.alias, start_time, end_time)
      .then(response => this.handlePoolApiResponse(response))
      .catch(err => {
        clearTimeout(this.state.timeoutId);
        if (!this.mounted) return;
        this.setState({
          errorText: err.toString(),
          values: null,
          timeoutId: null,
        })
      });
  }

  handlePoolApiResponse(response) {
    if (!this.mounted) return;
    // Re-draw every 10 sec
    const timeoutId = setTimeout(() => this.pollSensorData(), 10000);
    const val_list = response.payload;
    // console.log(val_list);
    if (response.status === 304)
      this.setState({
        errorText: null,
        timeoutId
      });
    else{
      this.setState({
        errorText: null,
        values: val_list,
        timeoutId
      });
    }
  }

  handleTouchHeader(event){
    this.props.router.push('/pools/' + this.props.sn);
  }

  handleChangeDate(event, date){
    this.setState({date: date, values: null});
    this.pollSensorData();
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
    let chart_data = null;
    let table_data = null;
    if (this.state.values != null){
      // Convert Epoch seconds value to date value
      // Sample value: [1480572566, "5.75", "", ""]   >>>>  [timestamp, value, user_mail, action]
      chart_data = this.state.values.map((val) => {return [epoch_to_date(val[0], true), parseFloat(val[1])]});
      chart_data = [['Timestamp', this.state.alias], ].concat(chart_data);
      table_data = this.state.values.map((val) => {return [epoch_to_date(val[0]).toString(), val[1]]});
      table_data = table_data.filter(dd => dd[1] != null);
    }

    // console.log(chart_data);
    // console.log(table_data);

    return (
      <div>
        <NavBar showHomeButton />
        <AppBar style={styles.appbar}
                title={
                  <h3 style={{marginTop:20}}>
                    {this.state.pool.name && <span style={styles.title_name}>{this.state.pool.name} - </span>}
                    <span style={styles.title_alias}>{this.state.alias}</span>
                  </h3>
                }
                iconElementLeft={
                  <div style={{marginLeft: 20, marginTop: 5}}>
                    <IconButton tooltip="Back to Dashboard"
                                onTouchTap={this.handleTouchHeader.bind(this)}>
                      <FontIcon className="material-icons" color={yellow500}>assignment_return</FontIcon>
                    </IconButton>
                  </div>
                }
                iconElementRight={
                  <div style={{textAlign: 'right', marginLeft: 100, marginRight: 50}}>
                    <table>
                      <tr>
                        <td>
                          <FontIcon className="material-icons" style={{margin: 5}} color={yellow500}>date_range</FontIcon>
                        </td>
                        <td>
                          <DatePicker inputStyle={{color: yellow500}}
                                      textFieldStyle={{width: 80}}
                                      hintText="Today" defaultDate={this.state.date}
                                      onChange={(event, date) => this.handleChangeDate(event, date)}/>
                        </td>
                      </tr>
                    </table>
                  </div>
                }
        />
        {this.state.values == null ? <LoadingIndicator/> :
          <div style={{margin: 20}}>
            <Tabs onChange={this.handleChange.bind(this)} value={this.state.slideIndex}
                  tabItemContainerStyle={styles.tabbar} inkBarStyle={{color: blue600}}>
              <Tab icon={<FontIcon className="material-icons">timeline</FontIcon>} label="Graph" value={0}>
              </Tab>
              <Tab icon={<FontIcon className="material-icons">list</FontIcon>} label="Table" value={1}>
              </Tab>
            </Tabs>
            <SwipeableViews index={this.state.slideIndex} onChangeIndex={this.handleChange}>
              <div style={styles.slide}>
                <div className={"my-pretty-chart-container"}>
                  {
                    chart_data.length > 1 ?
                      <Chart
                        chartType="LineChart"
                        data={chart_data}
                        options={{}}
                        graph_id="ScatterChart"
                        width="100%"
                        height="400px"
                        legend_toggle
                      />
                      :
                      <h3>No Data</h3>
                  }
                  <br/>
                </div>
              </div>
              <div style={styles.slide}>
                {table_data.length > 0 ?
                  <Table>
                    <TableHeader displaySelectAll={false} style={{background: grey500}}>
                      <TableRow>
                        <TableHeaderColumn
                          style={{
                            fontSize: 20,
                            width: '70%',
                            textAlign: 'center',
                            paddingLeft: 0
                          }}>Timestamp</TableHeaderColumn>
                        <TableHeaderColumn
                          style={{
                            fontSize: 20,
                            width: '30%',
                            textAlign: 'center',
                            paddingLeft: 0
                          }}>Reading</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody showRowHover stripedRows displayRowCheckbox={false}>
                      {table_data.map((row_data, i) =>
                        <TableRow key={i}>
                          <TableRowColumn style={{width: '70%', textAlign: 'center'}}>{row_data[0]}</TableRowColumn>
                          <TableRowColumn style={{width: '30%', textAlign: 'center'}}>{row_data[1]}</TableRowColumn>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  :
                  <h3>No Data</h3>
                }
              </div>
            </SwipeableViews>
          </div>
        }
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

export default withRouter(SensorView);