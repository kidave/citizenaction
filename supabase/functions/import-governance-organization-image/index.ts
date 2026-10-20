import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchSocialImage } from "../_shared/social-image-import.ts";
const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"content-type":"application/json"}});}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(req.method!=="POST")return json({error:"POST required"},405);
 const auth=req.headers.get("Authorization");if(!auth)return json({error:"Authorization required"},401);
 const token=auth.replace(/^Bearer\s+/i,"");
 const userClient=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
 const adminClient=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
 const {data:authData,error:authError}=await userClient.auth.getUser(token);const userId=authData.user?.id;
 if(authError||!userId)return json({error:"Invalid authentication"},401);
 const {data:adminCheck,error:adminError}=await adminClient.from("profile").select("user_id").eq("role","admin").eq("user_id",userId).maybeSingle();
 if(adminError)return json({error:adminError.message},500);if(!adminCheck)return json({error:"Administrator access required"},403);
 let payload:{organizationId?:string;sourceUrl?:string};try{payload=await req.json();}catch{return json({error:"Invalid JSON body"},400);}
 const organizationId=String(payload.organizationId||"").trim(),sourceUrl=String(payload.sourceUrl||"").trim();
 if(!organizationId||!sourceUrl)return json({error:"organizationId and sourceUrl are required"},400);
 let parsed:URL;try{parsed=new URL(sourceUrl);}catch{return json({error:"Invalid image URL"},400);}
 const {data:organization,error:organizationError}=await adminClient.from("governance").select("id").eq("id",organizationId).maybeSingle();
 if(organizationError)return json({error:organizationError.message},500);if(!organization)return json({error:"Organization not found"},404);
 let image: { bytes: Uint8Array; contentType: string; extension: string };
 try {
   image = await fetchSocialImage(sourceUrl);
 } catch (error) {
   return json({ error: error instanceof Error ? error.message : "Unable to import image" }, 502);
 }
 const { bytes, contentType, extension } = image;
 const storagePath="governance/organization/"+organizationId+"/logo."+extension;
 const {error:uploadError}=await adminClient.storage.from("governance").upload(storagePath,bytes,{contentType,cacheControl:"3600",upsert:true});if(uploadError)return json({error:uploadError.message},500);
 const {data:publicUrlData}=adminClient.storage.from("governance").getPublicUrl(storagePath),imageUrl=publicUrlData?.publicUrl;if(!imageUrl)return json({error:"Image uploaded but public URL was unavailable"},500);
 return json({imageUrl:imageUrl+"?v="+Date.now(),storagePath,contentType});
});