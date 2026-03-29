# Cabinet AR

A web app that uses your device camera to capture live images of cabinets and lets you visualise new virtual cabinet designs overlaid on the real scene in real time.

## Features

- **Live camera feed** — accesses your device camera (front or rear) via the browser
- **Drag to place** — click and drag on the camera view to mark the cabinet area
- **6 cabinet styles** — Modern White, Natural Wood, Classic Dark, Sage Green, Navy Blue, Warm Gray
- **Toggle overlay** — easily show/hide the virtual cabinet without losing the selection
- **Responsive** — works on desktop and mobile

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
Grant camera permissions when prompted.

## Usage

1. Point your camera at a cabinet or wall area
2. Click and drag on the video to draw a bounding box over the cabinet
3. Pick a cabinet style from the right panel
4. Toggle the overlay on/off to compare

## Build

```bash
npm run build
npm run preview
```
