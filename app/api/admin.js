import service from './service';
import store from '../store';

export function assignDeviceToUser(email, user_id, serialnumber) {
  return service.post(`/admin/${email}/assign`, { user_id, serialnumber});
}

export function getAllUsers(email) {
  return service.get(`/admin/${email}/users`);
}

export function dismissDeviceFromUser(email, user_id, serialnumber) {
  return service.post(`/admin/${email}/dismiss`, { user_id, serialnumber});
}

export function getSmsPhone() {
  const { email } = store;
  return service.get(`/admin/${email}/sender_phone`);
}

export function setSmsPhone(sender_phone) {
  const { email } = store;
  return service.post(`/admin/${email}/sender_phone`, { sender_phone});
}

export function deleteUser(user_id) {
  const { email } = store;
  return service.post(`/admin/${email}/delete`, { user_id});
}

export default {
  getAllUsers,
  assignDeviceToUser,
  dismissDeviceFromUser,
  getSmsPhone,
  setSmsPhone,
  deleteUser,
}