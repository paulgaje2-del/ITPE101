import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
 plugins:[
  react(),
  VitePWA({
   registerType:'autoUpdate',
   injectRegister:false,
   includeAssets:['favicon.svg'],
   manifest:{
    id:'/',
    name:'SOLEVA — Find Your Next Step',
    short_name:'SOLEVA',
    description:'Discover footwear for every move.',
    theme_color:'#171816',
    background_color:'#f8f8f5',
    display:'standalone',
    start_url:'/',
    scope:'/',
    categories:['shopping','lifestyle'],
    icons:[
     {
      src:'/favicon.svg',
      sizes:'any',
      type:'image/svg+xml',
      purpose:'any maskable'
     }
    ]
   }
  })
 ]
});
