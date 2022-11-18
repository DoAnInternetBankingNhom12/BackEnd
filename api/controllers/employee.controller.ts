// Controllers
import BaseCtrl from './base';

// Models
import Employee from '../models/employee';

// Utils
import * as moment from 'moment';

class EmployeeCtrl extends BaseCtrl {
  model = Employee;
  table = 'Employee';

  // Create

  createEmployeeByUser = async (user: any, accountType: 'employee' | 'admin') => {
    try {
      const id = await this.getId();
      const objEmployee: any = {
        id,
        idCustomer: user.id,
        name: user.name,
        phoneNumbers: user.phoneNumbers,
        accountType,
        createTime: moment().unix(),
        updateTime: moment().unix(),
        _status: true
      };

      const objData: any = await new this.model(objEmployee).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData._status = undefined;
      objData.createTime = undefined;
      objData.updateTime = undefined;

      return {
        data: objData,
        success: true
      }
    } catch (err: any) {

      if (err && err.code === 11000) {
        return {
          mgs: `Trùng dữ liệu ${Object.keys(err.keyValue)}`,
          success: false,
          code: 11000
        }
          ;
      }

      return {
        mgs: `Create customer id ${user.id} error!`,
        success: false,
        error: {
          mgs: err.message,
          code: 5000
        }
      };
    }
  };
}

export default EmployeeCtrl;
