import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import catalog from './data/exercises.json';
import media from './data/media.json';
import { plan, todayIndex } from './data/plan';
import { coach } from './data/coach';
import { cardio, stretches } from './data/routines';
import './App.css';

const byId = Object.fromEntries(catalog.map(exercise => [exercise.id, exercise]));
const library = [...catalog].sort((a, b) => Number(!!media[b.id]?.frames?.[0]?.startsWith('/exercises/')) - Number(!!media[a.id]?.frames?.[0]?.startsWith('/exercises/')));
const equipmentNames = ['Machines', 'Cables', 'Dumbbells', 'Barbells', 'Bodyweight', 'Kettlebells', 'Bands', 'Ball & Foam roller', 'Cardio machines', 'Stretching'];
const muscleNames = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Abs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'];
const sessionMuscles = {
  upper: new Set(['chest', 'lats', 'middle back', 'lower back', 'shoulders', 'biceps', 'triceps', 'forearms', 'traps']),
  lower: new Set(['quadriceps', 'hamstrings', 'glutes', 'calves', 'abdominals'])
};

function matchesSession(exercise, group) {
  if (group === 'recovery') return exercise.category === 'cardio' || exercise.category === 'stretching';
  return exercise.category === 'strength' && exercise.primaryMuscles?.some(muscle => sessionMuscles[group].has(muscle));
}

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

function Demo({ id, large = false, eager = false }) {
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
        <img className="demo-frame frame-start" src={frames[0]} alt={`${name} start position`} loading={large || eager ? 'eager' : 'lazy'} onError={() => setFrameFailed(true)} />
        <img className="demo-frame frame-end" src={frames[1]} alt={`${name} end position`} loading={large || eager ? 'eager' : 'lazy'} onError={() => setFrameFailed(true)} />
        <span className="frame-label label-start">Start</span><span className="frame-label label-end">End</span>
      </>}
      {/* shortcut: pausing a custom GIF shows its still photos, capture the exact GIF frame if that becomes important. */}
      {animated && !paused && !gifFailed && <img className="demo-gif" src={animated} alt={`${name} demonstration`} loading="lazy" onError={() => setGifFailed(true)} />}
      <span className="demo-control" aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
    </>}
  </button>;
}

function ItemRow({ id, detail, onOpen, eager = true }) {
  const name = byId[id]?.name || id;
  return <div className="item-row"><Demo id={id} eager={eager} /><button className="item-text" type="button" onClick={onOpen}><strong>{name}</strong><span>{detail}</span></button><button className="row-arrow" type="button" aria-label={`Open ${name}`} onClick={onOpen}>›</button></div>;
}

function App() {
  const day = useLocalDay();
  const [selectedDay, setSelectedDay] = useState(() => todayIndex());
  const swipeStart = useRef(null);
  const [hash, setHash] = useState(window.location.hash || '#/plan');
  const [tab, setTab] = useState('plan');
  const [list, setList] = useState([]);
  const [planDetail, setPlanDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState('');
  const [muscle, setMuscle] = useState('');
  const [limit, setLimit] = useState(30);
  const [planLimit, setPlanLimit] = useState(20);
  const [showDayOptions, setShowDayOptions] = useState(false);
  useEffect(() => setSelectedDay(day), [day]);
  useEffect(() => { setPlanLimit(20); setShowDayOptions(false); }, [selectedDay]);
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
  useLayoutEffect(() => window.scrollTo(0, 0), [hash]);
  const close = () => { window.location.hash = `#/${tab}`; };
  const open = (id, ids, detail = null) => { setList(ids); setPlanDetail(detail); window.location.hash = `#/ex/${encodeURIComponent(id)}`; };
  const current = plan[selectedDay];
  const currentIds = current.exercises.map(([id]) => id);
  const recommendedIds = [...currentIds, ...current.alternatives];
  const dayOptions = useMemo(() => {
    const session = plan[selectedDay];
    const recommended = new Set([...session.exercises.map(([id]) => id), ...session.alternatives]);
    return library.filter(exercise => matchesSession(exercise, session.group) && !recommended.has(exercise.id));
  }, [selectedDay]);
  const dayOptionIds = dayOptions.map(exercise => exercise.id);
  const filtered = useMemo(() => library.filter(exercise =>
    (!equipment || equipmentGroup(exercise) === equipment) && muscleMatches(exercise, muscle) &&
    (!search || `${exercise.name} ${exercise.id}`.toLowerCase().includes(search.trim().toLowerCase()))
  ), [equipment, muscle, search]);
  const detail = byId[openedId];
  const currentList = list.length ? list : catalog.map(x => x.id);
  const detailIndex = currentList.indexOf(openedId);
  const prescription = planDetail?.find(([id]) => id === openedId)?.[1];
  return <div className="app">
    {detail ? <main className="detail-page">
      <header className="detail-top" onTouchStart={event => { swipeStart.current = event.touches[0].clientY; }} onTouchEnd={event => { if (swipeStart.current !== null && event.changedTouches[0].clientY - swipeStart.current > 100) close(); swipeStart.current = null; }}><button type="button" onClick={close} aria-label="Back to previous tab">←</button><span>EXERCISE</span><span>{detailIndex >= 0 ? `${detailIndex + 1} / ${currentList.length}` : ''}</span></header>
      <Demo id={detail.id} large />
      <div className="detail-body"><h1>{detail.name}</h1><div className="chips-static"><span>{detail.primaryMuscles?.join(' · ') || 'Full body'}</span><span>{equipmentGroup(detail)}</span></div>
        {prescription && <p className="prescription">{prescription}{prescription.includes('×') ? ' · rest 60–90 s' : ''}</p>}
        {coach[detail.id] ? ['SETUP', 'MOVE', 'AVOID'].map((label, index) => <section className="cue" key={label}><b>{label}</b><p>{coach[detail.id][index]}</p></section>) : <section className="instructions"><h2>How to</h2>{detail.instructions?.length ? <ol>{detail.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol> : <p>No instructions in the exercise catalog.</p>}</section>}
        <div className="detail-nav"><button type="button" disabled={detailIndex <= 0} onClick={() => { window.location.hash = `#/ex/${currentList[detailIndex - 1]}`; }}>← Prev</button><button type="button" disabled={detailIndex < 0 || detailIndex >= currentList.length - 1} onClick={() => { window.location.hash = `#/ex/${currentList[detailIndex + 1]}`; }}>Next →</button></div>
      </div>
    </main> : <>
      <nav className="tab-bar" aria-label="Main navigation">{[['plan', 'Plan', '▦'], ['cardio', 'Cardio', '◌'], ['library', 'Library', '▤'], ['stretch', 'Stretch', '✳']].map(([key, label, icon]) => <a key={key} href={`#/${key}`} className={tab === key ? 'active' : ''} aria-current={tab === key ? 'page' : undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></a>)}</nav>
      <main className="main-content">
        {tab === 'plan' && <>
          <div className="page-title"><h1>Plan</h1></div>
          <div className="section-title"><h2>Weekly plan</h2><span>MON — SUN</span></div>
          <div className="week-list">{plan.map((session, index) => <button type="button" aria-pressed={selectedDay === index} className={`day-row ${index === day ? 'today' : ''} ${index === selectedDay ? 'selected' : ''}`} key={session.day} onClick={() => { setSelectedDay(index); document.getElementById('selected-session')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><span className="day-code">{session.day.toUpperCase()}</span><span className="day-main"><strong>{session.title}</strong><small>{session.focus}</small></span><span className="day-end">{index === day ? <b>TODAY</b> : index === (day + 1) % 7 ? <b className="next-badge">NEXT</b> : null}</span></button>)}</div>
          <div className="section-title session-title" id="selected-session"><div><p className="eyebrow">{selectedDay === day ? 'TODAY' : current.day.toUpperCase()}</p><h2>{current.title}</h2></div><span>{current.exercises.length} MOVES</span></div>
          {[0, 1, 3, 4].includes(selectedDay) && <p className="session-note">3 sets · 60–90 s rest · stop 2–3 reps before failure</p>}
          <div className="row-list">{current.exercises.map(([id, reps]) => <ItemRow key={id} id={id} detail={reps} onOpen={() => open(id, recommendedIds, current.exercises)} />)}</div>
          {[0, 1, 3, 4].includes(selectedDay) && <div className="finisher"><span>AFTER LIFTING</span><strong>{current.cardio} incline walk</strong><small>Easy enough to speak in full sentences.</small></div>}
          <div className="section-title options-title"><h2>Other recommended</h2><span>{current.alternatives.length} MORE · 10 TOTAL</span></div>
          <p className="session-note">{selectedDay === 6 ? 'Optional ideas; rest is enough.' : 'Alternatives to the workout, not extra exercises.'}</p>
          <div className="row-list">{current.alternatives.map(id => <ItemRow key={id} id={id} detail="Optional" onOpen={() => open(id, recommendedIds, current.exercises)} />)}</div>
          <div className="section-title options-title"><h2>All matching exercises</h2><span>{dayOptions.length} MORE</span></div>
          {showDayOptions ? <>
            <div className="row-list">{dayOptions.slice(0, planLimit).map(exercise => <ItemRow key={exercise.id} id={exercise.id} detail={equipmentGroup(exercise)} eager={false} onOpen={() => open(exercise.id, dayOptionIds)} />)}</div>
            {dayOptions.length > planLimit && <button className="more-button" type="button" onClick={() => setPlanLimit(planLimit + 20)}>Show more ↓</button>}
          </> : <button className="more-button" type="button" onClick={() => setShowDayOptions(true)}>Show {dayOptions.length} exercises ↓</button>}
          <a className="browse-link" href="#/library">Browse all {catalog.length} exercises →</a>
        </>}
        {tab === 'cardio' && <>
          <div className="page-title"><h1>Cardio</h1><p>Talk test: full sentences · effort 4–5/10</p></div>
          <div className="section-title"><h2>Machines</h2></div>
          <div className="machine-list">{cardio.map((machine, index) => <div className="machine" key={machine.id}><Demo id={machine.id} eager /><div className="machine-copy"><div className="machine-heading"><span>0{index + 1}</span><h3>{machine.label}</h3></div><p>{machine.detail}</p><ul>{machine.cues.map(cue => <li key={cue}>{cue}</li>)}</ul><button type="button" onClick={() => open(machine.id, cardio.map(x => x.id))}>View demo ↗</button></div></div>)}</div>
          <div className="section-title"><h2>12-week ramp</h2></div>
          <div className="ramp"><div><b>WK 1–2</b><span>Incline walk · 35–45 min</span></div><div><b>WK 3–4</b><span>Add 1 min easy jog every 3 min</span></div><div><b>WK 5–8</b><span>2 min jog / 2 min walk × 8–10; bike or elliptical once a week</span></div><div><b>WK 9–12</b><span>3 min jog / 1 min walk, or 25–30 min steady</span></div></div>
          <p className="safety">Sharp joint pain? Stop and switch machine.</p>
        </>}
        {tab === 'library' && <>
          <div className="page-title"><h1>Library</h1></div>
          <label className="search"><span>⌕</span><input aria-label="Search exercises" type="search" placeholder="Search exercises" value={search} onChange={event => { setSearch(event.target.value); setLimit(30); }} /></label>
          <div className="filter-label">EQUIPMENT</div><div className="chip-scroll"><button className={!equipment ? 'active' : ''} onClick={() => { setEquipment(''); setLimit(30); }}>All</button>{equipmentNames.map(name => <button key={name} className={equipment === name ? 'active' : ''} onClick={() => { setEquipment(name); setLimit(30); }}>{name}</button>)}</div>
          <div className="filter-label">MUSCLE</div><div className="chip-scroll"><button className={!muscle ? 'active' : ''} onClick={() => { setMuscle(''); setLimit(30); }}>All</button>{muscleNames.map(name => <button key={name} className={muscle === name ? 'active' : ''} onClick={() => { setMuscle(name); setLimit(30); }}>{name}</button>)}</div>
          <div className="section-title"><h2>All exercises</h2><span>{filtered.length} MOVES</span></div>
          <div className="library-grid">{filtered.slice(0, limit).map(exercise => <div className="library-tile" key={exercise.id}><Demo id={exercise.id} /><button type="button" onClick={() => open(exercise.id, filtered.map(x => x.id))}><strong>{exercise.name}</strong><span>{equipmentGroup(exercise)} · {exercise.primaryMuscles?.[0] || 'Full body'}</span></button></div>)}</div>
          {filtered.length > limit && <button className="more-button" type="button" onClick={() => setLimit(limit + 30)}>Show more ↓</button>}
          {!filtered.length && <p className="empty">No movements match these filters.</p>}
        </>}
        {tab === 'stretch' && <>
          <div className="page-title"><h1>Stretch</h1></div>
          {stretches.map((routine, index) => <section className="stretch-routine" key={routine.title}><div className="section-title"><div><p className="eyebrow">ROUTINE 0{index + 1}</p><h2>{routine.title}</h2></div><span>{routine.detail}</span></div><div className="row-list">{routine.items.map(([id, hold]) => <ItemRow key={id} id={id} detail={hold} onOpen={() => open(id, routine.items.map(([item]) => item))} />)}</div></section>)}
        </>}
      </main>
    </>}
  </div>;
}

export default App;
