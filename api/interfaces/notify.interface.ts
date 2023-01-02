export interface Notify {
  type: 'create' | 'update' | 'delete' | 'notify' | 'info' | 'cancelled' | 'pay'; // create | update | delete | notify | info
  table: string;
  msg: string;
  data?: any;
};