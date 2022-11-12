// Controllers
import BaseCtrl from './base';

// Models
import Bank from '../models/bank';

class BankCtrl extends BaseCtrl {
  model = Bank;
  table = 'Bank';
}

export default BankCtrl;
