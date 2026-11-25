export const ORDER_TRANSITIONS=Object.freeze({
 paid:['processing'],
 processing:['shipped'],
 shipped:['delivered'],
 pending_payment:['cancelled','expired']
});

export function canTransitionOrder(currentStatus,nextStatus){
 return (ORDER_TRANSITIONS[currentStatus]||[]).includes(nextStatus);
}
