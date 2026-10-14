import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HeartHandshake, Volume2, Send, ShieldCheck, MessageCircle, Accessibility, CircleHelp, Wifi, CheckCircle2 } from 'lucide-react';
import './style.css';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const fallback = [
  {key:'HELP', text:'I need help', emoji:'🆘'},
  {key:'WATER', text:'I need water, please', emoji:'💧'},
  {key:'DOCTOR', text:'I need to speak to a doctor', emoji:'🩺'},
  {key:'FOOD', text:'I need food, please', emoji:'🍎'},
  {key:'EMERGENCY', text:'This is an emergency. Please help me now.', emoji:'🚨'},
  {key:'BATHROOM', text:'Where is the bathroom?', emoji:'🚻'},
  {key:'PAIN', text:'I am in pain and need assistance', emoji:'❤️‍🩹'},
  {key:'THANKS', text:'Thank you for helping me', emoji:'💙'}
];
function App() {
  const [phrases,setPhrases] = useState(fallback);
  const [messages,setMessages] = useState([]);
  const [selected,setSelected] = useState(fallback[0]);
  const [reply,setReply] = useState('');
  const [sender,setSender] = useState('visitor');
  const [status,setStatus] = useState('Connecting');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);

  async function load() {
    try {
      const [p,m] = await Promise.all([fetch(`${API}/api/phrases`),fetch(`${API}/api/messages`)]);
      if (p.ok) setPhrases(await p.json());
      if (m.ok) setMessages(await m.json());
      setStatus('Connected to SignBridge');
    } catch { setStatus('Offline demo mode · API will reconnect automatically'); }
  }
  useEffect(() => { load(); const t=setInterval(load,5000); return ()=>clearInterval(t); }, []);
  function speak(text) {
    if (!('speechSynthesis' in window)) { setNotice('Text-to-speech is not supported by this browser.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.rate=0.9; window.speechSynthesis.speak(u);
  }
  async function send(text, from=sender) {
    setBusy(true); setNotice('');
    try {
      const r=await fetch(`${API}/api/messages`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,sender:from})});
      if(!r.ok) throw new Error('API request failed');
      const item=await r.json(); setMessages(old=>[...old,item].slice(-100)); setReply('');
    } catch {
      setMessages(old=>[...old,{id:Date.now(),text,sender:from,createdAt:new Date().toISOString()}].slice(-100));
      setNotice('Saved in this screen only while offline. Check backend deployment to sync messages.');
    } finally { setBusy(false); }
  }
  const emergency=selected?.key==='EMERGENCY';
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><HeartHandshake size={25}/></span><span><b>SignBridge</b><small>Communication without barriers</small></span></a>
      <div className="top-actions"><span className="live"><i/> {status}</span><button className="profile" onClick={()=>setSender(sender==='visitor'?'staff':'visitor')} aria-label="Switch role">Role: {sender==='visitor'?'Visitor':'Staff'} ↔</button></div>
    </header>
    <main>
      <section className="hero">
        <div><div className="eyebrow"><Accessibility size={15}/> ACCESSIBILITY FIRST</div><h1>Every voice deserves<br/><span>to be understood.</span></h1><p>Choose what you need. We’ll make your message clear, visible, and heard.</p></div>
        <div className="hero-art" aria-hidden="true"><div className="art-ring ring1"/><div className="art-ring ring2"/><div className="art-center"><HeartHandshake size={58}/></div><span className="bubble bubble-one">Hello 👋</span><span className="bubble bubble-two">I can help</span></div>
      </section>
      <div className="content-grid">
        <section className="panel requests">
          <div className="section-heading"><div><span className="step">01</span><div><h2>What do you need?</h2><p>Tap a phrase to prepare your message.</p></div></div><span className="pill">QUICK PHRASES</span></div>
          <div className="phrase-grid">{phrases.map(p=><button key={p.key} className={`phrase ${selected?.key===p.key?'chosen':''} ${p.key==='EMERGENCY'?'danger':''}`} onClick={()=>setSelected(p)} aria-pressed={selected?.key===p.key}><span className="phrase-emoji">{p.emoji}</span><b>{p.key}</b><span className="phrase-text">{p.text}</span></button>)}</div>
          <div className={`prepared ${emergency?'prepared-danger':''}`}><div className="prepared-title"><span>YOUR MESSAGE</span><span className="secure"><ShieldCheck size={14}/> Clear & ready</span></div><div className="prepared-message"><span>{selected?.emoji || '💬'}</span><p>{selected?.text}</p><button className="icon-btn" onClick={()=>speak(selected?.text || '')} aria-label="Speak message aloud"><Volume2 size={20}/></button></div><button disabled={busy} className={`send-btn ${emergency?'emergency-btn':''}`} onClick={()=>send(selected?.text || '')}><Send size={17}/>{emergency?'Send emergency request':'Send message'} <span>→</span></button></div>
          <p className="privacy-note"><ShieldCheck size={14}/> Essential requests work without AI. Text-to-speech uses your browser.</p>
        </section>
        <section className="panel conversation">
          <div className="section-heading"><div><span className="step">02</span><div><h2>Conversation</h2><p>Messages shared with the service desk.</p></div></div><span className="conversation-icon"><MessageCircle size={18}/></span></div>
          <div className="message-list" aria-live="polite">{messages.length===0?<div className="empty"><div><MessageCircle size={25}/></div><b>Your conversation starts here</b><p>Send a quick phrase or type a message below.</p></div>:messages.map((m,i)=><div key={m.id || i} className={`message-row ${m.sender==='staff'?'from-staff':'from-visitor'}`}><span className="avatar">{m.sender==='staff'?'S':'Y'}</span><div className="message-content"><small>{m.sender==='staff'?'Service staff':'You'} · {m.createdAt?new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'now'}</small><div className="message-bubble">{m.text}</div><button className="speak-link" onClick={()=>speak(m.text)}><Volume2 size={13}/> Listen</button></div></div>)}</div>
          <form className="reply-form" onSubmit={e=>{e.preventDefault();if(reply.trim())send(reply.trim());}}><label className="sr-only" htmlFor="reply">Write a message</label><input id="reply" value={reply} onChange={e=>setReply(e.target.value)} placeholder={sender==='staff'?'Write a reply to the visitor…':'Type another message…'} maxLength={2000}/><button disabled={!reply.trim()||busy} aria-label="Send typed message"><Send size={18}/></button></form>
          {notice&&<p className="notice" role="status">{notice}</p>}
          <div className="conversation-foot"><span><Wifi size={14}/> Auto-refreshes every 5 seconds</span><span><CheckCircle2 size={14}/> Accessible by design</span></div>
        </section>
      </div>
      <section className="help-strip"><div className="help-icon"><CircleHelp size={22}/></div><div><b>Need a different phrase?</b><p>Type a custom message in the conversation box. For urgent danger, contact local emergency services directly.</p></div><span className="help-tag">BUILT FOR EVERYONE ♥</span></section>
      <footer><a className="footer-brand" href="#"><HeartHandshake size={18}/> SignBridge</a><span>Practical communication. More independence. Less barriers.</span><span>Made with care <span className="heart">♥</span></span></footer>
    </main>
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
