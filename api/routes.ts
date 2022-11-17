import { Router, Application } from 'express';

// Controllers
import UserCtrl from './controllers/user.controller';
import BankCtrl from './controllers/bank.controller';
import CustomerCtrl from './controllers/customer.controller';
import EmployeeCtrl from './controllers/employee.controller';
import RoleCtrl from './controllers/role.controller';

// Middlewares
import auth from './middleware/auth.middleware';

const setRoutes = (app: Application): void => {
  const router = Router();
  const userCtrl = new UserCtrl();
  const bankCtrl = new BankCtrl();
  const customerCtrl = new CustomerCtrl();
  const employeeCtrl = new EmployeeCtrl();
  const roleCtrl = new RoleCtrl();

  // User
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user/changePassword').get(userCtrl.changePassword);
  router.route('/user').post(userCtrl.createUser);
  router.route('/user/customer').post(userCtrl.createUserCustommer);
  router.route('/user/employee').post(userCtrl.createUserEmployee);
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

  //Customer
  router.route('/customers').get(customerCtrl.getAll);
  router.route('/customers/count').get(customerCtrl.count);
  router.route('/customer/:id').get(customerCtrl.get);
  router.route('/customer').post(customerCtrl.insert);
  router.route('/customer/:id').put(customerCtrl.update);
  router.route('/customer/:id').delete(customerCtrl.delete);

  //Employee
  router.route('/employees').get(employeeCtrl.getAll);
  router.route('/employees/count').get(employeeCtrl.count);
  router.route('/employee/:id').get(employeeCtrl.get);
  router.route('/employee').post(employeeCtrl.insert);
  router.route('/employee/:id').put(employeeCtrl.update);
  router.route('/employee/:id').delete(employeeCtrl.delete);

  //Role
  router.route('/roles').get(roleCtrl.getAll);
  router.route('/roles/count').get(roleCtrl.count);
  router.route('/role/:id').get(roleCtrl.get);
  router.route('/role').post(roleCtrl.insert);
  router.route('/role/:id').put(roleCtrl.update);
  router.route('/role/:id').delete(roleCtrl.delete);

  // Login || Logout
  router.route('/login').get(userCtrl.login);
  router.route('/logout').get(userCtrl.logout);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
