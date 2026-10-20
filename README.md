# Alok Gym Guide

A phone-first, single-user gym plan built with the existing Create React App toolchain. No account or tracking.

## Run

```sh
npm install
npm start
```

The checked-in catalog and photos are enough to run the app without fetching data. For a production build and offline service worker:

```sh
npm run build
npx serve -s build
```

The service worker saves the app shell and all plan, cardio, stretch, and beginner photos after the first production load. The full library's remaining photos load from the Free Exercise DB CDN and are cached when viewed. Offline mode requires a secure origin or localhost and an installed service worker.

## Edit the guide

- [Plan](src/data/plan.ts) is the single source for the weekday schedule and lifting prescriptions.
- [Coach cues](src/data/coach.ts) contains setup, movement, and avoid lines for each plan exercise.
- [Cardio and stretches](src/data/routines.ts) and [beginner picks](src/data/beginner.ts) control the other default views.
- `npm run fetch:data` refreshes the [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) catalog, downloads both photos for every default-view ID, and regenerates the media and offline manifests. It fails if a listed ID is absent. The dataset repository declares the [Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md). No GIFs are scraped.
- Add your own `/public/media/<id>.gif` or `.webp`, then run `npm run fetch:data` again. The build-time media manifest gives it priority over the two photos. The `<id>` is the catalog ID, such as `Machine_Bench_Press`.

`npm run check:data`, `npm run lint`, and `CI=true npm test -- --watch=false` verify data, lint, and interaction tests.

The `Behind_Head_Chest_Stretch` in the requested routine is partner-assisted in the source dataset. Skip that movement if no partner is available.
