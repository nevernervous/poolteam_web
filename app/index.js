import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory, IndexRedirect } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import App from './views/App';
import Authenticated from './views/Authenticated';
import LoginView from './views/LoginView';
import LogoutView from './views/LogoutView';
import SignupConfirmationView from './views/SignupConfirmationView';
import SignupView from './views/SignupView';
import PoolView from './views/PoolView';
import PoolListView from './views/PoolListView';
import SettingsView from './views/SettingsView';
import SensorView from './views/SensorView';
import OutputView from './views/OutputView';
import ResetPwdView from './views/ResetPwdView';
import UserMangeView from './views/UserMangeView';

require('./sass/styles.scss');

injectTapEventPlugin();

render(
  <Router history={hashHistory}>
    <Route path="" component={App}>
      <IndexRedirect to="/login" />
      <Route path='/login' component={LoginView} />
      <Route path='/logout' component={LogoutView} />
      <Route path='/signup' component={SignupView} />
      <Route path='/signup-confirmation' component={SignupConfirmationView} />
      <Route path='/reset/:email/:code' component={ResetPwdView}/>

      <Route path="/" component={Authenticated}>
        <IndexRedirect to="/pools" />
        <Route path="pools/:serialnumber" component={PoolView} />
        <Route path="pool/settings" component={SettingsView} />
        <Route path="pool/:serialnumber/sensor/:alias" component={SensorView} />
        <Route path="pool/:serialnumber/output/:alias" component={OutputView} />
        <Route path="pools" component={PoolListView} />
        <Route path="user_manage" component={UserMangeView} />
      </Route>
    </Route>
  </Router>,
  document.getElementById('app')
);
