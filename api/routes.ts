import { Router, Application } from 'express';

// Controllers
import UserCtrl from './controllers/user.controller';
import BankCtrl from './controllers/bank.controller';

const setRoutes = (app: Application): void => {
  const router = Router();
  const userCtrl = new UserCtrl();
  const bankCtrl = new BankCtrl();

  // User
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.createUser);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.delete);

  //Bank
  router.route('/banks').get(bankCtrl.getAll);
  router.route('/banks/count').get(bankCtrl.count);
  router.route('/bank/:id').get(bankCtrl.get);
  router.route('/bank').post(bankCtrl.insert);
  router.route('/bank/:id').put(bankCtrl.update);
  router.route('/bank/:id').delete(bankCtrl.delete);

  // Login
  router.route('/login').get(userCtrl.login);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
