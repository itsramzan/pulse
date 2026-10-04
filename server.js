// Pulse Speed Test server — zero dependencies. Run: node server.js
const http = require("http"),
  fs = require("fs"),
  os = require("os"),
  path = require("path"),
  crypto = require("crypto");
const PORT = process.env.PORT || 3000;
const CHUNK = crypto.randomBytes(1 << 20); // 1 MB of incompressible data
const NOCACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Access-Control-Allow-Origin": "*",
};

http
  .createServer((req, res) => {
    const u = new URL(req.url, "http://localhost");

    if (u.pathname === "/ping") {
      res.writeHead(200, { ...NOCACHE, "Content-Type": "text/plain" });
      return res.end("pong");
    }

    if (u.pathname === "/download") {
      const mb = Math.min(Math.max(+u.searchParams.get("mb") || 25, 1), 200);
      let sent = 0;
      res.writeHead(200, {
        ...NOCACHE,
        "Content-Type": "application/octet-stream",
        "Content-Length": mb * CHUNK.length,
      });
      const pump = () => {
        while (sent < mb) {
          sent++;
          if (!res.write(CHUNK)) return res.once("drain", pump);
        }
        res.end();
      };
      res.on("close", () => {
        sent = mb;
      });
      return pump();
    }

    if (u.pathname === "/upload" && req.method === "POST") {
      req.on("data", () => {});
      req.on("end", () => {
        res.writeHead(200, NOCACHE);
        res.end("ok");
      });
      return;
    }

    if (u.pathname === "/info") {
      const ip = (
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        ""
      )
        .split(",")[0]
        .replace("::ffff:", "");
      res.writeHead(200, { ...NOCACHE, "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          ip: ip === "::1" ? "127.0.0.1" : ip,
          server: os.hostname(),
          platform: os.platform(),
        })
      );
    }

    if (u.pathname === "/" || u.pathname === "/index.html") {
      return fs.readFile(
        path.join(__dirname, "public", "index.html"),
        (e, d) => {
          res.writeHead(e ? 500 : 200, {
            "Content-Type": "text/html; charset=utf-8",
          });
          res.end(e ? "Could not load page" : d);
        }
      );
    }
    res.writeHead(404);
    res.end("Not found");
  })
  .listen(PORT, () =>
    console.log(`Pulse Speed Test running → http://localhost:${PORT}`)
  );
