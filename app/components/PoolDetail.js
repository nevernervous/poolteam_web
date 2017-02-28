import Avatar from 'material-ui/Avatar';
import CircularProgress from 'material-ui/CircularProgress';
import Paper from 'material-ui/Paper';
import { grey300, yellow500 } from 'material-ui/styles/colors';
import { yellow900, red400, green800 } from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import ChevronRightIcon from 'material-ui/svg-icons/navigation/chevron-right';
import Toggle from 'material-ui/Toggle';
import { white, cyan400, pink50, blue900 } from 'material-ui/styles/colors';
import {Grid, Span} from 'react-responsive-grid';
import { Link, browserHistory } from 'react-router';
import AppBar from 'material-ui/AppBar';
import MyGauge from './MyGauge';
import LightBulbIcon from 'material-ui/svg-icons/action/lightbulb-outline';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';


const styles = {
  title: {
    cursor: 'pointer',
    color: yellow500,
  },
  appbar: {
    background: blue900,
  },
};

function get_radius(cols) {
  if (cols == 4) return window.innerWidth/20;
  else if (cols == 2) return window.innerWidth / 10;
  else return window.innerWidth/6;
}

const PoolDetail = ({
  name,
  sn,
  temperature,
  orp,
  ph,
  flow,
  columns,
  b_listview,
  goto_ph,
  onChangeToggle,
}) => (
  <div>
    <AppBar style={styles.appbar}
      title={<h2 style={{marginTop:15, color: yellow500}}><span style={styles.title}>{name}</span></h2>}
      iconElementLeft={<div style={{marginLeft: 20, marginTop: 5}}><img src="images/poolICON.png" width={40} height={40}/></div>}
    />
    {
      (columns == 1) &&
        <div style={{margin: 30 }}>
          <Toggle toggled={b_listview} onToggle={onChangeToggle} labelPosition="right"
                  label={b_listview ? "List View" : "Icon View"}/>
        </div>
    }
    {
      (columns != 1  || !b_listview) ?
        <div>
          <Grid columns={columns} style={{margin: 40}}>
            <Span columns={1}>
              <Paper zDepth={3} className="card card--wall card--small card--blue" onClick={goto_ph}>
                  <MyGauge columns={columns} marks={[0, 2, 4, 6, 8, 10, 12, 14, 16]} value={ph}
                           ranges={[
                             {start: 0, end: 5.5 / 14, color: "#dd0000"},
                             {start: 5.5 / 14, end: 8.5 / 14, color: "#33dd33"},
                             {start: 8.5 / 14, end: 1, color: "#dd0000"}]
                           }
                  />
                  <p className="card__text--button">
                    { ph.toFixed(1)}
                  </p>
                  <p className="card__text--label">pH</p>
                </Paper>
            </Span>
            <Span columns={1} last={columns == 2}>
              <Link to={`/pool/${sn}/sensor/ORP`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 10, 200, 300, 400, 500, 600]} value={orp}
                           ranges={[
                             {start: 0, end: 200/600, color: "#dd0000"},
                             {start: 200/600, end: 400 / 600, color: "#33dd33"},
                             {start: 400 / 600, end: 1, color: "#dd0000"}]
                           }
                  />
                  <p className="card__text--button">
                    { parseInt(orp)}<span className="card__text--unit">mV</span>
                  </p>
                  <p className="card__text--label">Water Pressure</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1}>
              <Link to={`/pool/${sn}/sensor/Temperature`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns}
                           marks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} value={temperature}
                           ranges={[
                             {start: 0, end: 0.15, color: "#dd0000"},
                             {start: 0.15, end: 0.35, color: "#33dd33"},
                             {start: 0.35, end: 1, color: "#dd0000"}]
                           }
                  />
                  <p className="card__text--button">
                    {parseInt(temperature)}<span className="card__text--unit">°C</span>
                  </p>
                  <p className="card__text--label">Temperature</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1} last>
              <Link to={`/pool/${sn}/sensor/Flow`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} value={flow}
                           ranges={[{start: 0, end: 1, color: "#666"},]}/>
                  <p className="card__text--button">
                    { flow.toFixed(1)}<span className="card__text--unit">m3/Hr</span>
                  </p>
                  <p className="card__text--label">Flow</p>
                </Paper>
              </Link>
            </Span>
          </Grid>
        </div>
      :
        <div style={{margin: 10, marginRight: 60}}>
          <List>
            <Link to={`/pool/${sn}/sensor/pH`}>
              <ListItem primaryText="PH"
                        rightIcon={
                          <div style={{color: (5.5 < ph && ph < 8.5) ? green800 : red400}}>
                            {ph.toFixed(1)}<span style={{fontSize:15, marginLeft:10}}>PH</span>
                          </div>
                        } />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/ORP`}>
              <ListItem primaryText="REDOX"
                        rightIcon={
                          <div style={{color: orp < 3000 ? green800 : red400}}>
                            {orp.toFixed()}<span style={{fontSize:15, marginLeft:10}}>mV</span>
                          </div>
                        } />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Temperature`}>
              <ListItem primaryText="Temperature"
                        rightIcon={
                          <div style={{color: (20 < temperature && temperature < 35) ? green800 : red400}}>
                            {temperature.toFixed()}<span style={{fontSize:15, marginLeft:10}}>°C</span>
                          </div>
                        }/>
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Flow`}>
              <ListItem primaryText="Flow"
                        rightIcon={<div>{flow.toFixed(1)}<span style={{fontSize:15, marginLeft:10}}>m3/Hr</span></div>} />
            </Link>
            <Divider/>
          </List>
        </div>
    }
  </div>
);

PoolDetail.propTypes = {
  columns: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  sn: React.PropTypes.string.isRequired,
  temperature: React.PropTypes.number,
  ph: React.PropTypes.number,
  orp: React.PropTypes.number,
  flow: React.PropTypes.number,
  goto_ph: React.PropTypes.func,
  b_listview: React.PropTypes.bool,
  onChangeToggle: React.PropTypes.func,
};

export default PoolDetail;
