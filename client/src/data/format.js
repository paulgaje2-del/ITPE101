const pesoFormatter=new Intl.NumberFormat('en-PH',{
 style:'currency',
 currency:'PHP',
 maximumFractionDigits:0
});

export const formatMoney=value=>pesoFormatter.format(Number(value)||0);
