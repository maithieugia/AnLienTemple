// Dev-only preview of the online entry screen without loading the temple (not in the public build).
// ?login=1 also opens the login card; ?p=60 sets how far the incense has burnt.
import {showEntry} from './online/EntryScreen';
const q=new URLSearchParams(location.search);
showEntry({quality:'high',choice:'auto',reasons:[]});
const w=window as unknown as {__entryDraw?:(p:number)=>void};setTimeout(()=>w.__entryDraw?.(Number(q.get('p')??55)),300);
if(q.has('login')){if(q.has('reg'))setTimeout(()=>document.querySelector<HTMLButtonElement>('[data-tab=register]')?.click(),1200);if(q.has('f'))setTimeout(()=>document.querySelector<HTMLButtonElement>('.sexes [data-f="1"]')?.click(),1800);}
