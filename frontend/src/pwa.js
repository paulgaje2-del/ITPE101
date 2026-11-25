import {Capacitor} from '@capacitor/core';
import {registerSW} from 'virtual:pwa-register';

if(!Capacitor.isNativePlatform()){
 registerSW({immediate:true});
}
