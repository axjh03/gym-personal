export const plan = [
  { day: 'Mon', title: 'Upper A', focus: 'Chest · back · shoulders · arms', cardio: '25–30 min', exercises: [
    ['Machine_Bench_Press', '3 × 10–12'], ['Wide-Grip_Lat_Pulldown', '3 × 10–12'],
    ['Machine_Shoulder_Military_Press', '3 × 10–12'], ['Seated_Cable_Rows', '3 × 10–12'],
    ['Standing_Biceps_Cable_Curl', '3 × 12–15'], ['Triceps_Pushdown_-_Rope_Attachment', '3 × 12–15']
  ] },
  { day: 'Tue', title: 'Lower A + abs', focus: 'Quads · hamstrings · calves · core', cardio: '25–30 min', exercises: [
    ['Leg_Press', '3 × 10–12'], ['Seated_Leg_Curl', '3 × 10–12'], ['Leg_Extensions', '3 × 10–12'],
    ['Calf_Press_On_The_Leg_Press_Machine', '3 × 10–12'], ['Cable_Crunch', '3 × 10–12'], ['Plank', '3 × 20–40 s']
  ] },
  { day: 'Wed', title: 'Cardio + mobility', focus: 'Easy effort · move well', cardio: '35–45 min', exercises: [
    ['Walking_Treadmill', '35–45 min'], ['Cat_Stretch', '30 s'], ['Childs_Pose', '30 s'], ['Kneeling_Hip_Flexor', '30 s / side']
  ] },
  { day: 'Thu', title: 'Upper B + arms', focus: 'Upper chest · back · delts · arms', cardio: '25–30 min', exercises: [
    ['Leverage_Incline_Chest_Press', '3 × 10–12'], ['Close-Grip_Front_Lat_Pulldown', '3 × 10–12'],
    ['Reverse_Machine_Flyes', '3 × 10–12'], ['Cable_Seated_Lateral_Raise', '3 × 10–12'],
    ['Machine_Preacher_Curls', '3 × 12–15'], ['Cable_Rope_Overhead_Triceps_Extension', '3 × 12–15'],
    ['Ab_Crunch_Machine', '3 × 10–12']
  ] },
  { day: 'Fri', title: 'Lower B + core', focus: 'Quads · glutes · hamstrings · core', cardio: '25–30 min', exercises: [
    ['Hack_Squat', '3 × 10–12'], ['Seated_Leg_Curl', '3 × 10–12'], ['Butt_Lift_Bridge', '3 × 10–12'],
    ['Calf_Press_On_The_Leg_Press_Machine', '3 × 10–12'], ['Dead_Bug', '3 × 8 / side'], ['Plank', '3 × 20–40 s']
  ] },
  { day: 'Sat', title: 'Long cardio + stretch', focus: 'Incline walk · bike · elliptical', cardio: '45–60 min', exercises: [
    ['Walking_Treadmill', '45–60 min'], ['Hamstring_Stretch', '30 s / side'],
    ['On-Your-Back_Quad_Stretch', '30 s / side'], ['Behind_Head_Chest_Stretch', '30 s'],
    ['Shoulder_Stretch', '30 s / side'], ['Triceps_Stretch', '30 s / side']
  ] },
  { day: 'Sun', title: 'Rest + easy walk', focus: 'Recover · optional stretch', cardio: '30 min easy', exercises: [
    ['Walking_Treadmill', '30 min easy']
  ] }
];

export const todayIndex = (date = new Date()) => (date.getDay() + 6) % 7;
export const todaySession = (date = new Date()) => plan[todayIndex(date)];
export const planIds = Array.from(new Set(plan.flatMap(session => session.exercises.map(([id]) => id))));
