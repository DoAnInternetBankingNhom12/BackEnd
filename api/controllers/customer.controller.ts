// Controllers
import BaseCtrl from './base';

// Models
import Customer from '../models/customer';

class CustomerCtrl extends BaseCtrl {
  model = Customer;
  table = 'Customer';
}

export default CustomerCtrl;
