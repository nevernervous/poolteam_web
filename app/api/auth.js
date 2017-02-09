import service from './service';

export function login(email, password) {
  return service.post('/session', { email, password });
}

export function signup(email, username, password) {
  return service.put(`/user/${email}`, { username, password });
}

export function request_recover(email) {
  return service.get(`/user/${email}/recover`);
}

export function reset_pwd(email, code, password) {
  return service.post(`/user/${email}/recover`, {code, password});
}

export default {
  login,
  signup,
  request_recover,
  reset_pwd,
};
