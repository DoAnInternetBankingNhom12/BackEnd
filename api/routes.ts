import { Router, Application } from 'express';

// Controllers
import UserCtrl from './controllers/user.controller';
import BankCtrl from './controllers/bank.controller';
import CustomerCtrl from './controllers/customer.controller';
import EmployeeCtrl from './controllers/employee.controller';
import RoleCtrl from './controllers/role.controller';
import ReceiverCtrl from './controllers/receiver.controller';

// Middlewares
import auth from './middleware/auth.middleware';

const setRoutes = (app: Application): void => {
  const router = Router();
  const userCtrl = new UserCtrl();
  const bankCtrl = new BankCtrl();
  const customerCtrl = new CustomerCtrl();
  const employeeCtrl = new EmployeeCtrl();
  const roleCtrl = new RoleCtrl();
  const receiverCtrl = new ReceiverCtrl();

  // User
  router.route('/users').get(userCtrl.getAll);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user/changepws').post(userCtrl.changePassword);
  router.route('/user').post(userCtrl.createUser);
  router.route('/user/customer').post(userCtrl.createUserCustommer);
  router.route('/user/employee').post(userCtrl.createUserEmployee);
  router.route('/user/admin').post(userCtrl.createUserAdmin);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.deleteUser);

  // Bank
  router.route('/banks').get(bankCtrl.getAll);
  router.route('/banks/count').get(bankCtrl.count);
  router.route('/bank/:id').get(bankCtrl.get);
  router.route('/bank').post(bankCtrl.insert);
  router.route('/bank/:id').put(bankCtrl.update);
  router.route('/bank/:id').delete(bankCtrl.delete);

  // Customer
  router.route('/customers').get(customerCtrl.getAll);
  router.route('/customers/count').get(customerCtrl.count);
  router.route('/customer/:id').get(customerCtrl.get);
  router.route('/customer').post(customerCtrl.createCustomer);
  router.route('/customer/:id').put(customerCtrl.updateCustomer);
  router.route('/customer/:id').delete(customerCtrl.deleteCustomer);

  // Employee
  router.route('/employees').get(employeeCtrl.getAll);
  router.route('/employees/count').get(employeeCtrl.count);
  router.route('/employee/:id').get(employeeCtrl.get);
  router.route('/employee').post(employeeCtrl.createEmployee);
  router.route('/employee/:id').put(employeeCtrl.updateEmployee);
  router.route('/employee/:id').delete(employeeCtrl.deleteEmployee);

  // Role
  router.route('/roles').get(roleCtrl.getAll);
  router.route('/roles/count').get(roleCtrl.count);
  router.route('/role/:id').get(roleCtrl.get);
  router.route('/role').post(roleCtrl.insert);
  router.route('/role/:id').put(roleCtrl.update);
  router.route('/role/:id').delete(roleCtrl.delete);

  // // Receiver
  router.route('/receivers').get(receiverCtrl.getAll);
  router.route('/receivers/count').get(receiverCtrl.count);
  router.route('/receiver/:id').get(receiverCtrl.get);
  router.route('/receiver').post(receiverCtrl.createReceiver);
  router.route('/receiver/:id').put(receiverCtrl.updateReceiver);
  router.route('/receiver/:id').delete(receiverCtrl.delete);

  // Login || Logout
  router.route('/login').get(userCtrl.login);
  router.route('/loginrt').get(userCtrl.loginRT);
  router.route('/logout').get(userCtrl.logout);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
