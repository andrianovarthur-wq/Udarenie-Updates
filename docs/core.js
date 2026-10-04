export const vowels='аеёиоуыэюя';
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function initialState(){return {version:1,custom:[],marks:[],records:{},history:[],settings:{theme:'dark',accent:'copper',goal:20,length:20,font:1},session:null};}
export function recordAnswer(state,word,correct,now=Date.now()){
 const old=state.records[word.id]||{correct:0,wrong:0,run:0,due:0};
 const run=correct?old.run+1:0;
 state.records[word.id]={correct:old.correct+Number(correct),wrong:old.wrong+Number(!correct),run,last:now,due:now+(correct?[0,1,3,7,14,30][Math.min(run,5)]*86400000:60000)};
 state.history.push({id:word.id,correct,at:now,day:dayKey(new Date(now))});
}
export function isHard(record){return !!record&&record.wrong>0&&record.run<3;}
export function weight(record,marked,now=Date.now()){if(!record)return marked?5:3;return (isHard(record)?10:record.due<=now?4:.4)+(marked?2:0);}
export function chooseWord(pool,state,recent=[],random=Math.random,now=Date.now()){
 let eligible=pool.filter(w=>!recent.slice(-Math.min(3,pool.length-1)).includes(w.id));if(!eligible.length)eligible=pool;
 const weighted=eligible.map(w=>({w,n:weight(state.records[w.id],state.marks.includes(w.id),now)}));let value=random()*weighted.reduce((s,w)=>s+w.n,0);
 for(const item of weighted){value-=item.n;if(value<0)return item.w;}return weighted.at(-1)?.w;
}
export function streak(history,now=new Date()){
 const days=new Set(history.map(h=>h.day));const date=new Date(now);if(!days.has(dayKey(date)))date.setDate(date.getDate()-1);let n=0;while(days.has(dayKey(date))){n++;date.setDate(date.getDate()-1);}return n;
}
export function validateBackup(input){
 if(!input||input.version!==1||!Array.isArray(input.custom)||!Array.isArray(input.marks)||!Array.isArray(input.history)||!input.records||!input.settings)throw Error('Это не резервная копия приложения.');
 for(const w of input.custom){if(typeof w.id!=='string'||typeof w.text!=='string'||!/^[а-яё-]{2,40}$/i.test(w.text)||!Number.isInteger(w.stress)||!vowels.includes(w.text[w.stress]?.toLowerCase()))throw Error('В копии есть некорректное слово.');}
 if(input.history.some(h=>typeof h.id!=='string'||typeof h.correct!=='boolean'||!Number.isFinite(h.at)||!/^\d{4}-\d{2}-\d{2}$/.test(h.day)))throw Error('Повреждена история ответов.');
 for(const r of Object.values(input.records)){if(!r||!['correct','wrong','run','due'].every(k=>Number.isFinite(r[k])&&r[k]>=0))throw Error('Повреждена статистика.');}
 return {...input,session:null,settings:{theme:input.settings.theme==='light'?'light':'dark',accent:['copper','sage','clay'].includes(input.settings.accent)?input.settings.accent:'copper',goal:Math.min(100,Math.max(5,Number(input.settings.goal)||20)),length:Math.min(50,Math.max(5,Number(input.settings.length)||20)),font:input.settings.font===1.15?1.15:1}};
}
