import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFinderRequest,rankFinderProducts} from '../src/services/shoe-finder-matching.js';

const catalog=[
 {id:'runner',name:'AeroFlex Runner',category:'Running',description:'Lightweight cushioned shoe for daily walking.',price:2890,sizes:[8,9,10],stock:8,featured:true},
 {id:'trail',name:'Summit Trail',category:'Outdoor',description:'Grippy shoe for hiking trails.',price:3990,sizes:[9,10],stock:4,featured:false},
 {id:'casual',name:'Court Classic Low',category:'Lifestyle',description:'Comfortable casual shoe for daily wear.',price:2490,sizes:[7,8],stock:12,featured:false},
 {id:'sold-out',name:'Old Runner',category:'Running',description:'Running shoe',price:1990,sizes:[9],stock:0,featured:true}
];

test('parses budget and US shoe size from a natural-language request',()=>{
 assert.deepEqual(parseFinderRequest('Walking shoes, size 9 under ₱3,000'),{
  maxPrice:3000,
  size:9,
  terms:['walking']
 });
});

test('filters by budget and size, then ranks relevant in-stock shoes',()=>{
 const matches=rankFinderProducts('walking shoes size 9 under ₱3,000',catalog);
 assert.deepEqual(matches.map(product=>product.id),['runner']);
});

test('returns no matches when inventory cannot satisfy the requested size',()=>{
 assert.deepEqual(rankFinderProducts('size 12',catalog),[]);
});

test('uses catalog ordering for budget-only requests and excludes sold-out products',()=>{
 const matches=rankFinderProducts('under ₱4,000',catalog);
 assert.deepEqual(matches.map(product=>product.id),['runner','trail','casual']);
});
