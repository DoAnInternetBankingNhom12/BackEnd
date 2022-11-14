// Controllers
import BaseCtrl from './base';

// Models
import Role from '../models/role';

class RoleCtrl extends BaseCtrl {
  model = Role;
  table = 'Role';
}

export default RoleCtrl;
