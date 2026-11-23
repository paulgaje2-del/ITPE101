import 'dotenv/config';import bcrypt from 'bcryptjs';import {query,initializeDatabase,closeDatabase} from './db.js';import {createProduct} from './models/index.js';
const shoes=[
['AeroFlex Runner','Running','Lightweight everyday running shoe with breathable mesh and cushioned support.',2890,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900',28,[7,8,9,10,11],true],
['Court Classic Low','Lifestyle','A clean low-top silhouette for daily wear and weekend styling.',2490,'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900',19,[7,8,9,10],true],
['Velocity Pro','Running','Responsive training shoe designed for steady road sessions.',3590,'https://images.unsplash.com/photo-1539185441755-769473a23570?w=900',14,[7,8,9,10,11],true],
['StreetForm One','Lifestyle','Minimal street sneaker with a versatile neutral finish.',2190,'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900',22,[6,7,8,9,10],false],
['Summit Trail','Outdoor','Grippy outsole and supportive build for light trail adventures.',3990,'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900',12,[8,9,10,11],true],
['CloudStep Knit','Lifestyle','Soft knit upper and flexible cushioning for all-day comfort.',2790,'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900',17,[6,7,8,9,10],false],
['Court Ace','Basketball','Stable court shoe with ankle support and durable traction.',4290,'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900',9,[8,9,10,11,12],false],
['Tempo Lite','Running','A breathable daily trainer for walks, jogs, and gym sessions.',2590,'https://images.unsplash.com/photo-1539185441755-769473a23570?w=900',25,[7,8,9,10],false],
['Metro Leather','Lifestyle','Smart-casual leather sneaker with a refined profile.',3290,'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=900',8,[7,8,9,10],false],
['Sprint Junior','Kids','Comfortable everyday sneaker with easy fastening for active kids.',1690,'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=900',20,[1,2,3,4,5],false],
['Retro Court 82','Lifestyle','Retro-inspired court profile with a soft padded collar.',2990,'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900',16,[7,8,9,10,11],true],
['Endurance X','Running','Durable cushioned trainer for longer-distance comfort.',3890,'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900',11,[8,9,10,11],false],
['FlexMove Trainer','Training','Stable versatile footwear for gym circuits and strength work.',3190,'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=900',13,[7,8,9,10,11],false],
['Coastline Slide','Slides','Easy slip-on sandal with a contoured footbed.',990,'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=900',35,[6,7,8,9,10],false],
['Urban High','Lifestyle','High-top sneaker with a classic streetwear-inspired shape.',3490,'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900',7,[7,8,9,10],false],
['Pace Everyday','Running','Comfort-focused sneaker for daily walking and casual runs.',2390,'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=900',21,[7,8,9,10,11],false],
['Court Vision','Basketball','Responsive cushioning and multidirectional grip for court play.',3790,'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900',10,[8,9,10,11,12],false],
['Canvas Day','Lifestyle','Lightweight canvas sneaker for relaxed everyday outfits.',1490,'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900',24,[6,7,8,9,10],false],
['Peak Hiker','Outdoor','Supportive outdoor shoe with a rugged patterned outsole.',4490,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900',6,[8,9,10,11],false],
['Studio Balance','Training','Flexible cross-training shoe with a stable base.',2990,'https://images.unsplash.com/photo-1539185441755-769473a23570?w=900',15,[7,8,9,10],false]
];
try{
 await initializeDatabase();
 await query('DELETE FROM products');
 await query('DELETE FROM coupons');
 for(const s of shoes)await createProduct({name:s[0],category:s[1],description:s[2],price:s[3],image:s[4],stock:s[5],sizes:s[6],featured:s[7],colors:['Black','White','Stone'],material:'Mesh and synthetic blend',sport:s[1]});
 const password=await bcrypt.hash('Admin12345!',12);
 await query(`INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,'admin')
 ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password=EXCLUDED.password,role='admin',updated_at=now()`,
 ['SOLEVA Administrator','admin@soleva.test',password]);
 await query(`INSERT INTO coupons(code,type,value,min_spend,usage_limit,per_customer_limit,expires_at) VALUES
 ('WELCOME10','percent',10,1000,500,1,'2027-12-31'),
 ('SOLEVA200','fixed',200,2500,200,1,'2027-12-31'),
 ('RUN15','percent',15,3000,100,1,'2027-06-30')`);
 console.log('Seeded 20 shoes, demo admin, and 3 coupons in Supabase.');
}finally{await closeDatabase();}
