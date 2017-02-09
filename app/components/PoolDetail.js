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
import { white, cyan400, pink50 } from 'material-ui/styles/colors';
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
  },
  appbar: {
    background: cyan400,
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
  solenoid,
  light,
  fertilizer,
  temperature,
  ec,
  ph,
  level,
  pressure,
  moisture,
  flow,
  leak,
  columns,
  b_listview,
  goto_solenoid,
  onChangeToggle,
}) => (
  <div>
    <AppBar style={styles.appbar}
      title={<h2 style={{marginTop:15}}><span style={styles.title}>{name}</span></h2>}
      iconElementLeft={<div style={{marginLeft: 20, marginTop: 5}}><img src="images/pool_icon.png"/></div>}
    />
    {
      (columns == 1) &&
        <div style={{margin: 30 }}>
          <Toggle toggled={b_listview} onToggle={onChangeToggle} labelPosition="right"
                  label={b_listview ? "List View" : "Icon View"}/>
        </div>
    }
    {/* Desktop Page*/}
    {
      (columns != 1  || !b_listview) ?
        <div>
          {/*//////  Outputs ////////////*/}
          <Grid columns={window.innerWidth > 500 ? 3 : 1} style={{margin: 10, marginLeft: 40, marginRight: 40}}>
            <Span columns={1}>
              <Paper zDepth={3} className="card card--wall card--small card--blue" onClick={goto_solenoid}>
                  <img src="images/pump.png" style={{marginBottom: 20}}/>
                  <p className="card__text--button">
                    { solenoid == '1' ? 'ON' : 'OFF'}
                  </p>
                  <p className="card__text--label">
                    Irrigation
                  </p>
                </Paper>
            </Span>
            <Span columns={1}>
              <Link to={`/pool/${sn}/output/Fertilizer`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <img src="images/fertilizer.png" style={{marginBottom: 10}}/>
                  <p className="card__text--button">
                    { fertilizer == '1' ? 'ON' : 'OFF'}
                  </p>
                  <p className="card__text--label">
                    Fertilizer Pump
                  </p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1} last={columns > 1}>
              <Link to={`/pool/${sn}/output/Light`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <Avatar size={64} backgroundColor={light == '1' ? yellow500 : grey300}
                          style={{position: 'relative', marginBottom: 20}}>
                    <LightBulbIcon style={{height: 40, width: 40}}/>
                  </Avatar>
                  <p className="card__text--button">
                    { light == '1' ? 'ON' : 'OFF'}
                  </p>
                  <p className="card__text--label">
                    Lights
                  </p>
                </Paper>
              </Link>
            </Span>
          </Grid>

          {/*/////// Sensors /////////*/}
          <Grid columns={columns} style={{margin: 20}}>
            <Span columns={1}>
              <Link to={`/pool/${sn}/sensor/Temperature`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns}
                           marks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} value={temperature}
                           ranges={[
                             {start: 0, end: 0.65, color: "#dd0000"},
                             {start: 0.65, end: 0.85, color: "#33dd33"},
                             {start: 0.85, end: 1, color: "#dd0000"}]
                           }
                  />
                  <p className="card__text--button">
                    {parseInt(temperature)}<span className="card__text--unit">°F</span>
                  </p>
                  <p className="card__text--label">Temperature</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1} last={columns == 2}>
              <Link to={`/pool/${sn}/sensor/PH`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
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
              </Link>
            </Span>
            <Span columns={1}>
              <Link to={`/pool/${sn}/sensor/Pressure`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 20, 40, 60, 80, 100, 120]} value={pressure}
                           ranges={[
                             {start: 0, end: 70 / 110, color: "#33dd33"},
                             {start: 70 / 110, end: 1, color: "#dd0000"}]
                           }
                  />
                  <p className="card__text--button">
                    { parseInt(pressure)}<span className="card__text--unit">PSI</span>
                  </p>
                  <p className="card__text--label">Water Pressure</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1} last>
              <Link to={`/pool/${sn}/sensor/EC`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 500, 1000, 1500, 2000, 2500, 3000]} value={ec}
                           ranges={[
                             {start: 0, end: 1600 / 3000, color: "#33dd33"},
                             {start: 1600 / 3000, end: 1, color: "#dd0000"}]
                           }
                  />
                  <p className="card__text--button">
                    {parseInt(ec)}<span className="card__text--unit">PPM</span>
                  </p>
                  <p className="card__text--label">EC</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1}>
              <Link to={`/pool/${sn}/sensor/Moisture`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 10, 20, 40, 60, 80, 100]} value={moisture}
                           ranges={[{start: 0, end: 1, color: "#666"},]}/>
                  <p className="card__text--button">
                    { parseInt(moisture)}<span className="card__text--unit">%</span>
                  </p>
                  <p className="card__text--label">Moisture</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1} last={columns == 2}>
              <Link to={`/pool/${sn}/sensor/Level`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 10, 20, 30, 40, 50]} value={level}
                           ranges={[{start: 0, end: 1, color: "#666"},]}/>
                  <p className="card__text--button">
                    { parseInt(level)}<span className="card__text--unit">Inch</span>
                  </p>
                  <p className="card__text--label">Water Level</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1}>
              <Link to={`/pool/${sn}/sensor/Leak`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 2000, 4000, 6000, 8000, 10000]} value={leak}
                           ranges={[
                             {start: 0, end: 7000 / 10000, color: "#dd0000"},
                             {start: 7000 / 10000, end: 9000 / 10000, color: "#FFFF33"},
                             {start: 9000 / 10000, end: 1, color: "#33dd33"}]
                           }
                  />
                  <p className="card__text--button">
                    { leak.toFixed()}
                  </p>
                  <p className="card__text--label">Leak</p>
                </Paper>
              </Link>
            </Span>
            <Span columns={1} last>
              <Link to={`/pool/${sn}/sensor/Flow`}>
                <Paper zDepth={3} className="card card--wall card--small card--blue">
                  <MyGauge columns={columns} marks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} value={flow}
                           ranges={[{start: 0, end: 1, color: "#666"},]}/>
                  <p className="card__text--button">
                    { flow.toFixed(1)}<span className="card__text--unit">GPM</span>
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
            <ListItem primaryText="Irrigation"
                      rightIcon={
                        <div style={{marginRight: 10, color: solenoid == '1' ? green800 : red400}}>
                          { solenoid == '1' ?"ON":"OFF"}
                        </div>
                      }
                      onClick={goto_solenoid}
              />
            <Divider/>
            <Link to={`/pool/${sn}/output/Fertilizer`}>
              <ListItem primaryText="Fertilizer Pump"
                        rightIcon={
                          <span style={{color: fertilizer == '1' ? green800 : red400}}>
                            { fertilizer == '1' ? 'ON' : 'OFF'}
                          </span>
                        }/>
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/output/Light`}>
              <ListItem primaryText="Lights"
                        rightIcon={
                          <span style={{color: fertilizer == '1' ? green800 : red400}}>
                            { light == '1' ? 'ON' : 'OFF'}
                          </span>
                        }/>
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Temperature`}>
              <ListItem primaryText="Temperature"
                        rightIcon={
                          <div style={{color: (65 < temperature && temperature < 85) ? green800 : red400}}>
                            {temperature.toFixed()}<span style={{fontSize:15, marginLeft:10}}>°F</span>
                          </div>
                        }/>
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/PH`}>
              <ListItem primaryText="PH"
                        rightIcon={
                          <div style={{color: (5.5 < ph && ph < 8.5) ? green800 : red400}}>
                            {ph.toFixed(1)}<span style={{fontSize:15, marginLeft:10}}>PH</span>
                          </div>
                        } />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Pressure`}>
              <ListItem primaryText="Water Pressure"
                        rightIcon={
                          <div style={{color: pressure < 70 ? green800 : red400}}>
                            {pressure.toFixed()}<span style={{fontSize:15, marginLeft:10}}>PSI</span>
                          </div>
                        } />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/EC`}>
              <ListItem primaryText="EC"
                        rightIcon={
                          <div style={{color: ec < 1600 ? green800 : red400}}>
                            {ec.toFixed()}<span style={{fontSize:15, marginLeft:10}}>PPM</span>
                          </div>
                        } />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Moisture`}>
              <ListItem primaryText="Moisture"
                        rightIcon={<div>{moisture.toFixed()}<span style={{fontSize:15, marginLeft:10}}>%</span></div>} />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Level`}>
              <ListItem primaryText="Water Level"
                        rightIcon={<div>{level.toFixed()}<span style={{fontSize:15, marginLeft:10}}>Inch</span></div>} />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Leak`}>
              <ListItem primaryText="Leak"
                        rightIcon={
                          <div style={{color: leak < 7000 ? red400 : (leak < 9000 ? yellow900 : green800)}}>
                            {parseInt(leak)}<span style={{fontSize:15, marginLeft:10}}></span>
                          </div>
                        } />
            </Link>
            <Divider/>
            <Link to={`/pool/${sn}/sensor/Flow`}>
              <ListItem primaryText="Flow"
                        rightIcon={<div>{flow.toFixed(1)}<span style={{fontSize:15, marginLeft:10}}>GPM</span></div>} />
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
  solenoid: React.PropTypes.number,
  light: React.PropTypes.number,
  fertilizer: React.PropTypes.number,
  temperature: React.PropTypes.number,
  ec: React.PropTypes.number,
  ph: React.PropTypes.number,
  level: React.PropTypes.number,
  pressure: React.PropTypes.number,
  moisture: React.PropTypes.number,
  flow: React.PropTypes.number,
  leak: React.PropTypes.number,
  goto_solenoid: React.PropTypes.func,
  b_listview: React.PropTypes.bool,
  onChangeToggle: React.PropTypes.func,
};

export default PoolDetail;
