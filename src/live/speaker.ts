import {enabled,type Snapshot} from './common';
import type {LiveEvent} from '../../live/model';
/** Only the control tab speaks. The OBS overlay is deliberately silent. */
export class LiveSpeaker{
 active=false;settings!:Snapshot['settings'];voiceURI=localStorage.getItem('an-lien-live-voice')||'';private queue:LiveEvent[]=[];private context?:AudioContext;private release?:()=>void;private utterance?:SpeechSynthesisUtterance;private watchdog=0;private disposed=false;private lease=false;private work=window.setInterval(()=>this.pump(),300);
 constructor(private report:(text:string,count:number)=>void){}
 voices(){return 'speechSynthesis'in window?speechSynthesis.getVoices():[];}
 async enable(){if(this.active||this.lease)return;this.lease=true;
  const run=async()=>{const hold=new Promise<void>(r=>this.release=r);this.active=true;try{this.context??=new AudioContext();await this.context.resume();if(!this.active)return;this.report('Âm thanh đã bật trong tab này.',this.queue.length);this.test();await hold;}finally{this.active=false;this.release=undefined;}};
  if(navigator.locks){void navigator.locks.request('an-lien-live-speaker',{ifAvailable:true},async lock=>{if(!lock){this.lease=false;this.report('Một tab điều khiển khác đang phát tiếng. Tắt tiếng tab đó trước.',0);return;}try{await run();}finally{this.lease=false;}}).catch(()=>{this.lease=false;this.report('Không mở được âm thanh. Thử bằng Chrome hoặc Edge.',0);});}else{this.lease=false;this.report('Trình duyệt không hỗ trợ khóa âm thanh. Chỉ mở một tab điều khiển.',0);await run();}
 }
 disable(){this.active=false;this.clear();this.release?.();this.release=undefined;this.lease=false;this.report('Đã tắt âm thanh.',0);}
 clear(){this.queue=[];clearTimeout(this.watchdog);this.utterance=undefined;if('speechSynthesis'in window)speechSynthesis.cancel();}
 enqueue(e:LiveEvent){if(!this.active||!e.announce||!enabled(e,this.settings))return;this.queue.push(e);if(this.queue.length>12)this.queue.shift();this.report('Đang chờ phát tên / bình luận.',this.queue.length);this.pump();}
 test(){this.enqueue({id:'audio-test',kind:'join',name:'Thiện hữu An Lạc',user:'audio-test',text:'',at:Date.now(),count:1,demo:true,announce:true,spoken:'Nam mô A Di Đà Phật. Hoan hỷ đón chào thiện hữu đến chùa An Liên.'});}
 private bell(){if(!this.context||!this.settings.chime)return;const ctx=this.context,at=ctx.currentTime;for(const f of [523.25,1046.5,1569.75]){const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.frequency.value=f;gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(this.settings.volume*.07+.0001,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+1.5);oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(at);oscillator.stop(at+1.6);}}
 private pump(){if(this.disposed||!this.active||this.utterance||!this.settings)return;
  while(this.queue.length&&(Date.now()-this.queue[0].at>25000||!enabled(this.queue[0],this.settings)||this.settings.blocked.includes(this.queue[0].user.toLowerCase())))this.queue.shift();
  const e=this.queue.shift();if(!e)return;this.bell();if(!('speechSynthesis'in window)){this.report('Trình duyệt không có đọc giọng nói; chuông vẫn hoạt động. Dùng Chrome/Edge để đọc tên.',this.queue.length);return;}
  const voices=this.voices(),voice=voices.find(v=>v.voiceURI===this.voiceURI)??voices.find(v=>v.lang.toLowerCase().startsWith('vi'));
  if(!voices.length){this.report('Chưa có giọng đọc hệ thống. Thêm giọng Tiếng Việt trong Windows rồi mở lại trình duyệt.',this.queue.length);return;}
  const u=new SpeechSynthesisUtterance(e.spoken);this.utterance=u;u.lang='vi-VN';if(voice)u.voice=voice;u.rate=this.settings.rate;u.volume=this.settings.volume;
  const finish=()=>{if(this.utterance!==u)return;clearTimeout(this.watchdog);this.utterance=undefined;this.report('Âm thanh sẵn sàng.',this.queue.length);};u.onend=finish;u.onerror=()=>{if(this.utterance!==u||!this.active)return;finish();this.report('Giọng đọc bị chặn hoặc chưa sẵn sàng. Bấm Tắt rồi Bật âm thanh và thử lại.',this.queue.length);};
  this.report(`Đang đọc: ${e.spoken}`,this.queue.length);this.watchdog=window.setTimeout(()=>{if(this.utterance===u){speechSynthesis.cancel();finish();}},18000);speechSynthesis.speak(u);
 }
 dispose(){this.disposed=true;clearInterval(this.work);this.disable();void this.context?.close();}
}
