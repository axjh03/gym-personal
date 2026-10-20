export const cardio = [
  { id: 'Walking_Treadmill', label: 'Incline walk', detail: '4–8% incline · 2.8–3.4 mph / 4.5–5.5 km/h', cues: ['Tall spine, eyes ahead', 'Relax shoulders', 'Hands off rails; touch only for balance', 'Short, quick steps'] },
  { id: 'Recumbent_Bike', label: 'Recumbent bike', detail: 'Easy resistance · steady pace', cues: ['Adjust seat for a soft knee bend', 'Keep back against seat', 'Pedal smoothly', 'Keep shoulders relaxed'] },
  { id: 'Elliptical_Trainer', label: 'Elliptical', detail: 'Easy resistance · steady pace', cues: ['Stand tall, eyes ahead', 'Keep feet flat on pedals', 'Move handles gently', 'Avoid leaning on grips'] },
  { id: 'Stairmaster', label: 'Stair climber', detail: 'Slow steps · short intervals', cues: ['Stand tall', 'Place whole foot on step', 'Use rails lightly for balance', 'Keep a talkable pace'] },
  { id: 'Rowing_Stationary', label: 'Rowing machine', detail: 'Easy strokes · technique first', cues: ['Sit tall with shins near vertical', 'Drive with legs first', 'Lean slightly, then pull handle', 'Return arms, torso, then legs'] },
  { id: 'Jogging_Treadmill', label: 'Easy jog', detail: 'Later · week 5+', cues: ['Start at an easy pace', 'Land softly beneath hips', 'Keep shoulders loose', 'Walk whenever breathing gets hard'] }
];

export const stretches = [
  { title: 'Warm-up', detail: '5 min · dynamic', items: [['Walking_Treadmill', '2 min easy'], ['Arm_Circles', '1 min'], ['Standing_Hip_Circles', '1 min'], ['Cat_Stretch', '1 min']] },
  { title: 'Cool-down', detail: 'After lifting · 30 s holds', items: [['Hamstring_Stretch', '30 s / side'], ['On-Your-Back_Quad_Stretch', '30 s / side'], ['Childs_Pose', '30 s'], ['Behind_Head_Chest_Stretch', '30 s']] },
  { title: 'Posture / spine', detail: 'Slow breaths · easy range', items: [['Cat_Stretch', '6 slow breaths'], ['Childs_Pose', '30 s'], ['Kneeling_Hip_Flexor', '30 s / side'], ['Shoulder_Stretch', '30 s / side'], ['Behind_Head_Chest_Stretch', '30 s'], ['Triceps_Stretch', '30 s / side']] }
];
