import { Router, Application } from 'express';

// Controllers
import UserCtrl from './controllers/user.controller';

const setRoutes = (app: Application): void => {
  const router = Router();
  const userCtrl = new UserCtrl();

  // User
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.createUser);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.delete);

  // Login
  router.route('/login').get(userCtrl.login);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
