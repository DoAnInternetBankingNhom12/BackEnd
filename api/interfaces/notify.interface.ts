export interface Notify {
  type: 'create' | 'update' | 'delete' | 'notify' | 'info'; // create | update | delete | notify | info
  table: string;
  msg: string;
};