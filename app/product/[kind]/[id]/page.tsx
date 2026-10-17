import ProductView from '@/components/ProductView';
import {notFound,redirect} from 'next/navigation';
import {productFor} from '@/lib/catalog';
import ObjectView from '@/components/store/ObjectView';
import WearableView from '@/components/store/WearableView';
type Params=Promise<{kind:string,id:string}>;
export async function generateMetadata({params}:{params:Params}){
 const {kind,id}=await params;const product=productFor(kind,Number(id));
 return {title:product?('title' in product?product.title:product.name):'Collection'};
}
export default async function ProductPage({params}:{params:Params}){
 const {kind,id}=await params;
 if(kind==='object'&&id==='2')redirect('/product/sneaker/14');
 if(kind==='object'&&id==='3')redirect('/product/jacket/25');
 if(!/^[1-9]\d*$/.test(id)||!productFor(kind,Number(id)))notFound();
 if(kind==='object')return <ObjectView id={Number(id)}/>;
 if(kind==='jacket'||kind==='sneaker')return <WearableView kind={kind} id={Number(id)}/>;
 return <ProductView kind={kind} id={Number(id)}/>;
}
