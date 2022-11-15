import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';

// Models
import Customer from '../models/customer';

// Utils
import * as moment from 'moment';

class CustomerCtrl extends BaseCtrl {
  model = Customer;
  table = 'Customer';

  // Create
  createCustomerByUser = async (user: any) => {
    try {
      const id = await this.getId();
      let objCustomer: any = {
        id,
        idUser: user.id,
        name: user.name,
        accountBalance: 50000,
        paymentAccount: await this.getRDPaymentAccountNB(),
        createTime: moment().unix(),
        updateTime: moment().unix(),
        _status: true
      };

      const obj: any = await new this.model(objCustomer).save();
      obj.__v = undefined;
      obj._id = undefined;
      obj._status = undefined;
      obj.createTime = undefined;
      obj.updateTime = undefined;

      return obj;
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

  private async getRDPaymentAccountNB() {
    const min = 0;
    const max = 999999999999;
    let number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
    let showNumber: string = number.toString().padStart(12, '0');
    let idExist = await this.model.findOne({ paymentAccount: showNumber }).exec();

    do {
      number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
      showNumber = number.toString().padStart(12, '0');
      idExist = await this.model.findOne({ paymentAccount: showNumber }).exec();
    } while (idExist)

    showNumber = number.toString().padStart(12, '0').toString();
    return showNumber;
  }
}

export default CustomerCtrl;
