(function(){
'use strict';
const D=window.APP_DATA;
const LEVELS=D.levels,LESSONS=D.lessons;
const ALL=[];const seen=new Set();
LESSONS.forEach(l=>l.items.forEach(it=>{if(!seen.has(it[0])){seen.add(it[0]);ALL.push(it)}}));
const UNITS=[];LESSONS.forEach(l=>{if(l.unit&&!UNITS.includes(l.unit))UNITS.push(l.unit)});
const BYAF={};ALL.forEach(it=>BYAF[it[0]]=it);

/* ---------- drawings (emoji) and game helpers ---------- */
const EMO={koei:'🐄',skaap:'🐑',bok:'🐐',hoender:'🐔',hond:'🐶',kat:'🐱',perd:'🐴',vark:'🐷',eend:'🦆',haan:'🐓',plaas:'🚜',
rooi:'🔴',blou:'🔵',groen:'🟢',geel:'🟡',swart:'⚫',wit:'⚪',oranje:'🟠',bruin:'🟤',pienk:'🌸',
water:'💧',melk:'🥛',brood:'🍞',kaas:'🧀',eier:'🥚',vleis:'🥩',koffie:'☕',tee:'🍵',appel:'🍎',rys:'🍚',
nul:'0️⃣',een:'1️⃣',twee:'2️⃣',drie:'3️⃣',vier:'4️⃣',vyf:'5️⃣',ses:'6️⃣',sewe:'7️⃣',agt:'8️⃣',nege:'9️⃣',tien:'🔟',
ma:'👩',pa:'👨',oupa:'👴',ouma:'👵',kind:'🧒',
winkel:'🏪',straat:'🛣️',stasie:'🚉',links:'⬅️',regs:'➡️',reguit:'⬆️',
son:'☀️',reën:'🌧️',wind:'💨',wolk:'☁️',koud:'🥶',warm:'🥵',winter:'❄️',
bly:'😊',hartseer:'😢',moeg:'😴',bang:'😨',kwaad:'😠',siek:'🤒',
huis:'🏠',deur:'🚪',bed:'🛏️',stoel:'🪑',kombuis:'🍳',badkamer:'🛁',venster:'🪟',
leeu:'🦁',olifant:'🐘',seekoei:'🦛',kameelperd:'🦒',sebra:'🦓',bobbejaan:'🐒',krokodil:'🐊',luiperd:'🐆',renoster:'🦏',
oog:'👁️',oor:'👂',neus:'👃',mond:'👄',hand:'✋',voet:'🦶',been:'🦵',arm:'💪',hart:'❤️',
hemp:'👕',broek:'👖',rok:'👗',skoene:'👟',sokkies:'🧦',hoed:'🎩',baadjie:'🧥',
geld:'💰',kontant:'💵',kaart:'💳',bord:'🍽️',mes:'🔪',lepel:'🥄',
skool:'🏫',kantoor:'🏢',rekenaar:'💻',boek:'📖',
bus:'🚌',trein:'🚆',motor:'🚗',vliegtuig:'✈️',fiets:'🚲',kaartjie:'🎫',
dokter:'🧑‍⚕️',hospitaal:'🏥',medisyne:'💊',
strand:'🏖️',berg:'⛰️',see:'🌊',hotel:'🏨',koffer:'🧳',paspoort:'🛂',
ontbyt:'🥣',middagete:'🥪',aandete:'🍲',braai:'🍖',boerewors:'🌭',
piesang:'🍌',lemoen:'🍊',druiwe:'🍇',aarbei:'🍓',perske:'🍑',tamatie:'🍅',aartappel:'🥔',ui:'🧅',wortel:'🥕',
voël:'🐦',vis:'🐟',slang:'🐍',spinnekop:'🕷️',mier:'🐜',by:'🐝',vlieg:'🪰',muskiet:'🦟',skoenlapper:'🦋',padda:'🐸',
sokker:'⚽',rugby:'🏉',krieket:'🏏',swem:'🏊',fliek:'🎬',musiek:'🎵',dans:'💃',
foon:'☎️',selfoon:'📱','e-pos':'📧',boodskap:'💬',bank:'🏦',poskantoor:'🏤',kerk:'⛪',biblioteek:'📚',brug:'🌉',
boom:'🌳',blom:'🌼',rivier:'🏞️',woud:'🌲',maan:'🌙',ster:'⭐',klip:'🪨',wêreld:'🌍',
oggend:'🌅',aand:'🌆',nag:'🌃',uur:'🕐',honderd:'💯',sleutel:'🔑',sout:'🧂',
skerm:'🖥️',sleutelbord:'⌨️',wifi:'📶',robot:'🚦',band:'🛞',vulstasie:'⛽'};
const pic=it=>EMO[it[0].toLowerCase()]||null;
const PICS=ALL.filter(pic);
const toks=it=>it[0].split(' ');
const isPhrase=it=>toks(it).length>=3;
const isSpell=it=>/^\p{L}+$/u.test(it[0])&&it[0].length>=4&&it[0].length<=10;


/* ---------- helpers ---------- */
const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const slug=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sample=(a,n)=>shuffle(a).slice(0,n);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function lev(a,b){const m=[];for(let i=0;i<=a.length;i++){m[i]=[i]}for(let j=1;j<=b.length;j++)m[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return m[a.length][b.length]}
const sim=(a,b)=>{a=norm(a);b=norm(b);const L=Math.max(a.length,b.length)||1;return 1-lev(a,b)/L};
const today=()=>new Date().toLocaleDateString('en-CA');
const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toLocaleDateString('en-CA')};

/* ---------- state / memory ---------- */
const KEY='leer-afrikaans-v1';
const blank=()=>({name:'',xp:0,streak:0,best:0,lastDay:'',lessons:{},tests:{},words:{},rate:.85,gh:{token:'',gist:''},updated:0,daily:null,dailyCount:0,speedBest:0,badges:{},perfects:0,reviewCount:0});
let S;try{S=Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=blank()}
S.gh=S.gh||{token:'',gist:''};
const DAY=864e5,IV=[0.25,1,2,4,8,16];
const interval=s=>IV[Math.max(0,Math.min(5,s))]*DAY;
Object.keys(S.words).forEach(k=>{const w=S.words[k];if(w.due===undefined)w.due=w.s<=2?0:Date.now()+interval(w.s)});
let pushTimer=null;
function save(){S.updated=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function word(af){return S.words[af]||(S.words[af]={s:0,due:Date.now()+DAY/2})}
function grade(af,ok){
  const w=word(af),t=today();
  if(ok){
    if(w.up!==t){w.s=Math.min(5,w.s+1);w.up=t;w.due=Date.now()+interval(w.s)}
  }else{
    if(w.dn!==t){w.s=Math.max(0,w.s-1);w.dn=t}
    w.due=Date.now()+DAY/4;
  }
  w.last=Date.now();
}
function dueWords(){const now=Date.now();return learned().filter(k=>(S.words[k].due||0)<=now).sort((a,b)=>S.words[a].due-S.words[b].due)}
function reviewNote(){
  const n=dueWords().length;
  if(learned().length<4)return '';
  return n?`<p class="muted small">🔁 ${n} word${n===1?' is':'s are'} due for review now.</p>`:`<p class="muted small">🔁 Your next words come back for review ${nextDueText()||'soon'}.</p>`;
}
function nextDueText(){
  const ds=learned().map(k=>S.words[k].due).filter(x=>x>Date.now());
  if(!ds.length)return '';
  const hrs=(Math.min(...ds)-Date.now())/36e5;
  return hrs<1?'within the hour':hrs<24?'in about '+Math.ceil(hrs)+' hours':'in about '+Math.ceil(hrs/24)+' day'+(Math.ceil(hrs/24)===1?'':'s');
}
const learned=()=>Object.keys(S.words).filter(k=>BYAF[k]);

/* ---------- badges ---------- */
let NEWB=[];
const passedN=()=>LESSONS.filter(l=>lessonBest(l.id)>=60).length;
const lvProg=id=>{const ls=LESSONS.filter(l=>l.level===id);return [ls.filter(l=>lessonBest(l.id)>=60).length,ls.length]};
const masteredN=()=>learned().filter(k=>S.words[k].s>=4).length;
const BADGES=[
 ['first_step','🌱','First Step','Pass your first lesson',()=>[passedN(),1]],
 ['lessons_10','📚','Bookworm','Pass 10 lessons',()=>[passedN(),10]],
 ['lessons_30','🎓','Scholar','Pass 30 lessons',()=>[passedN(),30]],
 ['lessons_all','🏆','Completionist','Pass every lesson',()=>[passedN(),LESSONS.length]],
 ['tier_beginner','🥉','Beginner Graduate','Pass every Beginner lesson',()=>lvProg('beginner')],
 ['tier_elementary','🥈','Elementary Graduate','Pass every Elementary lesson',()=>lvProg('elementary')],
 ['tier_intermediate','🥇','Intermediate Graduate','Pass every Intermediate lesson',()=>lvProg('intermediate')],
 ['tier_advanced','💎','Advanced Graduate','Pass every Advanced lesson',()=>lvProg('advanced')],
 ['words_25','🔤','Word Collector','Meet 25 words',()=>[learned().length,25]],
 ['words_100','💯','Hundred Club','Meet 100 words',()=>[learned().length,100]],
 ['words_300','✍️','Wordsmith','Meet 300 words',()=>[learned().length,300]],
 ['words_600','📖','Walking Dictionary','Meet 600 words',()=>[learned().length,600]],
 ['master_25','⭐','Sticking Power','Master 25 words (they keep coming back right)',()=>[masteredN(),25]],
 ['master_100','🌟','Memory Master','Master 100 words',()=>[masteredN(),100]],
 ['perfect','🎯','Bullseye','Score 100% on a lesson or test',()=>[Math.min(1,S.perfects||0),1]],
 ['perfect_5','🏹','Sharpshooter','Score 100% five times',()=>[S.perfects||0,5]],
 ['streak_3','🔥','On a Roll','Reach a 3-day streak',()=>[S.best||0,3]],
 ['streak_7','🗓️','Week Warrior','Reach a 7-day streak',()=>[S.best||0,7]],
 ['streak_30','🌋','Unstoppable','Reach a 30-day streak',()=>[S.best||0,30]],
 ['speed_10','⚡','Quick Draw','Score 10 in the speed round',()=>[S.speedBest||0,10]],
 ['speed_25','🚀','Lightning','Score 25 in the speed round',()=>[S.speedBest||0,25]],
 ['daily_1','📅','Daily Habit','Complete a daily challenge',()=>[S.dailyCount||0,1]],
 ['daily_7','📆','Daily Devotion','Complete 7 daily challenges',()=>[S.dailyCount||0,7]],
 ['review_1','🔁','Second Look','Finish a review session',()=>[S.reviewCount||0,1]],
 ['review_10','🧠','Never Forget','Finish 10 review sessions',()=>[S.reviewCount||0,10]],
 ['xp_1000','💫','Rising Star','Earn 1,000 XP',()=>[S.xp,1000]],
 ['xp_5000','🌠','Superstar','Earn 5,000 XP',()=>[S.xp,5000]]
];
function checkBadges(){
  if(!S.badges)S.badges={};
  const got=[];
  BADGES.forEach(b=>{if(!S.badges[b[0]]){const c=b[4]();if(c[0]>=c[1]){S.badges[b[0]]=today();got.push(b)}}});
  return got;
}
const badgeBanner=()=>NEWB.length?`<div class="newbadge"><b>🏅 ${NEWB.length>1?'New badges!':'New badge!'}</b>${NEWB.map(b=>`<div class="row" style="margin-top:8px"><span class="bico">${b[1]}</span><span><b>${esc(b[2])}</b><br><span class="muted small">${esc(b[3])}</span></span></div>`).join('')}</div>`:'';
function badgesView(){
  const have=b=>!!(S.badges&&S.badges[b[0]]);
  const earned=BADGES.filter(have).length;
  const list=BADGES.slice().sort((a,b)=>(have(b)?1:0)-(have(a)?1:0));
  return `<div class="top"><button class="ghost" data-act="tab" data-t="profile">‹ Profile</button></div><h1 style="font-size:1.6rem">Badges</h1><p class="muted">${earned} of ${BADGES.length} earned</p>
   <div>${list.map(b=>{const got=have(b);const c=b[4]();const pc=Math.min(100,Math.round(c[0]/c[1]*100));
     return `<div class="bd ${got?'on':''}"><span class="bico">${got?b[1]:'🔒'}</span><div style="flex:1"><b>${esc(b[2])}</b><div class="muted small">${esc(b[3])}</div>${got?'':`<div class="bar" style="margin-top:6px;height:7px"><i style="width:${pc}%"></i></div><div class="muted small">${Math.min(c[0],c[1])} / ${c[1]}</div>`}</div></div>`}).join('')}</div>`;
}
const lessonBest=id=>(S.lessons[id]&&S.lessons[id].best)||0;
const nextLesson=()=>LESSONS.find(l=>lessonBest(l.id)<60)||null;
const stars=p=>p>=90?3:p>=70?2:p>=50?1:0;
const level=()=>Math.floor(S.xp/200)+1;
const TITLES=['Nuweling','Leerder','Student','Vlot'];
const titleFor=()=>TITLES[Math.min(3,Math.floor((level()-1)/2))];
const TITLE_EN={Nuweling:'Newcomer',Leerder:'Learner',Student:'Student',Vlot:'Fluent-ish'};

/* ---------- GitHub gist sync ---------- */
const FILE='afrikaans-progress.json';
function payload(){const c=JSON.parse(JSON.stringify(S));delete c.gh;return JSON.stringify(c,null,1)}
async function gh(path,opt){const r=await fetch('https://api.github.com'+path,Object.assign({headers:{'Authorization':'Bearer '+S.gh.token,'Accept':'application/vnd.github+json'}},opt));if(!r.ok)throw new Error('GitHub said '+r.status);return r.json()}
async function push(){
  if(!S.gh.token)return 'Add a GitHub token first.';
  try{
    const files={};files[FILE]={content:payload()};
    if(S.gh.gist){await gh('/gists/'+S.gh.gist,{method:'PATCH',body:JSON.stringify({files})})}
    else{const g=await gh('/gists',{method:'POST',body:JSON.stringify({description:'Leer Afrikaans progress',public:false,files})});S.gh.gist=g.id;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
    return 'Saved to GitHub.';
  }catch(e){return 'Could not save: '+e.message}
}
async function pull(){
  if(!S.gh.token||!S.gh.gist)return 'Add your token and gist ID first.';
  try{
    const g=await gh('/gists/'+S.gh.gist);const f=g.files[FILE];if(!f)return 'No progress file found in that gist.';
    const remote=JSON.parse(f.content);const keep=S.gh;S=Object.assign(blank(),remote);S.gh=keep;save();return 'Loaded your progress from GitHub.';
  }catch(e){return 'Could not load: '+e.message}
}
function schedulePush(){if(!S.gh.token)return;clearTimeout(pushTimer);pushTimer=setTimeout(()=>{push()},1500)}

/* ---------- audio ---------- */
let HAS=new Set(),AV='';
fetch('audio/index.json',{cache:'no-cache'}).then(r=>r.ok?r.json():[]).then(a=>{const arr=Array.isArray(a);HAS=new Set(arr?a:(a.files||[]));AV=arr?'':(a.v||'');if(V.name==='settings')render()}).catch(()=>{});
let curAudio=null;
function afVoice(){if(!('speechSynthesis' in window))return null;const vs=speechSynthesis.getVoices();return vs.find(v=>/^af/i.test(v.lang))||null}
function nlVoice(){if(!('speechSynthesis' in window))return null;return speechSynthesis.getVoices().find(v=>/^nl/i.test(v.lang))||null}
if('speechSynthesis' in window){speechSynthesis.onvoiceschanged=()=>{if(V.name==='settings')render()}}
function speak(text,slow){
  const s=slug(text);
  try{if(curAudio){curAudio.pause();curAudio=null}}catch(e){}
  if(HAS.has(s)){const a=new Audio('audio/'+s+'.mp3'+(AV?'?v='+AV:''));a.playbackRate=slow?.75:S.rate/.85;curAudio=a;a.play().catch(()=>{});return}
  if(!('speechSynthesis' in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  const v=afVoice()||nlVoice();
  if(v){u.voice=v;u.lang=v.lang}else u.lang='af-ZA';
  u.rate=slow?.55:S.rate;
  speechSynthesis.speak(u);
}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const SRX={rec:false,lang:null};
function listenOnce(lang,cb){
  if(!SR)return cb(null,'unsupported');
  let done=false,r=null;
  const tm=setTimeout(()=>{try{r&&r.stop()}catch(e){}},9000);
  const fin=(a,e)=>{if(!done){done=true;clearTimeout(tm);cb(a,e)}};
  try{
    r=new SR();r.lang=lang;r.interimResults=false;r.maxAlternatives=3;
    r.onresult=e=>fin([...e.results[0]].map(x=>x.transcript));
    r.onerror=e=>fin(null,e.error);
    r.onend=()=>fin(null,'no-speech');
    r.start();
  }catch(e){fin(null,'unsupported')}
}
function attemptListen(q,langs){
  const lang=langs[0];
  listenOnce(lang,(alts,err)=>{
    if(!Q||Q.queue[Q.i]!==q||Q.fb)return;
    if(err){
      if((err==='language-not-supported'||err==='unsupported')&&langs.length>1){attemptListen(q,langs.slice(1));return}
      if(err==='no-speech'||err==='aborted'){q.sp={s:'quiet'};render();return}
      SRX.rec=true;q.sp={s:'rec'};render();return;
    }
    SRX.lang=lang;
    const best=alts.reduce((a,b)=>sim(a,q.item[0])>=sim(b,q.item[0])?a:b);
    if(sim(best,q.item[0])>=(lang==='af-ZA'?.72:.6)){answer(true,'I heard “'+esc(best)+'”. Great pronunciation!')}
    else{q.sp={s:'miss',heard:best};render()}
  });
}
let REC=null;
function playUrl(u){try{const a=new Audio(u);a.play().catch(()=>{})}catch(e){}}
function stopRec(){if(REC){const r=REC;REC=null;try{r.mr.onstop=()=>r.stream.getTracks().forEach(t=>t.stop());r.mr.stop()}catch(e){}}}
async function toggleRec(q){
  if(REC&&REC.mr.state==='recording'){REC.mr.stop();return}
  try{
    if(typeof MediaRecorder==='undefined')throw new Error('no recorder');
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const mr=new MediaRecorder(stream);const chunks=[];
    mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
    mr.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());REC=null;
      const url=URL.createObjectURL(new Blob(chunks,{type:mr.mimeType||'audio/mp4'}));
      q.sp={s:'recdone',url};
      if(Q&&Q.queue[Q.i]===q&&!Q.fb){render();playUrl(url)}
    };
    REC={mr,stream};mr.start();q.sp={s:'recording'};render();
  }catch(e){q.sp={s:'norec'};render()}
}

/* ---------- views ---------- */
let V={name:'home'};      // current screen
let L=null;               // lesson card state
let Q=null;               // quiz state

const spk=(t,slow)=>`<button class="spk ${slow?'slow':''}" data-act="say" ${slow?'data-slow="1"':''} data-say="${esc(t)}" aria-label="${slow?'Play slowly':'Play audio'}">${slow?'🐢':'🔊'}</button>`;

function homeView(){
  const nx=nextLesson();const lrn=learned();
  const weak=lrn.filter(k=>S.words[k].s<=2);
  let h=`<div class="top"><div><div class="muted small">${S.name?'Welkom terug,':'Welkom!'}</div><h1 style="font-size:1.6rem">${esc(S.name||'Leer Afrikaans')}</h1></div>
   <div class="pills">${dueWords().length?`<span class="pill" title="Words due for review">🔁 ${dueWords().length}</span>`:''}<span class="pill" title="Day streak">🔥 ${S.streak}</span><span class="pill" title="XP">⭐ ${S.xp}</span></div></div>`;
  if(!S.name){
    h+=`<div class="welcome note"><h3>What should I call you?</h3><input id="nm" placeholder="Your name" autocomplete="given-name"><button class="primary" data-act="setname">Start learning</button></div>`;
  }
  if(nx){
    const first=!Object.keys(S.lessons).length;
    h+=`<div class="next"><div class="small">${first?'Start here':'Up next'}</div><h1>${nx.emoji} ${esc(nx.title)}</h1>
     <button class="btn" data-act="open" data-id="${nx.id}">${first?'Begin lesson':'Continue'}</button></div>`;
  }else{
    h+=`<div class="next"><h1>Jy het alles klaar! 🎉</h1><p>You've passed every lesson. Keep your words fresh with Review, retake lessons and tests, or play the games.</p></div>`;
  }
  if(dailyDone()){
    h+=`<div class="daily done"><div class="row between"><div><h3>📅 Daily challenge done ✓</h3><p class="muted small" style="margin:2px 0 0">You scored ${S.daily.pct}%. A new one arrives tomorrow.</p></div><button class="ghost" data-act="daily">Replay</button></div></div>`;
  }else{
    h+=`<div class="daily"><h3>📅 Daily challenge</h3><p class="muted small" style="margin:2px 0 10px">10 mixed questions, focused on your trickiest words. Pass it for +50 bonus XP.</p><button class="primary" data-act="daily">Start today's challenge</button></div>`;
  }
  if(lrn.length>=4){
    const due=dueWords().length;
    if(due>0){
      h+=`<div class="daily"><h3>🔁 Review · ${due} word${due===1?'':'s'} ready</h3><p class="muted small" style="margin:2px 0 10px">Words come back just before you'd forget them, so they stick for good.</p><button class="primary" data-act="review">Start review</button></div>`;
    }else{
      const nd=nextDueText();
      h+=`<div class="reviewbox"><h3>🔁 Review: all caught up ✓</h3><p class="muted small" style="margin:2px 0 10px">${nd?'Your next words are due '+nd+'.':'Nothing is waiting.'} You can still practise your trickiest words now.</p><button class="secondary" data-act="review">Practise anyway</button></div>`;
    }
  }
  LEVELS.forEach(lv=>{
    const ls=LESSONS.filter(l=>l.level===lv.id);
    const t=S.tests[lv.id];
    h+=`<section class="lvl"><div class="lvl-head"><h2 style="margin:0">${lv.name}</h2><span class="muted small">${ls.filter(l=>lessonBest(l.id)>=60).length}/${ls.length} done</span></div><div class="muted small">${lv.blurb}</div>`;
    let pu=null;
    ls.forEach(l=>{
      if(l.unit!==pu){
        if(pu!==null)h+='</ul></details>';
        pu=l.unit;
        const us=ls.filter(x=>x.unit===l.unit),ud=us.filter(x=>lessonBest(x.id)>=60).length;
        h+=`<details class="ub" ${ud===us.length?'':'open'}><summary class="unit"><span>Unit ${UNITS.indexOf(l.unit)+1} · ${esc(l.unit)}</span><span class="muted small">${ud===us.length?'✓ ':''}${ud}/${us.length}</span></summary><ul class="path">`;
      }
      const b=lessonBest(l.id),done=b>=60,isNext=nx&&nx.id===l.id;
      h+=`<li><button class="lrow" data-act="open" data-id="${l.id}"><span class="node ${done?'done':isNext?'up':''}">${done?'✓':l.emoji}</span><span><span class="lt">${esc(l.title)}</span><br><span class="ls">${l.items.length} words and phrases${S.lessons[l.id]?' · <span class="star">'+'★'.repeat(stars(b))+'☆'.repeat(3-stars(b))+'</span> '+b+'%':''}</span></span></button></li>`;
    });
    h+=`</ul></details><button class="test" data-act="test" data-id="${lv.id}">Take the ${lv.name} test${t?' · best '+t.best+'%':''}</button></section>`;
  });
  return h;
}

function learnView(){
  const l=L.lesson,n=l.items.length;
  if(L.i<0){
    return `<div class="qtop"><button class="ghost" data-act="home" aria-label="Back">✕</button><h3>${l.emoji} ${esc(l.title)}</h3></div>
     <p class="label">Before you start</p><ul class="tips">${l.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
     <button class="primary" data-act="lnext">Meet the words</button>
     ${lessonBest(l.id)?'<button class="ghost" style="width:100%;margin-top:6px" data-act="lquiz">Skip to the quiz</button>':''}`;
  }
  const it=l.items[L.i];
  return `<div class="qtop"><button class="ghost" data-act="home" aria-label="Close">✕</button><div class="bar"><i style="width:${Math.round((L.i)/n*100)}%"></i></div><span class="muted small">${L.i+1}/${n}</span></div>
   <div class="card"><div class="af">${esc(it[0])}</div><div class="en">${esc(it[1])}</div>${spk(it[0])}${spk(it[0],true)}</div>
   <div class="row"><button class="secondary" style="flex:1" data-act="lback" ${L.i===0?'disabled':''}>Back</button><button class="primary" style="flex:2" data-act="lnext">${L.i===n-1?'Start the quiz':'Next word'}</button></div>`;
}

function distract(correct,idx,pool){
  const out=[];const seenv=new Set([correct]);
  for(const it of shuffle(pool).concat(shuffle(ALL))){const v=it[idx];if(!seenv.has(v)){seenv.add(v);out.push(v)}if(out.length===3)break}
  return out;
}

function picD(item,wantEmoji){
  const e=pic(item);const seen=new Set([wantEmoji?e:item[0]]);const out=[];
  const inS=x=>Q&&Q.session.items.indexOf(x)>=0?1:0;
  const cand=shuffle(PICS.filter(it=>pic(it)!==e&&it[0]!==item[0])).sort((x,y)=>inS(y)-inS(x));
  for(const it of cand){const v=wantEmoji?pic(it):it[0];if(!seen.has(v)){seen.add(v);out.push(v)}if(out.length===3)break}
  return out;
}
function extraToks(item){
  const have=new Set(toks(item).map(w=>w.toLowerCase()));const out=[];
  for(const w of shuffle(Q.session.items.concat(ALL)).flatMap(it=>it[0].split(' '))){
    const c=w.toLowerCase();
    if(/^\p{L}{2,}$/u.test(w)&&!have.has(c)&&!out.includes(c)){out.push(c);if(out.length===2)break}
  }
  return out;
}
function blankD(word){
  const cap=/^\p{Lu}/u.test(word);const seen=new Set([word.toLowerCase()]);const out=[];
  for(const raw of shuffle(Q.session.items.concat(ALL)).flatMap(it=>it[0].split(' '))){
    const w=raw.replace(/[^\p{L}]/gu,'');const c=w.toLowerCase();
    if(w.length>=3&&!seen.has(c)){seen.add(c);out.push(cap?c[0].toUpperCase()+c.slice(1):c)}
    if(out.length===3)break;
  }
  return out;
}
const tileHtml=(t,act,cls,dis)=>`<button class="tile ${cls||''}" data-act="${act}" data-id="${t.id}" ${dis?'disabled':''}>${esc(t.t)}</button>`;
function optsHtml(q,fb,emo){
  return `<div class="${emo?'picopts':'opts'}">${q.opts.map((o,i)=>`<button class="opt ${fb?(o===q.ans?'good':i===q.picked?'bad':''):''}" data-act="opt" data-i="${i}" ${fb?'disabled':''}>${esc(o)}</button>`).join('')}</div>`;
}
function tilesHtml(q,fb,label,promptHtml,checkLabel){
  const placed=q.placed.map(id=>q.bank.find(b=>b.id===id));
  return `<p class="label">${label}</p>${promptHtml}
   <div class="slots">${placed.map(t=>tileHtml(t,'untile',fb?(fb.ok?'ok':'no'):'',!!fb)).join('')}</div>
   <div class="bank">${q.bank.map(t=>tileHtml(t,'tile',q.placed.includes(t.id)?'used':'',!!fb||q.placed.includes(t.id))).join('')}</div>
   ${fb?'':`<button class="primary" data-act="checkt" ${q.placed.length?'':'disabled style="opacity:.45"'}>${checkLabel||'Check'}</button>`}`;
}
const CHARS=`<div class="chars">${['ê','ë','é','è','ô','î','ï','û'].map(c=>`<button data-act="ch" data-c="${c}" tabindex="-1">${c}</button>`).join('')}</div>`;

function quizView(){
  const q=Q.queue[Q.i],fb=Q.fb;
  const pct=Math.round(Q.i/Q.queue.length*100);
  const af=q.item?q.item[0]:'',en=q.item?q.item[1]:'';
  let h=`<div class="qtop"><button class="ghost" data-act="home" aria-label="Quit">✕</button><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  if(q.t==='mc'||q.t==='listen'){
    const af2en=q.t==='listen'||q.dir==='af2en';const idx=af2en?1:0;
    q.ans=q.item[idx];
    if(!q.opts)q.opts=shuffle([q.ans,...distract(q.ans,idx,Q.session.items)]);
    if(q.t==='listen'){h+=`<p class="label">Listen, then pick the meaning</p><div class="prompt">${spk(af)}${spk(af,true)}</div>`}
    else if(af2en){h+=`<p class="label">What does this mean?</p><div class="prompt">${esc(af)} ${spk(af)}</div>`}
    else{h+=`<p class="label">How do you say…</p><div class="prompt en">${esc(en)}</div>`}
    h+=optsHtml(q,fb,false);
  }else if(q.t==='pic'){
    const e=pic(q.item);
    if(q.dir==='e2a'){
      q.ans=af;if(!q.opts)q.opts=shuffle([af,...picD(q.item,false)]);
      h+=`<p class="label">Which word matches the picture?</p><div class="pic">${e}</div>`+optsHtml(q,fb,false);
    }else{
      q.ans=e;if(!q.opts)q.opts=shuffle([e,...picD(q.item,true)]);
      h+=`<p class="label">Pick the picture</p><div class="prompt">${esc(af)} ${spk(af)}</div>`+optsHtml(q,fb,true);
    }
  }else if(q.t==='type'||q.t==='dictate'){
    h+=q.t==='type'?`<p class="label">Type it in Afrikaans</p><div class="prompt en">${esc(en)}</div>`:`<p class="label">Type what you hear</p><div class="prompt">${spk(af)}${spk(af,true)}</div>`;
    h+=`<input id="ti" class="tin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Your answer" value="${esc(q.val||'')}" ${fb?'disabled':''}>${fb?'':CHARS+'<button class="primary" data-act="check">Check</button>'}`;
  }else if(q.t==='build'){
    if(!q.bank){const t=toks(q.item).map((w,i)=>({id:i,t:w}));extraToks(q.item).forEach((w,j)=>t.push({id:100+j,t:w}));q.bank=shuffle(t);q.placed=[]}
    h+=tilesHtml(q,fb,'Build the sentence in Afrikaans',`<div class="prompt en" style="margin-bottom:14px">${esc(en)}</div>`);
  }else if(q.t==='spell'){
    if(!q.bank){q.bank=shuffle([...af].map((c,i)=>({id:i,t:c})));q.placed=[]}
    const e=pic(q.item);
    h+=tilesHtml(q,fb,'Spell the Afrikaans word',`${e?`<div class="pic" style="font-size:3.4rem;margin:0 0 6px">${e}</div>`:''}<div class="prompt en" style="margin-bottom:14px">${esc(en)} ${spk(af)}</div>`);
  }else if(q.t==='blank'){
    if(q.bi===undefined){
      const t=toks(q.item);let bi=-1,bl=0;
      t.forEach((w,i)=>{const c=w.replace(/[^\p{L}]/gu,'').length;if(i>0&&c>bl){bl=c;bi=i}});
      if(bi<0)bi=t.length-1;
      q.bi=bi;q.word=t[bi].replace(/[?!.,;:]+$/,'');
      q.opts=shuffle([q.word,...blankD(q.word)]);
    }
    q.ans=q.word;
    const t=toks(q.item);
    const phrase=t.map((w,i)=>i===q.bi?`<span class="blank ${fb?'rev':''}">${esc(q.word)}</span>${esc(w.slice(q.word.length))}`:esc(w)).join(' ');
    h+=`<p class="label">Fill in the missing word</p><div class="prompt" style="font-size:1.8rem;margin-bottom:6px">${phrase}</div><p class="muted" style="margin-bottom:16px">${esc(en)}</p>`+optsHtml(q,fb,false);
  }else if(q.t==='match'){
    if(!q.m)q.m={L:shuffle(q.items.map((_,i)=>i)),R:shuffle(q.items.map((_,i)=>i)),sel:null,done:[],err:0,bad:null};
    const m=q.m;
    const cls=(side,i)=>{if(m.done.includes(i))return 'gone';if(m.bad&&m.bad.some(b=>b.side===side&&b.i===i))return 'shake';if(m.sel&&m.sel.side===side&&m.sel.i===i)return 'sel';return ''};
    h+=`<p class="label">Match each word with its meaning</p><div class="mt"><div class="opts">${m.L.map(i=>`<button class="opt ${cls('L',i)}" data-act="mt" data-side="L" data-i="${i}" ${m.done.includes(i)||fb?'disabled':''}>${esc(q.items[i][0])}</button>`).join('')}</div><div class="opts">${m.R.map(i=>`<button class="opt ${cls('R',i)}" data-act="mt" data-side="R" data-i="${i}" ${m.done.includes(i)||fb?'disabled':''}>${esc(pic(q.items[i])&&i%2?pic(q.items[i]):q.items[i][1])}</button>`).join('')}</div></div>`;
  }else if(q.t==='speak'){
    const sp=q.sp||{s:'idle'};
    const recMode=!SR||SRX.rec||['rec','recording','recdone','norec'].includes(sp.s);
    h+=`<p class="label">Say it out loud</p><div class="prompt">${esc(af)}</div><div class="row" style="margin:-10px 0 14px">${spk(af)}${spk(af,true)}<span class="muted">${esc(en)}</span></div>`;
    if(!fb){
      if(sp.s==='norec'||(recMode&&typeof MediaRecorder==='undefined')){
        h+=`<div class="note">I cannot use the microphone here. Play the word, say it aloud, and rate yourself.</div><button class="primary" data-act="selfok">I said it</button><button class="ghost" style="width:100%" data-act="skip">Skip</button>`;
      }else if(recMode){
        const rec=sp.s==='recording';
        h+=`<div class="note">${sp.s==='recdone'?'Play yourself back, then the model voice (🔊), and see how close you are.':'Your phone cannot check Afrikaans automatically, so record yourself and compare with the model voice.'}</div>
         <button class="micbtn ${rec?'live':''}" data-act="mic" aria-label="${rec?'Stop recording':'Record'}">${rec?'⏹':'🎤'}</button>
         <p style="text-align:center" class="muted">${rec?'Recording… tap to stop':sp.s==='recdone'?'Tap to record again':'Tap to record yourself'}</p>
         ${sp.s==='recdone'?`<button class="secondary" data-act="playrec">▶ Hear yourself</button><button class="primary" style="margin-top:10px" data-act="selfok">That matched</button>`:''}
         <button class="ghost" style="width:100%" data-act="skip">Skip</button>`;
      }else{
        h+=`<button class="micbtn ${sp.s==='listening'?'live':''}" data-act="mic" aria-label="Start listening">🎤</button>
         <p style="text-align:center" class="muted">${sp.s==='listening'?'Listening…':sp.s==='miss'?'I heard “'+esc(sp.heard)+'”. Give it another go.':sp.s==='quiet'?"I didn't hear anything. Tap and try again.":'Tap the mic and say it'}</p>
         ${SRX.lang==='nl-NL'?'<p class="muted small" style="text-align:center">Listening with a Dutch recogniser, which is close to Afrikaans.</p>':''}
         ${sp.s==='miss'||sp.s==='quiet'?'<button class="secondary" data-act="userec">Record and compare instead</button><button class="ghost" style="width:100%" data-act="skip">Move on</button>':''}`;
      }
    }
  }
  if(fb){
    h+=`<div class="fbspace"></div><div class="fb ${fb.ok?'good':'bad'}"><div><strong>${fb.ok?fb.praise:'Not quite'}</strong><p>${fb.note||''}</p><button class="primary" data-act="next">Continue</button></div></div>`;
  }
  return h;
}

/* ---------- daily challenge ---------- */
function dailyDone(){return !!(S.daily&&S.daily.date===today()&&S.daily.done)}
function dailyItems(){
  if(!S.daily||S.daily.date!==today()){
    const lrn=learned().map(k=>BYAF[k]);
    let picked;
    if(lrn.length>=6){
      const dueL=dueWords().map(k=>BYAF[k]);
      const weak=dueL.length>=4?dueL:lrn.slice().sort((a,b)=>S.words[a[0]].s-S.words[b[0]].s).slice(0,12);
      picked=sample(weak,6);
      picked=picked.concat(sample(lrn.filter(x=>!picked.includes(x)),4));
    }else picked=sample(ALL,10);
    S.daily={date:today(),keys:picked.map(x=>x[0]),done:false,pct:0};
    save();
  }
  return S.daily.keys.map(k=>BYAF[k]).filter(Boolean);
}

/* ---------- games hub + speed round ---------- */
function gamesView(){
  const n=learned().length;
  const nDue=dueWords().length;
  const rows=[['review','🔁','Review','Words that are due for spaced practice.',nDue?nDue+' due':''],
   ['daily','📅','Daily challenge','10 mixed questions, new every day. Pass for +50 XP.',dailyDone()?'Done today ✓':''],
   ['speed','⚡','Speed round','45 seconds. Answer as many as you can.',S.speedBest?'Best: '+S.speedBest:''],
   ['pic','🖼️','Picture challenge','Match the drawings to Afrikaans words.',''],
   ['build','🧩','Sentence builder','Tap the words into the right order.',''],
   ['spell','🔤','Spelling bee','Spell words from scrambled letters.','']];
  return `<div class="top"><h1 style="font-size:1.6rem">Games</h1></div>
   <p class="muted">${n>=6?'Games use the words you have met so far.':'You haven\'t met many words yet, so games will use a starter set. Finish a lesson to practise your own words.'}</p>
   <div>${rows.map(r=>`<button class="gm" data-act="game" data-g="${r[0]}"><span class="node done">${r[1]}</span><span><span class="lt">${r[2]}</span><br><span class="ls">${r[3]}${r[4]?' · <b>'+r[4]+'</b>':''}</span></span></button>`).join('')}</div>`;
}
let G=null,timer=null;
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function nextSpeedQ(){
  const it=pick(G.pool);const dir=Math.random()<.5?'af2en':'en2af';const idx=dir==='af2en'?1:0;const ans=it[idx];
  G.q={it,dir,ans,opts:shuffle([ans,...distract(ans,idx,G.pool)])};
}
function startSpeed(){
  stopTimer();
  let pool=learned().map(k=>BYAF[k]);if(pool.length<6)pool=ALL.slice();
  G={pool,end:Date.now()+45000,score:0,last:''};
  nextSpeedQ();V={name:'speed'};render();
  timer=setInterval(tick,200);
}
function tick(){
  if(!G)return;
  const left=Math.max(0,G.end-Date.now());
  const t=document.getElementById('sp-t'),b=document.getElementById('sp-b');
  if(t)t.textContent=Math.ceil(left/1000)+'s';
  if(b)b.style.width=(left/450)+'%';
  if(left<=0)endSpeed();
}
function endSpeed(){
  stopTimer();
  const xp=G.score*3;S.xp+=xp;
  const newBest=G.score>(S.speedBest||0);
  if(newBest)S.speedBest=G.score;
  touchStreak();NEWB=checkBadges();save();schedulePush();
  V={name:'speedend',xp,newBest};render();
}
function speedView(){
  const q=G.q,left=Math.max(0,G.end-Date.now());
  return `<div class="qtop"><button class="ghost" data-act="tab" data-t="games" aria-label="Quit">✕</button><div class="bar"><i id="sp-b" style="width:${left/450}%;transition:none"></i></div><b id="sp-t">${Math.ceil(left/1000)}s</b></div>
   <p class="label">Score ${G.score}${G.last?' · '+esc(G.last):''}</p>
   <div class="prompt ${q.dir==='af2en'?'':'en'}">${esc(q.dir==='af2en'?q.it[0]:q.it[1])}</div>
   <div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-act="sopt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
}
function speedEndView(){
  const best=S.speedBest||0;
  return `<div class="hero"><div class="muted">Time's up!</div><div class="big">${G.score}</div><h2 style="margin-top:8px">${G.score===1?'answer':'answers'}</h2>
   <p>${V.newBest?'Nuwe rekord! A new personal best.':G.score>=15?'Baie goed! Very quick.':'Mooi so! Every round makes you faster.'}</p>
   <p class="muted">+${V.xp} XP · Best: ${best}</p>${badgeBanner()}</div>
   <div style="display:grid;gap:10px"><button class="primary" data-act="game" data-g="speed">Play again</button><button class="secondary" data-act="tab" data-t="games">Back to games</button></div>`;
}

function doneView(){
  const d=Q.done;
  const msg=d.pct>=90?'Uitstekend! Excellent work. These words are really sticking.':d.pct>=70?'Baie goed! Very good. A little more practice and it will be second nature.':d.pct>=50?'Goed so! Good going. Retake it to lock in the tricky ones.':'Moenie moed opgee nie. Don\'t give up. Every slip-up is how words stick, so try it again whenever you\'re ready.';
  const nxt=Q.session.kind==='lesson'&&d.pct>=60?LESSONS[LESSONS.findIndex(l=>l.id===Q.session.id)+1]:null;
  const weak=[...Q.weak];
  return `<div class="hero"><div class="stars">${'★'.repeat(stars(d.pct))}${'☆'.repeat(3-stars(d.pct))}</div><div class="big">${d.pct}%</div><h2 style="margin-top:8px">${esc(Q.session.title)}</h2><p>${msg}</p>
   <p class="muted">+${d.xp} XP · 🔥 ${S.streak}-day streak${d.pct>=60&&Q.session.kind==='lesson'&&!d.was?' · Lesson complete!':''}</p>${reviewNote()}${badgeBanner()}${d.bonus?'<p><b>📅 Daily challenge complete! Includes +50 bonus XP.</b></p>':Q.session.kind==='daily'&&!dailyDone()?'<p class="muted">Score 50% or more to earn the daily bonus. Retake whenever you like.</p>':''}</div>
   ${weak.length?`<h3>Worth another look</h3><ul class="wl">${weak.map(a=>`<li><span><b>${esc(a)}</b><br><span class="muted small">${esc(BYAF[a]?BYAF[a][1]:'')}</span></span>${spk(a)}</li>`).join('')}</ul>`:''}
   <div style="margin-top:18px;display:grid;gap:10px">
   ${nxt?`<button class="primary" data-act="open" data-id="${nxt.id}">Next: ${esc(nxt.title)}</button>`:''}
   <button class="${nxt?'secondary':'primary'}" data-act="retake">Retake</button>
   <button class="secondary" data-act="home">Back to lessons</button></div>`;
}

function profileView(){
  const lrn=learned(),mast=lrn.filter(k=>S.words[k].s>=4);
  const into=S.xp%200;
  const weak=lrn.filter(k=>S.words[k].s<=2).sort((a,b)=>S.words[a].s-S.words[b].s).slice(0,8);
  const strong=lrn.filter(k=>S.words[k].s>=4).slice(0,6);
  return `<div class="top"><h1 style="font-size:1.6rem">Profile</h1></div>
   <div class="hero" style="padding-top:0"><div class="muted small">Level ${level()}</div><h2 style="margin:0">${esc(S.name||'Learner')}</h2><div>${titleFor()} <span class="muted small">(${TITLE_EN[titleFor()]})</span></div>
   <div class="bar" style="margin:14px 0 4px"><i style="width:${into/2}%"></i></div><div class="muted small">${200-into} XP to level ${level()+1}</div></div>
   <div class="stats"><div class="stat"><b>${S.streak}</b>day streak</div><div class="stat"><b>${S.best}</b>best streak</div><div class="stat"><b>${lrn.length}</b>words met (of ${ALL.length})</div><div class="stat"><b>${mast.length}</b>words mastered</div><div class="stat"><b>${LESSONS.filter(l=>lessonBest(l.id)>=60).length}</b>lessons passed (of ${LESSONS.length})</div><div class="stat"><b>${S.xp}</b>total XP</div><div class="stat"><b>${dueWords().length}</b>words due for review</div><div class="stat"><b>${dueWords().length}</b>due for review</div><div class="stat"><b>${S.reviewCount||0}</b>reviews done</div><div class="stat"><b>${S.dailyCount||0}</b>daily challenges</div><div class="stat"><b>${S.speedBest||0}</b>speed round best</div></div>
   <button class="secondary" data-act="tab" data-t="badges">🏅 Badges · ${BADGES.filter(b=>S.badges&&S.badges[b[0]]).length}/${BADGES.length}<br><span style="font-size:1.3rem;letter-spacing:4px">${BADGES.filter(b=>S.badges&&S.badges[b[0]]).slice(-6).map(b=>b[1]).join('')}</span></button>
   <p style="margin-top:14px">${encourage()}</p>
   ${weak.length?`<h3>Words to practise</h3><ul class="wl">${weak.map(a=>`<li><span><b>${esc(a)}</b> <span class="muted small">${esc(BYAF[a][1])}</span></span>${spk(a)}</li>`).join('')}</ul>`:''}
   ${strong.length?`<h3 style="margin-top:18px">Words you know well</h3><ul class="wl">${strong.map(a=>`<li><span><b>${esc(a)}</b> <span class="muted small">${esc(BYAF[a][1])}</span></span><span class="dots">●●●●●</span></li>`).join('')}</ul>`:''}`;
}
function encourage(){
  const n=nextLesson();
  if(!Object.keys(S.lessons).length)return 'Your first lesson takes about five minutes. Groete is a great place to begin.';
  if(S.streak>=7)return `${S.streak} days in a row. Dis wonderlik! Consistency is what makes a language stick.`;
  if(S.streak>=3)return `${S.streak} days in a row, mooi so! Keep the streak going with a short lesson today.`;
  return n?`You're getting there. Up next: ${n.title}.`:'You have passed every lesson. Use the practice mode to keep it all fresh.';
}

function settingsView(){
  const av=afVoice(),nv=nlVoice();
  const vt=HAS.size?`Using ${HAS.size} recorded audio files, with the device voice as backup.`:av?`Using your device's Afrikaans voice (${esc(av.name)}).`:nv?'No Afrikaans voice on this device, so a Dutch voice is standing in. It is close but not identical. Adding audio files fixes this (see the README).':'No suitable voice found on this device. Add audio files to hear pronunciations (see the README).';
  return `<div class="top"><h1 style="font-size:1.6rem">Settings</h1></div><div class="set">
   <div class="note ${HAS.size||av?'':'warn'}"><b>Voice</b><br><span class="small">${vt}</span></div>
   <label for="rate">Speaking speed</label><select id="rate" data-bind="rate"><option value="0.7" ${S.rate==0.7?'selected':''}>Slow</option><option value="0.85" ${S.rate==0.85?'selected':''}>Normal</option><option value="1" ${S.rate==1?'selected':''}>Fast</option></select>
   <label for="nm2">Your name</label><input id="nm2" data-bind="name" value="${esc(S.name)}">
   <h3 style="margin-top:28px">Save progress to GitHub</h3>
   <p class="muted small">Your progress always saves on this device. Add a GitHub token (a classic token with only the “gist” permission) and it will also back up to a private gist, so you can restore it on any device.</p>
   <label for="tok">GitHub token</label><input id="tok" type="password" data-bind="gh.token" value="${esc(S.gh.token)}" autocomplete="off" placeholder="ghp_...">
   <label for="gid">Gist ID (filled in after the first save)</label><input id="gid" data-bind="gh.gist" value="${esc(S.gh.gist)}" autocomplete="off">
   <button class="primary" data-act="gpush">Save to GitHub now</button><button class="secondary" data-act="gpull">Load from GitHub</button>
   ${V.msg?`<div class="note">${esc(V.msg)}</div>`:''}
   <h3 style="margin-top:28px">Daily reminder</h3>
   <p class="muted small">Adds a repeating daily event with an alert to your Calendar app, which opens this app when you tap it. Your phone sends the reminder, so it works even when the app is closed.</p>
   <label for="rt">Remind me at</label><input id="rt" type="time" data-bind="remindTime" value="${esc(S.remindTime||'19:00')}">
   <button class="primary" data-act="remind">Add daily reminder</button>
   <h3 style="margin-top:28px">Backup file</h3>
   <button class="secondary" data-act="export">Download backup</button>
   <label for="imp">Restore from backup</label><input id="imp" type="file" accept="application/json">
   <h3 style="margin-top:28px">Start over</h3>
   <button class="secondary" data-act="reset" style="color:var(--bad)">Erase all progress</button></div>`;
}

let lastKey='';
function render(){
  if(V.name!=='speed')stopTimer();
  if(V.name!=='done'&&V.name!=='speedend')NEWB=[];
  const NDUE=learned().length>=4?dueWords().length:0;
  let h='';
  switch(V.name){
    case 'home':h=homeView();break;
    case 'learn':h=learnView();break;
    case 'quiz':h=quizView();break;
    case 'done':h=doneView();break;
    case 'profile':h=profileView();break;
    case 'settings':h=settingsView();break;
    case 'games':h=gamesView();break;
    case 'speed':h=speedView();break;
    case 'speedend':h=speedEndView();break;
    case 'badges':h=badgesView();break;
  }
  const nav=['home','games','profile','settings','badges'].includes(V.name)?`<nav class="tabs"><div>
    <button class="${V.name==='home'?'on':''}" data-act="tab" data-t="home"><span>📚</span>Learn${NDUE?`<i class="badge">${NDUE>99?'99+':NDUE}</i>`:''}</button>
    <button class="${V.name==='games'?'on':''}" data-act="tab" data-t="games"><span>🎮</span>Games</button>
    <button class="${V.name==='profile'||V.name==='badges'?'on':''}" data-act="tab" data-t="profile"><span>🏅</span>Profile</button>
    <button class="${V.name==='settings'?'on':''}" data-act="tab" data-t="settings"><span>⚙️</span>Settings</button></div></nav>`:'';
  app.innerHTML=h+nav;
  const key=V.name+'|'+(V.name==='quiz'?Q.i+':'+Q.queue.length:V.name==='learn'?L.i:'');
  if(key!==lastKey){window.scrollTo(0,0);lastKey=key}
  if(V.name==='quiz'&&!Q.fb){const q=Q.queue[Q.i];if((q.t==='listen'||q.t==='dictate')&&!q.played){q.played=1;speak(q.item[0])}if(q.t==='type'||q.t==='dictate'){const i=document.getElementById('ti');if(i)i.focus()}}
}

/* ---------- quiz engine ---------- */
function make(type,it,i){
  switch(type){
    case 'mc':return {t:'mc',item:it,dir:i%2?'en2af':'af2en'};
    case 'listen':return {t:'listen',item:it};
    case 'type':return {t:'type',item:it};
    case 'dictate':return {t:'dictate',item:it};
    case 'pic':return pic(it)?{t:'pic',item:it,dir:i%2?'a2e':'e2a'}:null;
    case 'spell':return isSpell(it)?{t:'spell',item:it}:null;
    case 'build':return isPhrase(it)?{t:'build',item:it}:null;
    case 'blank':return isPhrase(it)?{t:'blank',item:it}:null;
  }
  return null;
}
function build(session){
  const items=shuffle(session.items);const out=[];
  if(session.kind==='lesson'){
    items.forEach((it,i)=>{
      let q=null;
      if(pic(it)&&i%2===0)q=make('pic',it,i);
      else if(isPhrase(it)&&i%2===1)q=make('build',it,i);
      out.push(q||make('mc',it,i));
    });
    const take=(type,n,f)=>shuffle(items.filter(f)).slice(0,n).forEach((it,i)=>out.push(make(type,it,i)));
    take('listen',2,()=>true);take('spell',2,isSpell);take('dictate',1,()=>true);take('type',2,()=>true);take('blank',1,isPhrase);
    if(items.length>=5)out.push({t:'match',items:sample(items,5)});
    const ph=items.filter(i=>i[0].includes(' '));
    sample(ph.length>=2?ph:items,2).forEach(it=>out.push({t:'speak',item:it}));
  }else if(session.kind==='game'){
    const g=session.game;
    const n=g==='pic'?10:8;items.slice(0,n).forEach((it,i)=>out.push(make(g,it,i)));
  }else{
    const n=Math.min(items.length,session.kind==='test'?12:10);
    const cyc=['mc','listen','pic','type','spell','build','dictate','blank'];
    items.slice(0,n).forEach((it,i)=>{let q=null;for(let k=0;k<cyc.length&&!q;k++)q=make(cyc[(i+k)%cyc.length],it,i);out.push(q)});
    if(items.length>=5)out.push({t:'match',items:sample(items,5)});
  }
  return out;
}
function startSession(session){
  const queue=build(session);
  Q={session,queue,i:0,right:0,total:queue.length,weak:new Set(),fb:null,done:null};
  V={name:'quiz'};render();
}
function bump(q,ok){
  (q.items||[q.item]).forEach(it=>grade(it[0],ok));
}
const PRAISE=['Reg!','Mooi so!','Presies!','Goed gedoen!','Lekker!'];
const SPOKEN=['listen','type','speak','build','spell','dictate','blank'];
function answer(ok,note){
  const q=Q.queue[Q.i];
  if(!q.retry){
    if(ok)Q.right++;
    bump(q,ok);
    if(!ok&&q.t!=='speak'){
      if(q.item)Q.weak.add(q.item[0]);
      Q.queue.push(Object.assign({},q,{retry:true,opts:null,picked:null,m:null,sp:null,val:'',played:false,bank:null,placed:null,mm:null,bi:undefined,word:undefined}));
    }
  }
  Q.fb={ok,note:note||'',praise:pick(PRAISE)};
  if(q.item&&(!ok||SPOKEN.includes(q.t)))speak(q.item[0]);
  save();render();
}
function advance(){
  stopRec();Q.fb=null;Q.i++;
  if(Q.i>=Q.queue.length)finish();else render();
}
function touchStreak(){
  if(S.lastDay!==today()){S.streak=S.lastDay===yesterday()?S.streak+1:1;S.lastDay=today()}
  S.best=Math.max(S.best,S.streak);
}
function finish(){
  const pct=Math.round(Q.right/Math.max(1,Q.total)*100);
  const xp=Q.right*10+(pct>=60?20:0);
  S.xp+=xp;touchStreak();
  const s=Q.session;let was=false;
  if(s.kind==='lesson'){const r=S.lessons[s.id]||{best:0,attempts:0};was=r.best>=60;r.best=Math.max(r.best,pct);r.attempts++;S.lessons[s.id]=r}
  if(s.kind==='test'){const r=S.tests[s.id]||{best:0};r.best=Math.max(r.best,pct);S.tests[s.id]=r}
  let bonus=0;
  if(s.kind==='daily'&&S.daily&&S.daily.date===today()&&!S.daily.done&&pct>=50){bonus=50;S.xp+=bonus;S.daily.done=true;S.daily.pct=pct;S.dailyCount=(S.dailyCount||0)+1}
  if(s.kind==='review')S.reviewCount=(S.reviewCount||0)+1;
  if(pct===100&&(s.kind==='lesson'||s.kind==='test'))S.perfects=(S.perfects||0)+1;
  Q.done={pct,xp:xp+bonus,was,bonus};
  NEWB=checkBadges();
  save();schedulePush();
  V={name:'done'};render();
}

/* ---------- actions ---------- */
const ACT={
  say:t=>speak(t.dataset.say,t.dataset.slow==='1'),
  remind:()=>{
    const t=(S.remindTime||'19:00').split(':'),pad=n=>String(n).padStart(2,'0');
    const d=new Date(),ymd=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
    const end=pad((+t[0]*60+ +t[1]+15)%1440/60|0)+pad((+t[0]*60+ +t[1]+15)%60);
    const url=location.href.split('#')[0];
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Leer Afrikaans//EN','BEGIN:VEVENT','UID:leer-afrikaans-daily@'+location.host,'DTSTAMP:'+stamp,
      'DTSTART:'+ymd+'T'+pad(+t[0])+pad(+t[1])+'00','DTEND:'+ymd+'T'+end+'00','RRULE:FREQ=DAILY','SUMMARY:Leer Afrikaans: daily challenge',
      'DESCRIPTION:A few minutes of Afrikaans keeps your streak alive. '+url,'URL:'+url,
      'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Time for your Afrikaans!','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
    try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='leer-afrikaans-reminder.ics';document.body.appendChild(a);a.click();a.remove();V.msg='Open the downloaded file and tap Add All to save the reminder to Calendar.'}
    catch(e){V.msg='Could not create the reminder file.'}
    render();
  },
  daily:()=>startSession({kind:'daily',id:'daily',title:'Daily challenge',items:dailyItems()}),
  game:t=>{
    const g=t.dataset.g;
    if(g==='speed')return startSpeed();
    if(g==='daily')return ACT.daily();
    if(g==='review')return ACT.review();
    const meta={pic:{f:pic,min:5,title:'Picture challenge'},spell:{f:isSpell,min:5,title:'Spelling bee'},build:{f:isPhrase,min:5,title:'Sentence builder'}}[g];
    let pool=learned().map(k=>BYAF[k]).filter(meta.f);
    if(pool.length<meta.min)pool=ALL.filter(meta.f);
    startSession({kind:'game',game:g,id:g,title:meta.title,items:pool});
  },
  sopt:t=>{
    if(Date.now()>=G.end){endSpeed();return}
    const i=+t.dataset.i,q=G.q,ok=q.opts[i]===q.ans;
    grade(q.it[0],ok);
    if(ok){G.score++;G.last='✓'}else G.last='✗ '+q.it[0]+' = '+q.it[1];
    nextSpeedQ();render();
  },
  tile:t=>{const q=Q.queue[Q.i];if(Q.fb)return;const id=+t.dataset.id;if(!q.placed.includes(id))q.placed.push(id);render()},
  untile:t=>{const q=Q.queue[Q.i];if(Q.fb)return;const id=+t.dataset.id;q.placed=q.placed.filter(x=>x!==id);render()},
  checkt:()=>{
    const q=Q.queue[Q.i];if(Q.fb||!q.placed.length)return;
    const parts=q.placed.map(id=>q.bank.find(b=>b.id===id).t);
    const ok=q.t==='build'?norm(parts.join(' '))===norm(q.item[0]):parts.join('').toLowerCase()===q.item[0].toLowerCase();
    answer(ok,ok?'':'Answer: <b>'+esc(q.item[0])+'</b><br><span class="small">We\'ll try this one again.</span>');
  },
  tab:t=>{V={name:t.dataset.t};render()},
  home:()=>{Q=null;L=null;V={name:'home'};render()},
  setname:()=>{const v=document.getElementById('nm').value.trim();if(!v)return;S.name=v;save();render()},
  open:t=>{const l=LESSONS.find(x=>x.id===t.dataset.id);L={lesson:l,i:-1};V={name:'learn'};render()},
  lback:()=>{if(L.i>0){L.i--;render();speak(L.lesson.items[L.i][0])}},
  lnext:()=>{
    const n=L.lesson.items.length;
    if(L.i>=0&&L.i===n-1){ACT.lquiz();return}
    L.i++;const it=L.lesson.items[L.i];word(it[0]);save();render();speak(it[0]);
  },
  lquiz:()=>{L.lesson.items.forEach(it=>word(it[0]));save();startSession({kind:'lesson',id:L.lesson.id,title:L.lesson.title,items:L.lesson.items})},
  test:t=>{const lv=LEVELS.find(x=>x.id===t.dataset.id);const items=[];LESSONS.filter(l=>l.level===lv.id).forEach(l=>l.items.forEach(i=>items.push(i)));startSession({kind:'test',id:lv.id,title:lv.name+' test',items})},
  review:()=>{
    let ks=dueWords().slice(0,12);
    if(ks.length<8){
      const extra=learned().filter(k=>!ks.includes(k)).sort((x,y)=>S.words[x].s-S.words[y].s||Math.random()-.5).slice(0,8-ks.length);
      ks=ks.concat(extra);
    }
    if(ks.length<2)return;
    startSession({kind:'review',id:'review',title:'Review',items:ks.map(k=>BYAF[k])});
  },
  retake:()=>startSession(Q.session),
  opt:t=>{
    if(Q.fb)return;const q=Q.queue[Q.i];const i=+t.dataset.i;q.picked=i;
    const ok=q.opts[i]===q.ans;
    answer(ok,ok?(q.t==='blank'?esc(q.item[0]):''):'Answer: <b>'+esc(q.ans)+'</b>'+(q.item?'<br><span class="small">'+esc(q.item[0])+' = '+esc(q.item[1])+'</span>':'')+'<br><span class="small">We\'ll try this one again.</span>');
  },
  ch:t=>{const i=document.getElementById('ti');if(!i)return;const s=i.selectionStart,e=i.selectionEnd;i.setRangeText(t.dataset.c,s,e,'end');i.focus()},
  check:()=>{
    if(Q.fb)return;const q=Q.queue[Q.i];const i=document.getElementById('ti');q.val=i.value;if(!norm(q.val))return;
    const ok=norm(q.val)===norm(q.item[0]);
    let note='';
    if(ok&&q.val.trim().toLowerCase()!==q.item[0].toLowerCase())note='Spelled with accents it is <b>'+esc(q.item[0])+'</b>.';
    if(!ok)note='Answer: <b>'+esc(q.item[0])+'</b><br><span class="small">We\'ll try this one again.</span>';
    answer(ok,note);
  },
  mt:t=>{
    const q=Q.queue[Q.i],m=q.m;if(Q.fb||m.bad)return;
    const side=t.dataset.side,i=+t.dataset.i;
    if(!m.sel||m.sel.side===side){m.sel={side,i};speak_if_left(q,side,i);render();return}
    const a=m.sel;m.sel=null;
    if(a.i===i){m.done.push(i);speak(q.items[i][0]);
      if(m.done.length===q.items.length){answer(m.err<=1,m.err?m.err+(m.err===1?' slip':' slips')+' along the way.':'No slips. Lovely!');return}
      render();
    }else{m.err++;m.bad=[a,{side,i}];render();setTimeout(()=>{m.bad=null;if(Q&&Q.queue[Q.i]===q)render()},550)}
  },
  mic:()=>{
    const q=Q.queue[Q.i];if(Q.fb)return;
    const sp=q.sp||{s:'idle'};
    if(sp.s==='listening')return;
    if(!SR||SRX.rec||['rec','recording','recdone','norec'].includes(sp.s))return toggleRec(q);
    q.sp={s:'listening'};render();
    attemptListen(q,SRX.lang?[SRX.lang]:['af-ZA','nl-NL']);
  },
  userec:()=>{const q=Q.queue[Q.i];SRX.rec=true;q.sp={s:'rec'};render()},
  playrec:()=>{const q=Q.queue[Q.i];if(q.sp&&q.sp.url)playUrl(q.sp.url)},
  selfok:()=>answer(true,'Saying it aloud is the best practice there is.'),
  skip:()=>{Q.total--;if(Q.total<1)Q.total=1;advance()},
  next:()=>advance(),
  gpush:async()=>{V.msg='Saving…';render();V.msg=await push();render()},
  gpull:async()=>{V.msg='Loading…';render();V.msg=await pull();render()},
  export:()=>{const b=new Blob([payload()],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='afrikaans-progress.json';a.click()},
  reset:()=>{if(confirm('Erase all progress on this device? This cannot be undone.')){const g=S.gh;S=blank();S.gh=g;save();V={name:'home'};render()}}
};
function speak_if_left(q,side,i){if(side==='L')speak(q.items[i][0])}

['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault()));
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t||t.disabled)return;const f=ACT[t.dataset.act];if(f)f(t,e)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='ti')ACT.check()});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='imp'&&t.files[0]){
    t.files[0].text().then(x=>{try{const r=JSON.parse(x);const g=S.gh;S=Object.assign(blank(),r);S.gh=g;save();V={name:'home'};render()}catch(err){V.msg='That file could not be read.';render()}});return;
  }
  const b=t.dataset&&t.dataset.bind;if(!b)return;
  let v=t.value;if(b==='rate')v=parseFloat(v);
  if(b.startsWith('gh.'))S.gh[b.slice(3)]=v.trim();else S[b]=v;
  save();
});
render();
})();
