export function httpError(message,status,code){
 return Object.assign(new Error(message),{status,code});
}
