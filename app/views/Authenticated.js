import CircularProgress from 'material-ui/CircularProgress';
import React from 'react';
import { hashHistory } from 'react-router';
import api from '../api';
import store from '../store';
import {blue900} from 'material-ui/styles/colors';

export default class Authenticated extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { isAuthenticated: !!(store.email && store.token) };
  }

  componentWillMount() {
    if (!this.isAuthenticated()) {
      api.restoreSession()
        .then(response => {
          this.setState({ isAuthenticated: true });
          store.email = response.payload.email;
          store.token = response.payload.token;
        })
        .catch(() => hashHistory.replace('/login'));
    }
  }

  isAuthenticated() {
    return this.state.isAuthenticated;
  }

  renderLoadingIndicator() {
    return (
      <div style={{ position: 'fixed', top: '50%', left: '50%', marginTop: -50, marginLeft: -50 }}>
        <CircularProgress size={2} color={blue900}/>
      </div>
    );
  }

  render() {
    if (!this.isAuthenticated()) return this.renderLoadingIndicator();
    return this.props.children;
  }
}

Authenticated.propTypes = {
  children: React.PropTypes.node.isRequired,
};
