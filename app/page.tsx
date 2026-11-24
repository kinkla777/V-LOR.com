'use client';

import { useEffect, useState } from 'react';

type User = { id: string; username: string; email?: string; role: string; bio?: string; createdAt?: string };
type Article = { id: string; title: string; summary: string; category: string; createdAt: string; author: { username: string } };
type Product = { id: string; name: string; description: string; price: number };
type ChatMessage = { id: string; body: string; createdAt: string; user: { username: string; role: string } };

const roleOrder = ['MEMBER', 'MODERATOR', 'ADMIN', 'OWNER'];
const roleMark: Record<string, string> = { OWNER: '♛', ADMIN: '✦', MODERATOR: '◆', MEMBER: '●' };
const demoNews: Article[] = [
  { id: 'n1', title: 'THE NEXT DROP STARTS HERE', summary: 'A new season, a new standard. VΛLOR is recruiting dedicated players ready to make every match count.', category: 'TEAM NEWS', createdAt: new Date().toISOString(), author: { username: 'VΛLOR' } },
  { id: 'n2', title: 'JOIN THE BATTLEGROUNDS', summary: 'Squad up with the community, find teammates, and get the latest tournament announcements in Discord.', category: 'COMMUNITY', createdAt: new Date().toISOString(), author: { username: 'VΛLOR' } },
];

export default function Home() {
  const [section, setSection] = useState('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [news, setNews] = useState<Article[]>(demoNews);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<'login' | 'register' | 'profile' | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadData() {
    const [me, memberData, newsData, shopData, chatData] = await Promise.all([
      fetch('/api/auth/me').then(r => r.json()).catch(() => null),
      fetch('/api/members').then(r => r.json()).catch(() => []),
      fetch('/api/news').then(r => r.json()).catch(() => []),
      fetch('/api/shop').then(r => r.json()).catch(() => []),
      fetch('/api/chat').then(r => r.json()).catch(() => []),
    ]);
    setUser(me?.user ?? null);
    setMembers(Array.isArray(memberData) ? memberData : []);
    if (Array.isArray(newsData) && newsData.length) setNews(newsData);
    setProducts(Array.isArray(shopData) ? shopData : []);
    setMessages(Array.isArray(chatData) ? chatData : []);
  }
  useEffect(() => { void loadData(); }, []);

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice('');
    const form = new FormData(event.currentTarget);
    const isRegister = modal === 'register';
    try {
      const response = await fetch(`/api/auth/${isRegister ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not sign in.');
      setUser(result.user); setModal(null); setNotice(`Welcome${isRegister ? ' to VΛLOR' : ' back'}, ${result.user.username}.`); await loadData();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); setSection('HOME'); setNotice('Signed out.'); }
  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const body = new FormData(form).get('body');
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
    const result = await response.json(); if (!response.ok) { setNotice(result.error); return; } form.reset(); await loadData();
  }
  async function changeRole(member: User, role: string) {
    const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: member.id, role }) });
    const result = await response.json(); setNotice(response.ok ? `Updated ${member.username} to ${role}.` : result.error); await loadData();
  }
  const canAdmin = user && ['OWNER', 'ADMIN'].includes(user.role);

  return <main>
    <div className="topline"><span>VΛLOR ESPORTS <i>•</i> PUBG BATTLEGROUNDS</span><span className="top-right">EST. 2024 <i>///</i> PLAY WITH PURPOSE</span></div>
    <header className="navbar">
      <button className="brand" onClick={() => setSection('HOME')} aria-label="VΛLOR home"><span className="brand-mark">V</span><span>VΛLOR<small>ESPORTS</small></span></button>
      <nav>{['HOME', 'NEWS', 'MEMBERS', 'CHAT', 'SHOP'].map(item => <button key={item} className={section === item ? 'navlink active' : 'navlink'} onClick={() => setSection(item)}>{item}</button>)}{canAdmin && <button className={section === 'ADMIN' ? 'navlink active' : 'navlink'} onClick={() => setSection('ADMIN')}>CONTROL ROOM</button>}</nav>
      <div className="account">{user ? <><button className="user-chip" onClick={() => setModal('profile')}><span className="role-icon">{roleMark[user.role]}</span>{user.username}</button><button className="outline-btn compact" onClick={logout}>LOG OUT</button></> : <><button className="outline-btn compact" onClick={() => setModal('login')}>LOG IN</button><button className="gold-btn compact" onClick={() => setModal('register')}>JOIN VΛLOR</button></>}</div>
    </header>

    {notice && <button className="notice" onClick={() => setNotice('')}>{notice}<span>×</span></button>}
    {section === 'HOME' && <>
      <section className="hero"><div className="hero-grid"></div><div className="hero-copy"><div className="eyebrow"><span></span> PUBG ESPORTS • COMMUNITY • COMPETITION</div><h1>BUILT FOR<br/><em>THE DROP.</em></h1><p>We don’t wait for the zone to close.<br/>We move first. We move together.</p><div className="hero-actions"><button className="gold-btn" onClick={() => setModal('register')}>BECOME A MEMBER <b>↗</b></button><a className="outline-btn" href="https://bigplay.gg/en" target="_blank" rel="noreferrer">FIND A TOURNAMENT <b>↗</b></a></div><div className="hero-stats"><div><b>{members.length || '—'}</b><span>OPERATORS</span></div><div><b>01</b><span>MISSION</span></div><div><b>∞</b><span>DRIVE</span></div></div></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="art-v">V</div><div className="art-label">VΛLOR / 001<br/>DROP ZONE: ANYWHERE</div><div className="crosshair">+</div></div><div className="hero-bottom"><span>ERANGEL // MIRAMAR // DESTON</span><span>35° 07' 12.0" N&nbsp;&nbsp; 128° 58' 24.0" E</span></div></section>
      <section className="ticker"><span>NO SHORTCUTS</span><b>✳</b><span>NO SECOND PLACE</span><b>✳</b><span>ALL IN, ALL TOGETHER</span><b>✳</b><span>VΛLOR ESPORTS</span><b>✳</b><span>NO SHORTCUTS</span></section>
      <section className="content-section"><div className="section-heading"><div><div className="eyebrow">01 / THE BRIEF</div><h2>MORE THAN<br/><em>A CLAN.</em></h2></div><p>A competitive PUBG community built on discipline, teamwork, and the hunger to improve. Find your squad. Earn your place. Own the drop.</p></div><div className="feature-grid"><article className="feature-card"><span className="card-index">01</span><div className="feature-icon">⌖</div><h3>FIND YOUR SQUAD</h3><p>Meet operators who show up, communicate, and have your back when the circle gets tight.</p><button onClick={() => setSection('MEMBERS')}>MEET THE MEMBERS ↗</button></article><article className="feature-card"><span className="card-index">02</span><div className="feature-icon">⚑</div><h3>PLAY TO WIN</h3><p>Join community events and compete in tournaments. Every match is a chance to level up.</p><a href="https://bigplay.gg/en" target="_blank" rel="noreferrer">EXPLORE TOURNAMENTS ↗</a></article><article className="feature-card"><span className="card-index">03</span><div className="feature-icon">◉</div><h3>STAY CONNECTED</h3><p>Get announcements, squad up, and be part of the action between drops.</p><a href="https://discord.gg/X9ddrR5huU" target="_blank" rel="noreferrer">JOIN OUR DISCORD ↗</a></article></div></section>
      <section className="discord-banner"><div><div className="eyebrow">YOUR NEXT DROP STARTS HERE</div><h2>READY TO<br/><em>LOCK IN?</em></h2></div><a className="gold-btn" href="https://discord.gg/X9ddrR5huU" target="_blank" rel="noreferrer">JOIN THE DISCORD <b>↗</b></a></section>
    </>}

    {section === 'NEWS' && <section className="page-section"><div className="eyebrow">02 / INTEL FEED</div><h1 className="page-title">LATEST <em>INTEL.</em></h1><p className="page-lead">Updates from the VΛLOR battleground.</p><div className="news-grid">{news.map((item, index) => <article className="news-card" key={item.id}><div className="news-visual"><span>{String(index + 1).padStart(2, '0')} / VΛLOR DISPATCH</span><b>V</b></div><div className="news-meta"><span>{item.category}</span><span>{new Date(item.createdAt).toLocaleDateString()}</span></div><h2>{item.title}</h2><p>{item.summary}</p><small>BY {item.author?.username ?? 'VΛLOR'}</small></article>)}</div></section>}

    {section === 'MEMBERS' && <section className="page-section"><div className="eyebrow">03 / ROSTER</div><h1 className="page-title">THE <em>OPERATORS.</em></h1><p className="page-lead">Every role has a purpose. Every member has a place.</p>{members.length ? <div className="members-grid">{members.map(member => <article className="member-card" key={member.id}><div className="member-avatar">{member.username.slice(0, 1).toUpperCase()}</div><div><span className={`role-label ${member.role.toLowerCase()}`}>{roleMark[member.role]} {member.role}</span><h3>{member.username}</h3><p>{member.bio || 'Ready for the next drop.'}</p></div></article>)}</div> : <div className="empty-state">Roster is waiting for its first operators. <button onClick={() => setModal('register')}>ENLIST NOW ↗</button></div>}</section>}

    {section === 'CHAT' && <section className="page-section"><div className="eyebrow">04 / COMMS</div><h1 className="page-title">SQUAD <em>COMMS.</em></h1><p className="page-lead">Keep it tactical. Be respectful. No spam.</p><div className="chat-box"><div className="chat-header"><span><i className="online-dot"></i> VΛLOR COMMUNITY COMMS</span><span>{messages.length} MESSAGES</span></div><div className="chat-messages">{messages.length ? messages.map(message => <div className="chat-message" key={message.id}><span className={`role-icon ${message.user.role.toLowerCase()}`}>{roleMark[message.user.role]}</span><div><b>{message.user.username} <small>{message.user.role}</small></b><p>{message.body}</p></div><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>) : <div className="empty-state">No messages yet. Be the first to check in.</div>}</div>{user ? <form className="chat-form" onSubmit={sendMessage}><input name="body" maxLength={500} placeholder="Send a message to the squad..." required/><button className="gold-btn">SEND ↗</button></form> : <div className="chat-login">Log in to join the conversation. <button onClick={() => setModal('login')}>LOG IN ↗</button></div>}</div></section>}

    {section === 'SHOP' && <section className="page-section"><div className="eyebrow">05 / QUARTERMASTER</div><h1 className="page-title">THE <em>ARMORY.</em></h1><p className="page-lead">Official VΛLOR gear. More drops coming soon.</p><div className="product-grid">{products.length ? products.map(product => <article className="product-card" key={product.id}><div className="product-image"><span>VΛLOR / SUPPLY</span><b>V</b></div><h3>{product.name}</h3><p>{product.description}</p><div className="product-price">${(product.price / 100).toFixed(2)} <span>COMING SOON</span></div></article>) : <div className="empty-state">The armory is being stocked. Check back soon.</div>}</div></section>}

    {section === 'ADMIN' && canAdmin && <section className="page-section"><div className="eyebrow">06 / RESTRICTED ACCESS — {user.role}</div><h1 className="page-title">CONTROL <em>ROOM.</em></h1><p className="page-lead">Role hierarchy: Owner → Admin → Moderator → Member. Only the Owner can assign or revoke Admin/Owner privileges.</p><div className="admin-panel"><div className="admin-heading"><h2>MEMBER PERMISSIONS</h2><span>{members.length} ACCOUNTS</span></div>{members.map(member => <div className="admin-row" key={member.id}><div><b>{member.username}</b><small>{member.email}</small></div><span className={`role-label ${member.role.toLowerCase()}`}>{roleMark[member.role]} {member.role}</span>{user.role === 'OWNER' && member.role !== 'OWNER' ? <select aria-label={`Set role for ${member.username}`} value={member.role} onChange={event => void changeRole(member, event.target.value)}>{roleOrder.filter(role => role !== 'OWNER').map(role => <option key={role} value={role}>{role}</option>)}</select> : <span className="locked">{member.role === 'OWNER' ? 'PROTECTED' : 'OWNER ONLY'}</span>}</div>)}</div><p className="admin-note">All new accounts are Members. The account matching OWNER_EMAIL in the server environment becomes the initial Owner. Admins cannot modify account roles; moderators and members cannot access this panel.</p></section>}

    <footer><button className="brand footer-brand" onClick={() => setSection('HOME')}><span className="brand-mark">V</span><span>VΛLOR<small>ESPORTS</small></span></button><span>DROP IN. LOCK IN. VΛLOR.</span><div><a href="https://discord.gg/X9ddrR5huU" target="_blank" rel="noreferrer">DISCORD ↗</a><a href="https://bigplay.gg/en" target="_blank" rel="noreferrer">TOURNAMENTS ↗</a></div><small>© {new Date().getFullYear()} VΛLOR ESPORTS</small></footer>

    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)}>×</button>{modal === 'profile' ? <><div className="eyebrow">OPERATOR PROFILE</div><h2>{user?.username}</h2><span className={`role-label ${user?.role.toLowerCase()}`}>{roleMark[user?.role ?? 'MEMBER']} {user?.role}</span><p>{user?.bio || 'Ready for the next drop.'}</p><button className="outline-btn" onClick={logout}>LOG OUT</button></> : <><div className="eyebrow">{modal === 'register' ? 'ENLISTMENT / 001' : 'OPERATOR ACCESS'}</div><h2>{modal === 'register' ? 'JOIN THE SQUAD.' : 'WELCOME BACK.'}</h2><p>{modal === 'register' ? 'Create your VΛLOR account.' : 'Sign in to your account.'}</p><form className="auth-form" onSubmit={submitAuth}>{modal === 'register' && <label>OPERATOR NAME<input name="username" minLength={3} maxLength={24} required placeholder="Your callsign"/></label>}<label>EMAIL<input name="email" type="email" required placeholder="operator@email.com"/></label><label>PASSWORD<input name="password" type="password" minLength={8} required placeholder="At least 8 characters"/></label><button className="gold-btn" disabled={busy}>{busy ? 'WORKING…' : modal === 'register' ? 'CREATE ACCOUNT ↗' : 'LOG IN ↗'}</button></form><button className="switch-auth" onClick={() => setModal(modal === 'register' ? 'login' : 'register')}>{modal === 'register' ? 'Already enlisted? Log in' : 'New operator? Create an account'}</button></>}</div></div>}
  </main>;
}
