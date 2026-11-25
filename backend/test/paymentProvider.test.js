import test from 'node:test';
import assert from 'node:assert/strict';
import {PaymentProvider,PayMongoProvider,MayaProvider,PaymentProviderFactory} from '../src/patterns/payment/payment-provider.js';

test('base payment provider rejects an unimplemented checkout operation',async()=>{await assert.rejects(()=>new PaymentProvider().createCheckout(),/must be implemented/)});
test('base payment provider rejects an unimplemented verification operation',async()=>{await assert.rejects(()=>new PaymentProvider().verifyPayment(),/must be implemented/)});
test('base payment provider rejects an unimplemented webhook operation',()=>{assert.throws(()=>new PaymentProvider().verifyWebhook(),/must be implemented/)});
test('factory creates Maya adapter by default',()=>{delete process.env.PAYMENT_PROVIDER;assert.ok(PaymentProviderFactory.create() instanceof MayaProvider)});
test('factory creates PayMongo adapter when selected',()=>{assert.ok(PaymentProviderFactory.create('paymongo') instanceof PayMongoProvider)});
test('factory creates Maya adapter when selected',()=>{assert.ok(PaymentProviderFactory.create('maya') instanceof MayaProvider)});
test('factory rejects unknown providers',()=>{assert.throws(()=>PaymentProviderFactory.create('unknown'),/Unsupported payment provider/)});
test('Maya checkout requires sandbox keys',async()=>{delete process.env.MAYA_PUBLIC_KEY;delete process.env.MAYA_SECRET_KEY;await assert.rejects(()=>new MayaProvider().createCheckout({_id:'1',shipping:{},user:{},items:[],subtotal:0,shippingFee:0,total:0}),/keys are not configured/)});
