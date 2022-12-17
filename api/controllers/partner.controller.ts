import { Request, Response } from 'express';

// Utils
import * as http from 'http';
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull, getTokenPartner } from '../utils/utils';

class PartnerCtrl {
  // Get
  getRecipient = async (req: Request, res: Response) => {
    try {
      const stk = lodash.cloneDeep(req.params.stk);

      if (!stk) {
        return res.status(400).json({
          mgs: `No STK to get info!`,
          success: false
        });
      }

      let dataObj: any = await this.getInfoHttp(stk);

      if (!dataObj) {
        return res.status(200).json({
          mgs: `Get info STK ${stk} failed!`,
          success: false
        });
      }

      if(dataObj.status === 0 || dataObj.data === null) {
        return res.status(400).json({
          mgs: `Get info failed!`,
          err: dataObj.message,
          success: false
        });
      }

      delete dataObj.isSuccess;
      return res.status(200).json({
        mgs: `Get success!`,
        data: dataObj,
        success: false
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `test `,
        success: false,
        error: err
      });
    }
  };

  getInfoHttp(stk: string) {
    return new Promise((resolve) => {
      const time = moment().unix().toString();
      const options: http.RequestOptions = {
        headers: {
          Token: getTokenPartner(time, 'bank1'),
          Time: time
        }
      };

      http.get(`http://52.147.195.180:8091/api/External/ViewRecipientBySTK?STK=${stk}`, options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk.toString();
        });
        resp.on('end', () => {
          resolve(JSON.parse(data));
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        resolve(undefined);
      });
    });
  }

}

export default PartnerCtrl;
