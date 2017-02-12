import store from '../store';
import service from './service';

function getPools() {
  const { email } = store;
  return service.get(`/user/${email}/pools`);
}

function addPool(name, serialnumber) {
  const { email } = store;
  const body = {
    serialnumber,
    name
  };
  // console.log('Adding Pool device, name: ' + name + ', sn: ' + serialnumber);
  return service.post(`/user/${email}/pools`, body);
}

function setPoolState(serialNumber, state) {
  return service.post(`/pool/${serialNumber}`, { state: state.toString() });
}

function getPoolData(sn, alias, limit, alias_type, start_time, end_time) {
  const { email } = store;
  const body = {
    alias,
    limit,
    alias_type,
    start_time,
    end_time,
  };
  return service.post(`/user/${email}/get_pool/${sn}`, body);
}

function updatePoolData(sn, alias, action, value) {
  const { email } = store;
  const body = {
    alias,
    action,
    value
  };
  return service.post(`/user/${email}/update_pool/${sn}`, body);
}

function updatePoolName(serialnumber, pool_name) {
  const { email } = store;
  const body = {
    serialnumber,
    pool_name
  };
  return service.post(`/user/${email}/pool`, body);
}

function removePool(sn) {
  const { email } = store;
  return service.get(`/user/${email}/delete_pool/${sn}`);
}

function get_alert(alert_type) {
  const {email} = store;
  return service.get(`/user/${email}/alert/${alert_type}`);
}

function add_alert(alert_type, alert_value){
  const {email} = store;
  const body = { alert_value};
  return service.post(`/user/${email}/add_alert/${alert_type}`, body);
}

function delete_alert(alert_type, alert_value){
  const {email} = store;
  const body = { alert_value};
  return service.post(`/user/${email}/delete_alert/${alert_type}`, body);
}


function dismissAlert(serialnumber) {
  const { email } = store;
  const body = {
    serialnumber
  };
  return service.post(`/user/${email}/dismiss_alert`, body);
}

export default {
  addPool,
  getPools,
  setPoolState,
  getPoolData,
  updatePoolData,
  removePool,
  get_alert,
  add_alert,
  dismissAlert,
  delete_alert,
  updatePoolName
};
