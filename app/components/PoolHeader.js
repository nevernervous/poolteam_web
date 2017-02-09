import React from 'react';
import { Link, withRouter} from 'react-router';
import {cyan400, white} from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  title_name: {
    cursor: 'pointer',
    fontSize: 25,
  },
  title_alias: {
    cursor: 'pointer',
    fontSize: 22,
  },
  appbar: {
    background: cyan400,
  },
};


class PoolHeader extends React.Component{
  constructor(props){
    super(props);
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleTouchTap(event){
    this.props.router.push('/pools/' + this.props.sn);
  }

  render() {
    return (
      <div>
        <AppBar style={styles.appbar}
          title={
            <h1 style={{marginTop:10}}>
              {this.props.name && <span style={styles.title_name}>{this.props.name} - </span>}
              <span style={styles.title_alias}>{this.props.alias}</span>
            </h1>
          }
          iconElementLeft={
            <div style={{marginLeft: 20, marginTop: 5}}>
              <IconButton tooltip="Back to Dashboard"
                          onTouchTap={this.handleTouchTap.bind(this)}>
                <FontIcon className="material-icons" color={white}>assignment_return</FontIcon>
              </IconButton>
            </div>
          }
        />
      </div>
    );
  }
}


PoolHeader.propTypes = {
  sn: React.PropTypes.string,
  alias: React.PropTypes.string,
  name: React.PropTypes.string,
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired
  })
};

PoolHeader.defaultProps = {
  sn : '000001',
  alias: 'PH',
};

export default withRouter(PoolHeader);