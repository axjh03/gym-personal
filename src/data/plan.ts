export const plan = [
  { day: 'Mon', title: 'Upper body · chest & back', focus: 'Chest · back · shoulders · arms', group: 'upper', cardio: '25–30 min', alternatives: ['Butterfly', 'Face_Pull', 'Incline_Push-Up'], exercises: [
    ['Machine_Bench_Press', '3 × 10–12'], ['Wide-Grip_Lat_Pulldown', '3 × 10–12'],
    ['Machine_Shoulder_Military_Press', '2 × 10–12'], ['Seated_Cable_Rows', '2 × 10–12'],
    ['Cable_Seated_Lateral_Raise', '2 × 12–15'], ['Standing_Biceps_Cable_Curl', '3 × 10–15'],
    ['Triceps_Pushdown_-_Rope_Attachment', '2 × 10–15']
  ] },
  { day: 'Tue', title: 'Lower body · legs & abs', focus: 'Quads · hamstrings · calves · core', group: 'lower', cardio: '25–30 min', alternatives: ['Seated_Calf_Raise', 'Standing_Calf_Raises', 'Bodyweight_Squat', 'Reverse_Crunch'], exercises: [
    ['Leg_Press', '3 × 10–12'], ['Seated_Leg_Curl', '3 × 10–12'], ['Leg_Extensions', '3 × 10–12'],
    ['Calf_Press_On_The_Leg_Press_Machine', '3 × 10–12'], ['Cable_Crunch', '3 × 10–12'], ['Plank', '3 × 20–40 s']
  ] },
  { day: 'Wed', title: 'Easy cardio & mobility', focus: 'Easy effort · move well', group: 'recovery', cardio: '35–45 min', alternatives: ['Recumbent_Bike', 'Elliptical_Trainer', 'Arm_Circles', 'Standing_Hip_Circles', 'Shoulder_Stretch', 'Hamstring_Stretch'], exercises: [
    ['Walking_Treadmill', '35–45 min'], ['Cat_Stretch', '30 s'], ['Childs_Pose', '30 s'], ['Kneeling_Hip_Flexor', '30 s / side']
  ] },
  { day: 'Thu', title: 'Upper body · shoulders & arms', focus: 'Upper chest · back · delts · arms', group: 'upper', cardio: '25–30 min', alternatives: ['Face_Pull', 'Butterfly', 'Dip_Machine'], exercises: [
    ['Leverage_Incline_Chest_Press', '3 × 10–12'], ['Close-Grip_Front_Lat_Pulldown', '3 × 10–12'],
    ['Reverse_Machine_Flyes', '2 × 12–15'], ['Cable_Seated_Lateral_Raise', '2 × 12–15'],
    ['Machine_Preacher_Curls', '3 × 10–15'], ['Hammer_Curls', '2 × 10–15'],
    ['Cable_Rope_Overhead_Triceps_Extension', '2 × 10–15']
  ] },
  { day: 'Fri', title: 'Lower body · glutes & core', focus: 'Quads · glutes · hamstrings · core', group: 'lower', cardio: '25–30 min', alternatives: ['Glute_Kickback', 'Single_Leg_Glute_Bridge', 'Seated_Calf_Raise', 'Crunches'], exercises: [
    ['Hack_Squat', '3 × 10–12'], ['Seated_Leg_Curl', '3 × 10–12'], ['Butt_Lift_Bridge', '3 × 10–12'],
    ['Calf_Press_On_The_Leg_Press_Machine', '3 × 10–12'], ['Dead_Bug', '3 × 8 / side'], ['Plank', '3 × 20–40 s']
  ] },
  { day: 'Sat', title: 'Long cardio & stretching', focus: 'Incline walk · bike · elliptical', group: 'recovery', cardio: '45–60 min', alternatives: ['Recumbent_Bike', 'Elliptical_Trainer', 'Seated_Floor_Hamstring_Stretch', 'Cat_Stretch'], exercises: [
    ['Walking_Treadmill', '45–60 min'], ['Hamstring_Stretch', '30 s / side'],
    ['On-Your-Back_Quad_Stretch', '30 s / side'], ['Behind_Head_Chest_Stretch', '30 s'],
    ['Shoulder_Stretch', '30 s / side'], ['Triceps_Stretch', '30 s / side']
  ] },
  { day: 'Sun', title: 'Rest & easy walk', focus: 'Recover · optional stretch', group: 'recovery', cardio: '30 min easy', alternatives: ['Recumbent_Bike', 'Elliptical_Trainer', 'Cat_Stretch', 'Childs_Pose', 'Kneeling_Hip_Flexor', 'Hamstring_Stretch', 'Shoulder_Stretch', 'Triceps_Stretch', 'Standing_Hip_Circles'], exercises: [
    ['Walking_Treadmill', '30 min easy']
  ] }
];

export const todayIndex = (date = new Date()) => (date.getDay() + 6) % 7;
export const todaySession = (date = new Date()) => plan[todayIndex(date)];
export const planIds = Array.from(new Set(plan.flatMap(session => session.exercises.map(([id]) => id))));
export const planOptionIds = Array.from(new Set(plan.flatMap(session => session.alternatives)));
