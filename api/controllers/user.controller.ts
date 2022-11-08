import BaseCtrl from './base';
import User from '../models/user';

// import * as fs from 'fs';
// import * as path from 'path';
// import * as moment from 'moment';

class UserCtrl extends BaseCtrl {
  model = User;

}

export default UserCtrl;
