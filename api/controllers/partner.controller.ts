import { Request, Response } from 'express';

// Utils
import * as http from 'http';
import * as moment from 'moment';
import * as lodash from 'lodash';
import { getTokenPartner, encryptedStringST } from '../utils/utils';

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

      if (dataObj.status === 0 || dataObj.data === null) {
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

  transactionPartner = async (req: Request, res: Response) => {
    try {
      const dataTransaction = lodash.cloneDeep(req.body);
      console.log(dataTransaction);
      let data = await this.postTransactionHttp(dataTransaction);
      // if (!stk) {
      //   return res.status(400).json({
      //     mgs: `No STK to get info!`,
      //     success: false
      //   });
      // }

      // let dataObj: any = await this.getInfoHttp(stk);

      // if (!dataObj) {
      //   return res.status(200).json({
      //     mgs: `Get info STK ${stk} failed!`,
      //     success: false
      //   });
      // }

      // if (dataObj.status === 0 || dataObj.data === null) {
      //   return res.status(400).json({
      //     mgs: `Get info failed!`,
      //     err: dataObj.message,
      //     success: false
      //   });
      // }

      // delete dataObj.isSuccess;
      console.log('data', data);
      return res.status(200).json({
        mgs: `Get success!`,
        // data: dataObj,
        success: false
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `test `,
        success: false,
        error: err
      });
    }
  }

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

  private postTransactionHttp(objData: any) {
    return new Promise((resolve) => {
      const time = moment().unix().toString();
      const stringSignaturePartner = `${objData.send_STK}${objData.send_Money}${objData.receive_STK}`;
      const signaturePartner = encryptedStringST(stringSignaturePartner, 'bank1');
      const stringObj = JSON.stringify(objData);
      const options = {
        host: '52.147.195.180',
        port: '8091',
        path: '/api/External/ExternalTranfer',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(stringObj),
          Token: getTokenPartner(time, 'bank1'),
          Time: time,
          Signature: signaturePartner,
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      }).on('error', (err: any) => {
        console.log('Error: ' + err.message);
        resolve(undefined);
      });
      req.write(stringObj);
      req.end();
    });
  }

}

export default PartnerCtrl;
