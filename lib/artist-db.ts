import {env} from 'cloudflare:workers';
export function artistDb(){if(!env.DB)throw new Error('Artist application storage unavailable');return env.DB as D1Database;}
export const artistOwnerEmail='malikgilani10@gmail.com';
