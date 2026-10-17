import {buildCuration,parseTrends,trendSource} from '@/lib/curation';
export const dynamic='force-dynamic';
let latest=null,inflight=null,nextAttempt=0;
async function refresh(){
 const response=await fetch(trendSource,{signal:AbortSignal.timeout(8000),headers:{Accept:'application/rss+xml, text/xml'},redirect:'manual',cache:'no-store'});
 if(!response.ok)throw new Error('Trend source unavailable '+response.status);
 const reader=response.body.getReader();let bytes=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>500000){await reader.cancel();throw new Error('Feed too large')}chunks.push(value)}
 const xml=new TextDecoder().decode(await new Blob(chunks).arrayBuffer());const trends=parseTrends(xml);if(!trends.length)throw new Error('Empty feed');latest=buildCuration(trends);return latest;
}
export async function GET(){
 const now=Date.now();if(now>=nextAttempt&&!inflight){nextAttempt=now+3600000;inflight=refresh().catch(error=>{console.warn('BAETEE trend refresh:',error.name,error.message);return latest||buildCuration([])}).finally(()=>{inflight=null})}
 const data=inflight?await inflight:latest||buildCuration([]);
 return Response.json({...data,stale:!!latest&&now-Date.parse(latest.fetchedAt)>2*3600000},{headers:{'Cache-Control':'private, max-age=900','X-Content-Type-Options':'nosniff'}});
}
