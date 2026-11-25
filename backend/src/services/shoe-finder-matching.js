const ignoredWords=new Set([
 'a','an','and','are','for','find','get','i','in','is','it','looking','me','my',
 'of','on','or','pair','please','shoe','shoes','some','that','the','to','want','with',
 'below','budget','less','maximum','max','price','size','under','up','within','us'
]);

const synonyms={
 casual:['lifestyle'],
 comfortable:['comfort','cushioned','support'],
 gym:['training'],
 hike:['outdoor','trail'],
 jogging:['running','runner'],
 walk:['walking'],
 workout:['training','gym']
};

export function parseFinderRequest(query){
 const normalized=query.toLowerCase().replace(/,/g,'');
 const sizeMatch=normalized.match(/\b(?:us\s*size|size|us)\s*(\d{1,2}(?:\.5)?)\b/);
 const budgetMatch=normalized.match(/(?:under|below|less than|maximum|max|budget|within|up to|<=|₱|php)\s*₱?\s*(\d{3,6})\b/)
  ||normalized.match(/\b(\d{3,6})\b/);
 const tokens=normalized.match(/[a-z]+/g)||[];
 const terms=[...new Set(tokens.filter(word=>word.length>2&&!ignoredWords.has(word)))];
 return {
  maxPrice:budgetMatch?Number(budgetMatch[1]):null,
  size:sizeMatch?Number(sizeMatch[1]):null,
  terms
 };
}

export function rankFinderProducts(query,products){
 const request=parseFinderRequest(query);
 return products
  .filter(product=>product.active!==false&&Number(product.stock)>0)
  .filter(product=>request.maxPrice===null||Number(product.price)<=request.maxPrice)
  .filter(product=>request.size===null||product.sizes?.some(size=>Number(size)===request.size))
  .map((product,index)=>{
   const searchable=[product.name,product.brand,product.category,product.description,product.material,product.sport]
    .filter(Boolean).join(' ').toLowerCase();
   const score=request.terms.reduce((total,term)=>{
    const alternatives=[term,...(synonyms[term]||[])];
    return total+(alternatives.some(word=>searchable.includes(word))?1:0);
   },0);
   return {product,score,index};
  })
  .sort((left,right)=>right.score-left.score||Number(right.product.featured)-Number(left.product.featured)||left.index-right.index)
  .map(item=>item.product);
}
