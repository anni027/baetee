export async function GET(){return Response.json({open:false,reason:"Commission email delivery has not been configured."});}
export async function POST(){return Response.json({error:"Commission requests are not being accepted until email delivery is configured."},{status:503});}
