/**
 * Abuse protection for the online temple (anh Thanh 2026-11-06: "bảo mật, chống hack, chống phá hệ thống … khi web viral").
 * Everything here is in-memory and cheap: token buckets, a failed-login tracker, a cap on concurrent password hashing,
 * per-IP connection counts and an emergency lockdown switch read from a file (no restart needed).
 */
import fs from 'node:fs';
import path from 'node:path';

/** Token bucket per key: `perMin` actions a minute, bursts up to `burst`. */
export class Limiter{
 private b=new Map<string,{n:number;t:number}>();private perMin:number;private burst:number;
 constructor(perMin:number,burst=perMin){this.perMin=perMin;this.burst=burst;setInterval(()=>{const old=Date.now()-600e3;for(const [k,v]of this.b)if(v.t<old)this.b.delete(k);},300e3).unref();}
 take(key:string,cost=1){const now=Date.now(),v=this.b.get(key)??{n:this.burst,t:now};v.n=Math.min(this.burst,v.n+(now-v.t)/60e3*this.perMin);v.t=now;
  if(v.n<cost){this.b.set(key,v);return false;}v.n-=cost;this.b.set(key,v);return true;}
}

/** Failed logins per account and per IP: after `max` failures in the window the account (or IP) waits. */
export class LoginGuard{
 private fails=new Map<string,{n:number;first:number;until:number}>();private max:number;private windowMs:number;private lockMs:number;
 constructor(max=8,windowMs=15*60e3,lockMs=15*60e3){this.max=max;this.windowMs=windowMs;this.lockMs=lockMs;setInterval(()=>{const now=Date.now();for(const [k,v]of this.fails)if(v.until<now&&now-v.first>this.windowMs)this.fails.delete(k);},300e3).unref();}
 /** Seconds to wait, 0 when allowed. */
 wait(key:string){const v=this.fails.get(key);return v&&v.until>Date.now()?Math.ceil((v.until-Date.now())/1000):0;}
 fail(key:string){const now=Date.now();let v=this.fails.get(key);if(!v||now-v.first>this.windowMs)v={n:0,first:now,until:0};v.n++;if(v.n>=this.max)v.until=now+this.lockMs;this.fails.set(key,v);}
 ok(key:string){this.fails.delete(key);}
}

/** At most `n` password hashes at once (scrypt is deliberately slow: a login flood must not eat the CPU). */
export class Gate{
 private busy=0;private n:number;constructor(n:number){this.n=n;}
 async run<T>(f:()=>T):Promise<T|null>{if(this.busy>=this.n)return null;this.busy++;try{await new Promise(r=>setImmediate(r));return f();}finally{this.busy--;}}
}

/** Counts live connections per IP. */
export class Conns{
 private m=new Map<string,number>();
 count(ip:string){return this.m.get(ip)??0;}
 add(ip:string){this.m.set(ip,this.count(ip)+1);}
 drop(ip:string){const n=this.count(ip)-1;if(n>0)this.m.set(ip,n);else this.m.delete(ip);}
}

/**
 * Emergency switches, edited by hand on the server while under attack (no restart): DATA_DIR/lockdown.json, e.g.
 * {"register":false,"join":false,"message":"Chùa tạm khoá cửa vài phút"}  — register: new accounts, join: entering the temple.
 */
export function lockdown(dataDir:string){
 const file=path.join(dataDir,'lockdown.json');let cur={register:true,join:true,message:''},mtime=0;
 const read=()=>{try{const st=fs.statSync(file);if(st.mtimeMs!==mtime){mtime=st.mtimeMs;const j=JSON.parse(fs.readFileSync(file,'utf8'));cur={register:j.register!==false,join:j.join!==false,message:String(j.message??'').slice(0,200)};console.log('lockdown',JSON.stringify(cur));}}
  catch{if(mtime){mtime=0;cur={register:true,join:true,message:''};console.log('lockdown lifted');}}};
 read();setInterval(read,3000).unref();
 return{get:()=>cur};
}
