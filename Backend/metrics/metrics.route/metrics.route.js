const express = require('express');
const router = express.Router();
const promClient = require("prom-client");
const ResponseTime = require('response-time');


// Prometheus metrics setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

// 1. Define a Histogram to track request duration
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: "http_request_duration_ms",
    help: "Duration of HTTP requests in milliseconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [50, 100, 200, 300, 400, 500, 750, 1000, 2000, 5000] // Buckets for response time in ms
});

register.registerMetric(httpRequestDurationMicroseconds);
// 2. The Custom Monitor Middleware
const ResponseMiddleware = () => {
    return (req, res, next) => {
        const recorder = ResponseTime((req, res, time) => {
            const routePath = req.route ? req.route.path : req.originalUrl;
            httpRequestDurationMicroseconds
                .labels(req.method, routePath, res.statusCode)
                .observe(time);
        });
        //Because next is passed into it, response-time immediately calls next(). So we can just return the middleware function it provides.
        recorder(req,res, next);
    };
};


router.get('/metrics', async (req, res) => {
    try {
        res.setHeader('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.send(metrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).send('Error fetching metrics');
    }
});

module.exports = { metricsRouter: router, Response: ResponseMiddleware };