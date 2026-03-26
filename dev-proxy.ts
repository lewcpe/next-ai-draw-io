import http from "http"

const TARGET_PORT = 6002
const PROXY_PORT = 6082
const FORWARDED_EMAIL = "dev-user@example.com"

const server = http.createServer((req, res) => {
    const options = {
        hostname: "localhost",
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            "X-Forwarded-Email": FORWARDED_EMAIL,
        },
    }

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
        proxyRes.pipe(res, { end: true })
    })

    req.pipe(proxyReq, { end: true })

    proxyReq.on("error", (err) => {
        console.error("Proxy Error:", err)
        res.statusCode = 502
        res.end("Bad Gateway")
    })
})

server.listen(PROXY_PORT, () => {
    console.log(
        `Dev proxy listening on http://localhost:${PROXY_PORT} -> http://localhost:${TARGET_PORT}`,
    )
    console.log(`Adding X-Forwarded-Email: ${FORWARDED_EMAIL}`)
})
