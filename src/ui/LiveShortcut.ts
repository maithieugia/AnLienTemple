/** The broadcaster uses a local companion; no public administration endpoints. */
export const RELEASE_ID='2026-11-03-crowd500-1';
export function liveShortcut(nav:HTMLElement){
 document.documentElement.dataset.release=RELEASE_ID;
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 if(!local&&!new URLSearchParams(location.search).has('broadcast'))return;
 const link=document.createElement('button');link.textContent='TikTok LIVE';link.title='Mở bảng điều khiển LIVE trên máy phát sóng';link.id='tiktok-live';
 link.onclick=()=>window.open('http://127.0.0.1:5197/','_blank','noopener');nav.append(link);
}





