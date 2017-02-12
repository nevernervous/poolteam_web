import React from 'react';
import api from '../api';
import {grey500 , cyan400, pink50 } from 'material-ui/styles/colors';
import LoadingIndicator from '../components/LoadingIndicator';
import MessageBox from '../components/MessageBox';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Chart} from 'react-google-charts';
import DatePicker from 'material-ui/DatePicker';
import FontIcon from 'material-ui/FontIcon';
import {cyan500} from 'material-ui/styles/colors';

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
  table: {
    fontSize: 30,
  }
};

export default class SensorData extends React.Component {

  constructor(props) {
    super(props);
    let errorText = null;
    let values = null;
    let start_time = null;
    let stop_time = null;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    this.state = {
      errorText,
      values,
      itemCount : 30,
      date: date,

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
    api.getPoolData(this.props.sn, this.props.alias,
      this.state.itemCount, 'sensor', this.state.start_time, this.state.end_time)
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
    // console.log(response);
    if (!this.mounted) return;
    // Re-draw every 10 sec
    const timeoutId = setTimeout(() => this.pollSensorData(), 10000);
    const val_list = response.payload;
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

  handleChangeDate(event, date){
    console.log(date);
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
    if (this.state.values == null) return <LoadingIndicator />;
    // Convert Epoch seconds value to date value
    // Sample value: [1480572566, "5.75", "", ""]   >>>>  [timestamp, value, user_mail, action]
    let chart_data = this.state.values.map((val) => {return [epoch_to_date(val[0], true), parseFloat(val[1])]});
    chart_data = [['Timestamp', this.props.alias], ].concat(chart_data);

    let table_data = this.state.values.map((val) => {return [epoch_to_date(val[0]).toString(), val[1]]});
    table_data = table_data.filter(dd => dd[1] != null);

    return (
      <div>
        <div style={{textAlign: 'right', marginLeft: 100}}>
          <table>
            <tr>
              <td>
                <FontIcon className="material-icons" style={{margin: 5}} color={cyan500}>date_range</FontIcon>
              </td>
              <td>
                <DatePicker floatingLabelText="Select date to display chart"
                            hintText="Today" defaultDate={this.state.date}
                            onChange={(event, date) => this.handleChangeDate(event, date)}/>
              </td>
            </tr>
          </table>
        </div>
        <div className={"my-pretty-chart-container"}>
          <Chart
            chartType="LineChart"
            data={chart_data}
            options={{}}
            graph_id="ScatterChart"
            width="100%"
            height="400px"
            legend_toggle
          />
          <br/>
        </div>
        <Table>
          <TableHeader displaySelectAll={false} style={{background: grey500}}>
            <TableRow>
              <TableHeaderColumn style={{fontSize: 20, width: '70%', textAlign:'center', paddingLeft: 0}}>Timestamp</TableHeaderColumn>
              <TableHeaderColumn style={{fontSize: 20, width: '30%', textAlign:'center', paddingLeft: 0}}>Reading</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover stripedRows displayRowCheckbox={false}>
            {table_data.map((row_data, i) =>
              <TableRow key={i}>
                <TableRowColumn style={{width: '70%', textAlign:'center'}}>{row_data[0]}</TableRowColumn>
                <TableRowColumn style={{width: '30%', textAlign:'center'}}>{row_data[1]}</TableRowColumn>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

SensorData.propTypes = {
  sn: React.PropTypes.string.isRequired,
  alias: React.PropTypes.string.isRequired,
};

SensorData.defaultProps = {
  sn : '000001',
  alias: 'PH',
};


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