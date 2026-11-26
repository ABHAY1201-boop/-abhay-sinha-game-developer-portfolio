require("dotenv").config();
const express=require("express"), helmet=require("helmet"), rateLimit=require("express-rate-limit");
const fs=require("fs/promises"), path=require("path"), crypto=require("crypto");
const app=express(), PORT=Number(process.env.PORT||3000), ROOT=__dirname;
const DATA=path.join(ROOT,"data"), STORE=path.join(DATA,"messages.json");
app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy:{directives:{
 defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","https://fonts.googleapis.com"],
 fontSrc:["'self'","https://fonts.gstatic.com"],imgSrc:["'self'","data:"],connectSrc:["'self'"],
 objectSrc:["'none'"],baseUri:["'self'"],frameAncestors:["'none'"]
}}}));
app.use(express.json({limit:"20kb"}));
const limiter=rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:"draft-7",legacyHeaders:false,
 message:{ok:false,error:"Too many messages. Please try again later."}});
async function ensureStore(){await fs.mkdir(DATA,{recursive:true});try{await fs.access(STORE)}catch{await fs.writeFile(STORE,"[]\n")}}
async function read(){await ensureStore();const x=JSON.parse(await fs.readFile(STORE,"utf8"));return Array.isArray(x)?x:[]}
async function write(x){const tmp=STORE+".tmp";await fs.writeFile(tmp,JSON.stringify(x,null,2)+"\n");await fs.rename(tmp,STORE)}
const clean=(v,n)=>String(v||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,n);
function admin(req,res,next){
 const secret=process.env.ADMIN_TOKEN||"", supplied=(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
 if(secret.length<24)return res.status(503).json({ok:false,error:"Admin token is not configured. Set ADMIN_TOKEN in .env."});
 const a=Buffer.from(secret),b=Buffer.from(supplied);
 if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({ok:false,error:"Invalid admin token."});
 next();
}
app.get("/api/health",(req,res)=>res.json({ok:true,service:"portfolio-api",time:new Date().toISOString()}));
app.post("/api/contact",limiter,async(req,res,next)=>{try{
 if(req.body.companyWebsite)return res.json({ok:true,message:"Thanks. Your message has been received."});
 const name=clean(req.body.name,80),email=clean(req.body.email,160).toLowerCase();
 const subject=clean(req.body.subject,120),message=String(req.body.message||"").trim().slice(0,4000);
 if(name.length<2)return res.status(400).json({ok:false,error:"Enter your name (at least 2 characters)."});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({ok:false,error:"Enter a valid email address."});
 if(subject.length<3)return res.status(400).json({ok:false,error:"Enter a subject (at least 3 characters)."});
 if(message.length<20)return res.status(400).json({ok:false,error:"Message must be at least 20 characters."});
 const items=await read();items.unshift({id:crypto.randomUUID(),name,email,subject,message,createdAt:new Date().toISOString(),read:false});
 await write(items);res.status(201).json({ok:true,message:"Thanks! Your message has been received."});
}catch(e){next(e)}});
app.get("/api/admin/messages",admin,async(req,res,next)=>{try{res.json({ok:true,messages:await read()})}catch(e){next(e)}});
app.patch("/api/admin/messages/:id/read",admin,async(req,res,next)=>{try{
 const items=await read(),item=items.find(x=>x.id===req.params.id);
 if(!item)return res.status(404).json({ok:false,error:"Message not found."});
 item.read=Boolean(req.body.read);await write(items);res.json({ok:true,message:item});
}catch(e){next(e)}});
app.delete("/api/admin/messages/:id",admin,async(req,res,next)=>{try{
 const items=await read(),nextItems=items.filter(x=>x.id!==req.params.id);
 if(items.length===nextItems.length)return res.status(404).json({ok:false,error:"Message not found."});
 await write(nextItems);res.json({ok:true});
}catch(e){next(e)}});
app.use(express.static(path.join(ROOT,"public"),{extensions:["html"]}));
app.get("*",(req,res)=>res.sendFile(path.join(ROOT,"public","index.html")));
app.use((e,req,res,next)=>{console.error(e);res.status(500).json({ok:false,error:"Server error. Please try again later."})});
ensureStore().then(()=>app.listen(PORT,()=>console.log(`Portfolio running at http://localhost:${PORT}`)))
.catch(e=>{console.error(e);process.exit(1)});
