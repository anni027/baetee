import {getChatGPTUser} from '@/app/chatgpt-auth';
import {artistOwnerEmail} from '@/lib/artist-db';
import ArtistReview from '@/components/store/ArtistReview';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();if(!user||user.email.toLowerCase()!==artistOwnerEmail)return <main id="main" className="policy-page"><h1>Owner access required.</h1><p>Artist applications are private to the BAETEE owner.</p></main>;return <ArtistReview/>}
