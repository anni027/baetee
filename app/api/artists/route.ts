import {getChatGPTUser} from '@/app/chatgpt-auth';
export const artistOwnerEmail='malikgilani10@gmail.com';
const noStore={'Cache-Control':'no-store'};
function reply(data:unknown,status=200){return Response.json(data,{status,headers:noStore});}
export async function GET(){const user=await getChatGPTUser();if(!user||user.email.toLowerCase()!==artistOwnerEmail)return reply({error:'Artist review is available to the BAETEE owner.'},403);return reply({applications:[]});}
export async function POST(request:Request){const user=await getChatGPTUser();if(!user)return reply({error:'Sign in to submit your artist application.'},401);return reply({error:'Artist applications are not available on this deployment.'},503);}
export async function PATCH(request:Request){const user=await getChatGPTUser();if(!user||user.email.toLowerCase()!==artistOwnerEmail)return reply({error:'Owner access required.'},403);return reply({error:'Artist review is not available on this deployment.'},503);}
