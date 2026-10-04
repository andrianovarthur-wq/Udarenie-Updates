import {config} from './config.js';
export const native=!!window.UdarenieNative;
export let updateState={status:'idle',message:'',version:config.version,progress:0};
export function checkUpdates(){if(native)window.UdarenieNative.checkUpdates();else navigator.serviceWorker?.getRegistration().then(reg=>reg?.update()).catch(()=>{});}
export function installUpdate(){if(native)window.UdarenieNative.installUpdate();}
window.addEventListener('native-update',event=>{updateState=event.detail;window.dispatchEvent(new Event('update-state'));});
if(!native&&'serviceWorker' in navigator){
 navigator.serviceWorker.register('./sw.js').then(reg=>{
  const notify=()=>{if(reg.waiting){updateState={status:'web-ready',message:'Новая версия готова. Ваш прогресс сохранится.'};window.dispatchEvent(new Event('update-state'));}};
  notify();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)notify();});});
 }).catch(()=>{});
 let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshing){refreshing=true;location.reload();}});
}
export async function applyWebUpdate(){const reg=await navigator.serviceWorker.getRegistration();reg?.waiting?.postMessage({type:'ACTIVATE_UPDATE'});}
