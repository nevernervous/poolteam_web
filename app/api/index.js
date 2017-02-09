import auth from './auth';
import pool from './pool';
import service from './service';
import session from './session';
import admin from './admin';

export default {
  ...auth,
  ...pool,
  service,
  ...session,
  ...admin,
};
