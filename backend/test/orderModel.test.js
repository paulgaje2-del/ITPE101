import test from 'node:test';
import assert from 'node:assert/strict';
import {canTransitionOrder,ORDER_TRANSITIONS} from '../src/models/order.model.js';

test('paid orders can move to processing',()=>{
 assert.equal(canTransitionOrder('paid','processing'),true);
});

test('pending-payment orders can be cancelled but not shipped',()=>{
 assert.equal(canTransitionOrder('pending_payment','cancelled'),true);
 assert.equal(canTransitionOrder('pending_payment','shipped'),false);
});

test('delivered orders are terminal',()=>{
 assert.equal(canTransitionOrder('delivered','processing'),false);
 assert.equal(Object.hasOwn(ORDER_TRANSITIONS,'delivered'),false);
});
