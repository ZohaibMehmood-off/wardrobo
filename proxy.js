const http = require("http");
const https = require("https");

const apiKey = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== "POST") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "not found" }));
        return;
    }

    if (!apiKey) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "missing ANTHROPIC_API_KEY" }));
        return;
    }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const options = {
            hostname: "api.anthropic.com",
            path: "/v1/messages",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            }
        };

        const call = https.request(options, apiRes => {
            let data = "";
            apiRes.on("data", chunk => data += chunk);
            apiRes.on("end", () => {
                res.writeHead(apiRes.statusCode, { "Content-Type": "application/json" });
                res.end(data);
            });
        });

        call.on("error", err => {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
        });

        call.write(body);
        call.end();
    });
});

server.listen(3001, () => console.log("proxy running at http://localhost:3001"));
