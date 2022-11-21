import { Request, Response } from 'express';

// Models
import Receiver from '../models/receiver';

// Controllers
import BaseCtrl from './base';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { decodeBase64, isNull } from '../utils/utils';


class ReceiverCtrl extends BaseCtrl {
  model = Receiver;
  table = 'Receiver';
}

export default ReceiverCtrl;
