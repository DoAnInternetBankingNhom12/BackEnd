// Controllers
import BaseCtrl from './base';

// Models
import Employee from '../models/employee';

class EmployeeCtrl extends BaseCtrl {
  model = Employee;
  table = 'Employee';
}

export default EmployeeCtrl;
