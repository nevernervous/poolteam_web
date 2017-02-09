import React from 'react';
import {lightBlue600 , cyan400, orange800 } from 'material-ui/styles/colors';
import { Link, withRouter } from 'react-router';
import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import SwipeableViews from 'react-swipeable-views';
import SensorData from '../components/SensorData';
import SensorRule from '../components/SensorRule'
import PoolHeader from '../components/PoolHeader';

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 10,
  },
  tabbar: {
    background: lightBlue600,
    fontSize: 20,
  }
};

export default class Sensor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      slideIndex: 0,
    };
  }

  handleChange(value){
    this.setState({
      slideIndex: value,
    });
  };

  render() {
    return (
      <div>
        <PoolHeader name={this.props.name} sn={this.props.sn} alias={this.props.alias}/>

        <div style={{margin:20}}>
          <Tabs onChange={this.handleChange.bind(this)} value={this.state.slideIndex}
                tabItemContainerStyle={styles.tabbar} inkBarStyle={{color:cyan400}}>
            <Tab icon={<FontIcon className="material-icons">timeline</FontIcon>} label="Data" value={0} >
            </Tab>
            <Tab icon={<FontIcon className="material-icons">beenhere</FontIcon>} label="Rules" value={1} >
            </Tab>
          </Tabs>
          <SwipeableViews index={this.state.slideIndex} onChangeIndex={this.handleChange}>
            <div style={styles.slide}>
              <SensorData sn={this.props.sn} alias={this.props.alias}/>
              {/*<div>Sensor Data</div>*/}
            </div>
            <div style={styles.slide}>
              <SensorRule sn={this.props.sn} alias={this.props.alias}/>
            </div>
          </SwipeableViews>
        </div>
      </div>
    );
  }
}

Sensor.propTypes = {
  sn: React.PropTypes.string.isRequired,
  alias: React.PropTypes.string.isRequired,
  name: React.PropTypes.string,
};

Sensor.defaultProps = {
  sn : '000001',
  alias: 'PH',
  name: ''
};
