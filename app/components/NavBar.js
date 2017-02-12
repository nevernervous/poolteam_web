import store from '../store';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { white, cyan400, blue900, yellow600 } from 'material-ui/styles/colors';
import HomeIcon from 'material-ui/svg-icons/action/home';
import ChevronLeftIcon from 'material-ui/svg-icons/navigation/chevron-left';
import React from 'react';
import { Link } from 'react-router';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import {List, ListItem} from 'material-ui/List';


export default class NavBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      menu_open: false,
    };
  }

  handleTouchTap(event){
    event.preventDefault();
    this.setState({
      menu_open: true,
      anchorEl: event.currentTarget,
    });
  };
  handleRequestClose(){
    this.setState({
      menu_open: false,
    });
  };

  handleRefresh(){
    this.forceUpdate();
  }

  handleFeedback(){
    // TODO: Add logic for feedback & help
    console.log(this.state)
  }

  render(){
    return (
    <AppBar
      showMenuIconButton={false}
      title={
        <div className="container container--nav-bar">
          {
            this.props.showHomeButton &&
            <RaisedButton
              containerElement={
                <Link to="/pools" />
              }
              icon={
                <div className="navbar__button-icon">
                  <ChevronLeftIcon color={yellow600} />
                  <HomeIcon color={yellow600} />
                </div>
              }
              buttonStyle={{backgroundColor: blue900}}
              labelStyle={{color: blue900}}
              primary={true}
              style={{ position: 'absolute', top: 14, left: 0 }}
            />
          }
          <div style={{marginTop: 10}}>
            <img className={window.innerWidth > 500 ? "logo" : "logo-small"} src="/images/poolteam_logo.jpg" />
          </div>

          <List style={{ position: 'absolute', top: 0, right: 0}}>
            <ListItem
                      primaryText={window.innerWidth > 700 ? store.name : <FontIcon className="material-icons">account_circle</FontIcon>}
                      rightIcon={<FontIcon className="material-icons">keyboard_arrow_down</FontIcon>}
                      onTouchTap={this.handleTouchTap.bind(this)}
            />
          </List>

          <Popover
            open={this.state.menu_open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={() => this.handleRequestClose()}
          >
            <List>
              {store.role === 'admin' ?
                <Link to="/user_manage">
                  <ListItem primaryText="User Management" onTouchTap={this.handleFeedback.bind(this)}
                          leftIcon={<FontIcon className="material-icons" color={blue900}>people</FontIcon>}/>
                </Link>
                :
                <ListItem primaryText="Help &amp; feedback" onTouchTap={this.handleFeedback.bind(this)}
                          leftIcon={<FontIcon className="material-icons" color={blue900}>feedback</FontIcon>}/>
              }
              <Link to="/pool/settings">
                <ListItem primaryText="Settings"
                          secondaryText={store.email}
                          leftIcon={<FontIcon className="material-icons" color={blue900}>settings</FontIcon>}/>
              </Link>
              <Link to="/logout">
                <ListItem primaryText="Logout"
                        leftIcon={<FontIcon className="material-icons" color={blue900}>exit_to_app</FontIcon>}/>
              </Link>
            </List>
          </Popover>
        </div>
        }
      />
    );
  }
}

// containerElement={
              {/*<Link to="/logout" />*/}
            // }

// className="navbar-menu"

NavBar.propTypes = {
  showHomeButton: React.PropTypes.bool
};

NavBar.defaultProps = {
  showHomeButton: false
};
