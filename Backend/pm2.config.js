module.exports = {
  apps: [
    {
      name: 'MailQuell',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
       // Force round-robin
      node_args: '--nouse-idle-notification --expose-gc',
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
      env:{
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
};


// autocannon -m GET -c 50 -d 20 -p 3 -w 30 "http://localhost:3000/monitor/metrics"
// │ Latency - 29.5 ms
// Req/Bytes counts sampled once per second.
// # of samples: 600
// 60k requests in 20.11s, 666 MB read 


// autocannon -m GET -c 100 -d 20 -p 10 -w 16 "http://localhost:3000/monitor/metrics"
// Latency -334.6 ms 
// Req/Bytes counts sampled once per second.
// # of samples: 320
// 58k requests in 20.11s, 631 MB read