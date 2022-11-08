import BaseCtrl from './base';
import User from '../models/user';

class UserCtrl extends BaseCtrl {
  model = User;
  table = 'User';
}

export default UserCtrl;
