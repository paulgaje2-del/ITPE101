import {
 dashboardSummary as readDashboardSummary,
 findAllOrders,
 findOrderById,
 transitionOrderStatus
} from '../repositories/order.repository.js';
import {lowStockProducts} from '../repositories/product.repository.js';
import {canTransitionOrder} from '../models/order.model.js';
import {httpError} from '../utils/errors.js';

export function getDashboard(){
 return readDashboardSummary(lowStockProducts);
}

export function listAllOrders(){
 return findAllOrders();
}

export async function changeOrderStatus(id,nextStatus,actor){
 const current=await findOrderById(id);
 if(!current)throw httpError('Order not found.',404,'ORDER_NOT_FOUND');
 if(!canTransitionOrder(current.status,nextStatus)){
  throw httpError(`Cannot change ${current.status} to ${nextStatus}.`,409,'INVALID_TRANSITION');
 }
 const updated=await transitionOrderStatus(id,current.status,nextStatus,actor);
 if(!updated)throw httpError('Order status changed concurrently; reload and try again.',409,'ORDER_STATE_CHANGED');
 return updated;
}
