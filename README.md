# Pulse — Self-hosted Internet Speed Test

A fast, modern speed test you host yourself. Built with plain Node.js (no dependencies) and a single-page frontend.

## Features

- **Download and upload speed** using 4 parallel streams, with TCP warm-up excluded from the final number
- **Latency, jitter and packet loss** from 20 timed pings
- **Data used** during the test
- Live gauge and real-time graph
- "What your connection can handle" badges (4K streaming, video calls, gaming, large downloads, cloud backup)
- Your IP, server name and connection type
- History of the last 20 results (stored in your browser), with copy and clear buttons
- Responsive layout, keyboard focus styles and reduced-motion support

## Project structure

```
speedtest/
├── server.js          # HTTP server and test endpoints
├── package.json
├── README.md
└── public/
    └── index.html     # Frontend (HTML, CSS, JS in one file)
```

## Run locally

Requires Node.js 16 or newer.

```bash
npm start
# or
node server.js
```

Open http://localhost:3000. To use a different port: `PORT=8080 npm start`.

## What the result actually measures

The result depends on where the server runs and where you open the page from.

| Setup                                       | What you are measuring                                                |
| ------------------------------------------- | --------------------------------------------------------------------- |
| Server and browser on the same computer     | Loopback speed only (often several Gbps). Not your Wi-Fi or internet. |
| Server on another device on your network    | Your Wi-Fi / LAN speed                                                |
| Server on a remote host (VPS, Render, etc.) | Your internet speed to that server                                    |

For a real internet speed, deploy it to a remote host and open it from your own device.

## Deploy on Render

1. Push this folder to a GitHub repository, keeping the structure above.
2. In Render, choose **New → Web Service** and connect the repo.
3. Settings:
   - Runtime: **Node**
   - Build command: `npm install`
   - Start command: `npm start`
   - Region: the closest one to you
4. Deploy and open the `https://your-app.onrender.com` URL.

Notes:

- Free instances sleep after inactivity. Open the page once and wait for it to load before testing.
- A small server can cap the result below your real speed on very fast connections.
- Each test transfers a few hundred MB, so check your host's bandwidth limits.

## API endpoints

| Endpoint         | Method | Description                                             |
| ---------------- | ------ | ------------------------------------------------------- |
| `/ping`          | GET    | Returns `pong` instantly, used for latency and jitter   |
| `/download?mb=N` | GET    | Streams N MB of random data (1–200, default 25)         |
| `/upload`        | POST   | Accepts and discards the request body                   |
| `/info`          | GET    | Returns client IP, server hostname and platform as JSON |

All responses use `Cache-Control: no-store`.

## How the test works

1. **Latency:** 20 sequential requests to `/ping`. Latency is the median, jitter is the average difference between consecutive pings, and a request that times out after 2 seconds counts as lost.
2. **Download (10 s):** 4 parallel `fetch` streams read from `/download`. The speed is measured after a 1.5 s warm-up.
3. **Upload (8 s):** 4 parallel `XMLHttpRequest` uploads of a 4 MB random blob, tracked with upload progress events.

The gauge uses a logarithmic scale up to 1000 Mbps. Higher speeds show a full arc with the real number in the center.

## Limitations

- One server only, with no server selection.
- Results reflect the path between your device and this server, not the whole internet.
- Browser limits and server capacity can cap very high speeds.

## License

MIT
