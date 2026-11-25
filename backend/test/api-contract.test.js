import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../src/app.js';

process.env.JWT_SECRET='soleva-api-test-secret';
const customerToken=jwt.sign({id:'customer-test-id',role:'customer'},process.env.JWT_SECRET);
const customerAuthorization=['Bearer',customerToken].join(' ');

test('health endpoint returns the standard success envelope',async()=>{
 const response=await request(app).get('/api/health');
 assert.equal(response.status,200);
 assert.equal(response.body.success,true);
 assert.equal(response.body.data.service,'SOLEVA API');
});

test('development client origin can make authentication requests',async()=>{
 const response=await request(app)
  .options('/api/v1/auth/login')
  .set('Origin','http://127.0.0.1:5173')
  .set('Access-Control-Request-Method','POST')
  .set('Access-Control-Request-Headers','content-type');
 assert.equal(response.status,204);
 assert.equal(response.headers['access-control-allow-origin'],'http://127.0.0.1:5173');
});

test('registration rejects malformed input before persistence',async()=>{
 const response=await request(app).post('/api/v1/auth/register').send({name:'',email:'not-an-email',password:'short'});
 assert.equal(response.status,422);
 assert.equal(response.body.error.code,'VALIDATION_ERROR');
 assert.ok(response.body.error.details.length>=1);
});

test('login rejects malformed email before persistence',async()=>{
 const response=await request(app).post('/api/v1/auth/login').send({email:'invalid',password:'password'});
 assert.equal(response.status,422);
 assert.equal(response.body.error.code,'VALIDATION_ERROR');
});

test('product detail rejects a malformed UUID',async()=>{
 const response=await request(app).get('/api/v1/products/not-a-uuid');
 assert.equal(response.status,422);
 assert.equal(response.body.error.code,'VALIDATION_ERROR');
});

test('checkout requires authentication',async()=>{
 const response=await request(app).post('/api/v1/checkout').send({});
 assert.equal(response.status,401);
 assert.equal(response.body.error.code,'UNAUTHENTICATED');
});

test('customer token cannot access the administrator dashboard',async()=>{
 const response=await request(app)
  .get('/api/v1/admin/dashboard')
  .set('Authorization',customerAuthorization);
 assert.equal(response.status,403);
 assert.equal(response.body.error.code,'FORBIDDEN');
});

test('product management list requires an administrator',async()=>{
 const anonymous=await request(app).get('/api/v1/admin/products');
 assert.equal(anonymous.status,401);
 assert.equal(anonymous.body.error.code,'UNAUTHENTICATED');
 const customer=await request(app)
  .get('/api/v1/admin/products')
  .set('Authorization',customerAuthorization);
 assert.equal(customer.status,403);
 assert.equal(customer.body.error.code,'FORBIDDEN');
});

test('shoe finder rejects an overlong request',async()=>{
 const response=await request(app)
  .post('/api/v1/ai/shoe-finder')
  .send({query:'x'.repeat(241)});
 assert.equal(response.status,422);
 assert.equal(response.body.error.code,'VALIDATION_ERROR');
});

test('payment webhook rejects an invalid signature',async()=>{
 const response=await request(app)
  .post('/api/v1/payments/webhook')
  .set('Content-Type','application/json')
  .set('x-maya-signature','invalid')
  .send('{"id":"test-event","status":"paid"}');
 assert.equal(response.status,401);
 assert.equal(response.body.error.code,'INVALID_WEBHOOK_SIGNATURE');
});
