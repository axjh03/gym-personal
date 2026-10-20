import { useEffect, useMemo, useRef, useState } from 'react';
import catalog from './data/exercises.json';
import media from './data/media.json';
import { plan, todayIndex } from './data/plan';
import { coach } from './data/coach';
import { beginnerIds } from './data/beginner';
import { cardio, stretches } from './data/routines';
import './App.css';

const byId = Object.fromEntries(catalog.map(exercise => [exercise.id, exercise]));
const beginner = new Set([...plan.flatMap(day => day.exercises.map(([id]) => id)), ...beginnerIds]);
const equipmentNames = ['Machines', 'Cables', 'Dumbbells', 'Barbells', 'Bodyweight', 'Kettlebells', 'Bands', 'Ball & Foam roller', 'Cardio machines', 'Stretching'];
const muscleNames = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Abs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'];
const advancedCategories = new Set(['strongman', 'olympic weightlifting', 'powerlifting']);

function equipmentGroup(exercise) {
  if (exercise.category === 'stretching') return 'Stretching';
  if (exercise.category === 'cardio') return 'Cardio machines';
  const groups = { machine: 'Machines', cable: 'Cables', dumbbell: 'Dumbbells', barbell: 'Barbells', 'e-z curl bar': 'Barbells', kettlebells: 'Kettlebells', bands: 'Bands', 'exercise ball': 'Ball & Foam roller', 'medicine ball': 'Ball & Foam roller', 'foam roll': 'Ball & Foam roller', 'body only': 'Bodyweight' };
  if (groups[exercise.equipment]) return groups[exercise.equipment];
  const name = exercise.name.toLowerCase();
  if (/cable/.test(name)) return 'Cables';
  if (/dumbbell/.test(name)) return 'Dumbbells';
  if (/barbell|ez.bar/.test(name)) return 'Barbells';
  if (/machine|leg press|hack squat/.test(name)) return 'Machines';
  if (/band/.test(name)) return 'Bands';
  return 'Bodyweight';
}

function muscleMatches(exercise, filter) {
  if (!filter) return true;
  const muscles = [...(exercise.primaryMuscles || []), ...(exercise.secondaryMuscles || [])].join(' ').toLowerCase();
  const groups = { Chest: /chest/, Back: /latissimus|middle back|lower back|traps|rhomboid/, Shoulders: /shoulder|deltoid/, Biceps: /biceps/, Triceps: /triceps/, Forearms: /forearm/, Abs: /abdominal|oblique/, Quads: /quadriceps/, Hamstrings: /hamstring/, Glutes: /glute/, Calves: /calves/ };
  return groups[filter].test(muscles);
}

function useLocalDay() {
  const [day, setDay] = useState(() => todayIndex());
  useEffect(() => {
    let timer;
    const refresh = () => {
      setDay(todayIndex());
      const now = new Date();
      timer = setTimeout(refresh, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime() + 50);
    };
    const onVisibility = () => { if (!document.hidden) { clearTimeout(timer); refresh(); } };
    refresh();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return day;
}

function Demo({ id, large = false }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [frameFailed, setFrameFailed] = useState(false);
  const [gifFailed, setGifFailed] = useState(false);
  useEffect(() => {
    setFrameFailed(false); setGifFailed(false); setPaused(false);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '120px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [id]);
  const source = media[id];
  const frames = source?.frames;
  const animated = source?.animated;
  const name = byId[id]?.name || id;
  return <button ref={ref} type="button" className={`demo ${large ? 'demo-large' : ''} ${paused || !visible ? 'is-paused' : ''}`} onClick={event => { event.stopPropagation(); setPaused(value => !value); }} aria-label={`${name} demonstration, ${paused ? 'play' : 'pause'}`}>
    {(!frames?.length || frameFailed) && (!animated || gifFailed || paused) ? <span className="demo-fallback">{name}<small>Demo unavailable</small></span> : <>
      {frames?.length === 2 && <>
        <img className="demo-frame frame-start" src={frames[0]} alt={`${name} start position`} loading="lazy" onError={() => setFrameFailed(true)} />
        <img className="demo-frame frame-end" src={frames[1]} alt={`${name} end position`} loading="lazy" onError={() => setFrameFailed(true)} />
        <span className="frame-label label-start">Start</span><span className="frame-label label-end">End</span>
      </>}
      {/* shortcut: pausing a custom GIF shows its still photos, capture the exact GIF frame if that becomes important. */}
      {animated && !paused && !gifFailed && <img className="demo-gif" src={animated} alt={`${name} demonstration`} loading="lazy" onError={() => setGifFailed(true)} />}
      <span className="demo-control" aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
    </>}
  </button>;
}

function ItemRow({ id, detail, onOpen }) {
  const name = byId[id]?.name || id;
  return <div className="item-row"><Demo id={id} /><button className="item-text" type="button" onClick={onOpen}><strong>{name}</strong><span>{detail}</span></button><button className="row-arrow" type="button" aria-label={`Open ${name}`} onClick={onOpen}>›</button></div>;
}

function App() {
  const day = useLocalDay();
  const [hash, setHash] = useState(window.location.hash || '#/plan');
  const [tab, setTab] = useState('plan');
  const [list, setList] = useState([]);
  const [planDetail, setPlanDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState('');
  const [muscle, setMuscle] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [limit, setLimit] = useState(30);
  useEffect(() => {
    const update = () => {
      const next = window.location.hash || '#/plan';
      setHash(next);
      if (!next.startsWith('#/ex/')) setTab(next.slice(2) || 'plan');
    };
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const openedId = hash.startsWith('#/ex/') ? decodeURIComponent(hash.slice(5)) : null;
  const close = () => { window.location.hash = `#/${tab}`; };
  const open = (id, ids, detail = null) => { setList(ids); setPlanDetail(detail); window.location.hash = `#/ex/${encodeURIComponent(id)}`; };
  const current = plan[day];
  const currentIds = current.exercises.map(([id]) => id);
  const filtered = useMemo(() => catalog.filter(exercise =>
    (showAll || beginner.has(exercise.id)) && (advanced || !advancedCategories.has(exercise.category)) &&
    (!equipment || equipmentGroup(exercise) === equipment) && muscleMatches(exercise, muscle) &&
    (!search || `${exercise.name} ${exercise.id}`.toLowerCase().includes(search.trim().toLowerCase()))
  ), [showAll, advanced, equipment, muscle, search]);
  const detail = byId[openedId];
  const currentList = list.length ? list : catalog.map(x => x.id);
  const detailIndex = currentList.indexOf(openedId);
  const prescription = planDetail?.find(([id]) => id === openedId)?.[1];
  let startY = 0;

  return <div className="app">
    {detail ? <main className="detail-page" onTouchStart={event => { startY = event.touches[0].clientY; }} onTouchEnd={event => { if (event.changedTouches[0].clientY - startY > 100) close(); }}>
      <header className="detail-top"><button type="button" onClick={close} aria-label="Back to previous tab">←</button><span>EXERCISE GUIDE</span><span>{detailIndex >= 0 ? `${detailIndex + 1} / ${currentList.length}` : ''}</span></header>
      <Demo id={detail.id} large />
      <div className="detail-body"><p className="eyebrow">MOVEMENT GUIDE</p><h1>{detail.name}</h1><div className="chips-static"><span>{detail.primaryMuscles?.join(' · ') || 'Full body'}</span><span>{equipmentGroup(detail)}</span></div>
        {prescription && <p className="prescription">{prescription}{prescription.includes('×') ? ' · rest 60–90 s' : ''}</p>}
        {['SETUP', 'MOVE', 'AVOID'].map((label, index) => <section className="cue" key={label}><b>{label}</b><p>{(coach[detail.id] || fallbackCues())[index]}</p></section>)}
        <div className="detail-nav"><button type="button" disabled={detailIndex <= 0} onClick={() => { window.location.hash = `#/ex/${currentList[detailIndex - 1]}`; }}>← Prev</button><button type="button" disabled={detailIndex < 0 || detailIndex >= currentList.length - 1} onClick={() => { window.location.hash = `#/ex/${currentList[detailIndex + 1]}`; }}>Next →</button></div>
      </div>
    </main> : <>
      <header className="site-header"><div className="brand-mark">A<span>·</span>G</div><div className="header-right"><span>THE GYM GUIDE</span><strong>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</strong></div></header>
      <main className="main-content">
        {tab === 'plan' && <>
          <div className="section-head"><p className="eyebrow">YOUR WEEK / 01</p><h1>Show up.<br /><em>Get stronger.</em></h1><p className="intro">Four lifting days. Low-impact cardio. One day at a time.</p></div>
          <div className="section-title"><h2>Weekly plan</h2><span>MON — SUN</span></div>
          <div className="week-list">{plan.map((session, index) => <div className={`day-row ${index === day ? 'today' : ''}`} key={session.day}><span className="day-code">{session.day.toUpperCase()}</span><span className="day-main"><strong>{session.title}</strong><small>{session.focus}</small></span><span className="day-end">{index === day ? <b>TODAY</b> : index === (day + 1) % 7 ? <b className="next-badge">NEXT</b> : null}<small>{session.cardio}</small></span></div>)}</div>
          <div className="section-title session-title" id="today-session"><div><p className="eyebrow">TODAY'S SESSION</p><h2>{current.title}</h2></div><span>{current.exercises.length} MOVES</span></div>
          <p className="session-note">3 sets · 60–90 s rest · stop 2–3 reps before failure</p>
          <div className="row-list">{current.exercises.map(([id, reps]) => <ItemRow key={id} id={id} detail={reps} onOpen={() => open(id, currentIds, current.exercises)} />)}</div>
          {[0, 1, 3, 4].includes(day) && <div className="finisher"><span>AFTER LIFTING</span><strong>{current.cardio} incline walk</strong><small>Easy enough to speak in full sentences.</small></div>}
        </>}
        {tab === 'cardio' && <>
          <div className="section-head"><p className="eyebrow">BUILD YOUR ENGINE / 02</p><h1>Keep moving.<br /><em>Keep it easy.</em></h1></div>
          <div className="target"><span>WEEKLY TARGET</span><strong>150–300 <small>MIN</small></strong><p>Moderate cardio · this plan averages about 200–250 min.</p><div>Talk test: full sentences · effort 4–5/10</div></div>
          <div className="section-title"><h2>Choose a machine</h2><span>START EASY</span></div>
          <div className="machine-list">{cardio.map((machine, index) => <div className="machine" key={machine.id}><Demo id={machine.id} /><div className="machine-copy"><div className="machine-heading"><span>0{index + 1}</span><h3>{machine.label}</h3></div><p>{machine.detail}</p><ul>{machine.cues.map(cue => <li key={cue}>{cue}</li>)}</ul><button type="button" onClick={() => open(machine.id, cardio.map(x => x.id))}>View demo ↗</button></div></div>)}</div>
          <div className="section-title"><h2>12-week ramp</h2><span>GUIDE ONLY</span></div>
          <div className="ramp"><div><b>WK 1–2</b><span>Incline walk · 35–45 min</span></div><div><b>WK 3–4</b><span>Add 1 min easy jog every 3 min</span></div><div><b>WK 5–8</b><span>2 min jog / 2 min walk × 8–10; bike or elliptical once a week</span></div><div><b>WK 9–12</b><span>3 min jog / 1 min walk, or 25–30 min steady</span></div></div>
          <p className="safety">Sharp joint pain? Stop and switch machine.</p>
        </>}
        {tab === 'library' && <>
          <div className="section-head"><p className="eyebrow">EXPLORE MOVEMENTS / 03</p><h1>Your move<br /><em>library.</em></h1></div>
          <label className="search"><span>⌕</span><input aria-label="Search exercises" type="search" placeholder="Search exercises" value={search} onChange={event => { setSearch(event.target.value); setLimit(30); }} /></label>
          <div className="filter-label">EQUIPMENT</div><div className="chip-scroll"><button className={!equipment ? 'active' : ''} onClick={() => { setEquipment(''); setLimit(30); }}>All</button>{equipmentNames.map(name => <button key={name} className={equipment === name ? 'active' : ''} onClick={() => { setEquipment(name); setLimit(30); }}>{name}</button>)}</div>
          <div className="filter-label">MUSCLE</div><div className="chip-scroll"><button className={!muscle ? 'active' : ''} onClick={() => { setMuscle(''); setLimit(30); }}>All</button>{muscleNames.map(name => <button key={name} className={muscle === name ? 'active' : ''} onClick={() => { setMuscle(name); setLimit(30); }}>{name}</button>)}</div>
          <div className="library-controls"><label><input type="checkbox" checked={showAll} onChange={event => { setShowAll(event.target.checked); setLimit(30); }} /> Show all</label><label><input type="checkbox" checked={advanced} onChange={event => { setAdvanced(event.target.checked); setLimit(30); }} /> Advanced</label></div>
          <div className="section-title"><h2>{showAll ? 'All exercises' : 'Beginner picks'}</h2><span>{filtered.length} MOVES</span></div>
          <div className="library-grid">{filtered.slice(0, limit).map(exercise => <div className="library-tile" key={exercise.id}><Demo id={exercise.id} /><button type="button" onClick={() => open(exercise.id, filtered.map(x => x.id))}><strong>{exercise.name}</strong><span>{equipmentGroup(exercise)} · {exercise.primaryMuscles?.[0] || 'Full body'}</span></button></div>)}</div>
          {filtered.length > limit && <button className="more-button" type="button" onClick={() => setLimit(limit + 30)}>Show more ↓</button>}
          {!filtered.length && <p className="empty">No movements match these filters.</p>}
        </>}
        {tab === 'stretch' && <>
          <div className="section-head"><p className="eyebrow">RESET & RECOVER / 04</p><h1>Move better.<br /><em>Feel better.</em></h1></div>
          {stretches.map((routine, index) => <section className="stretch-routine" key={routine.title}><div className="section-title"><div><p className="eyebrow">ROUTINE 0{index + 1}</p><h2>{routine.title}</h2></div><span>{routine.detail}</span></div><div className="row-list">{routine.items.map(([id, hold]) => <ItemRow key={id} id={id} detail={hold} onOpen={() => open(id, routine.items.map(([item]) => item))} />)}</div></section>)}
        </>}
      </main>
      <nav className="tab-bar" aria-label="Main navigation">{[['plan', 'Plan', '▦'], ['cardio', 'Cardio', '◌'], ['library', 'Library', '▤'], ['stretch', 'Stretch', '✳']].map(([key, label, icon]) => <a key={key} href={`#/${key}`} className={tab === key ? 'active' : ''} aria-current={tab === key ? 'page' : undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></a>)}</nav>
    </>}
  </div>;
}

function fallbackCues() {
  return ['Set up in a comfortable starting position.', 'Move slowly through a comfortable range.', 'Avoid forcing the range or holding your breath.'];
}

export default App;
