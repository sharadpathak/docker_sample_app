const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const session = require("express-session");
var process = require("process");
const redisClient = redis.createClient({
    host: "redis-17015.c228.us-central1-1.gce.cloud.redislabs.com",
    port: 17015
});
redisClient.AUTH("GyISLn84hW8eHctx0QzvjYihwPehEDrD");


const app = express();

// Start a session; we use Redis for the session store.
// "secret" will be used to create the session ID hash (the cookie id and the redis key value)
// "name" will show up as your cookie name in the browser
// "cookie" is provided by default; you can add it to add additional personalized options
//
app.use(
    session({
        secret: "ThisIsHowYouUseRedisSessionStorage",
        name: "_redisPractice",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false
        }
    })
);

redisClient.on("error", err => {
    console.log("Redis error: ", err);
});

redisClient.set("random_key", "some great value", function (err, reply) {
    // This will either result in an error (flush parameter is set to true)
    // or will silently fail and this callback will not be called at all (flush set to false)
    console.log(err);
});
//redisClient.end(true); // No further commands will be processed
redisClient.get("random_key", function (err, reply) {
    console.log("cached value for  random_key is", reply);
    console.log(err); // => 'The connection has already been closed.'
});

app.get("/", function (req, res, next) {
    redisClient.get("random_key1", function (err, reply) {
        if (reply != null) {
            console.log("reply for random_key is", reply);
            return res.end(
                "welcome to the redis demo!, you saved the value for random_key in in redis " +
                reply
            );
        } else {
            redisClient.set("random_key1", "some great value");
            console.log(err); // => 'The connection has already been closed.'
            return res.end(
                "welcome to the redis demo!, you need to save the value for random_key in in redis "
            );
        }
    });
});

app.get("/info", function (req, res, next) {
    if (req.session.views) {
        req.session.views++;
        res.setHeader("Content-Type", "text/html");
        res.write("<p>views: " + req.session.views + "</p>");
        res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
        res.end();
    } else {
        req.session.views = 1;
        res.end("welcome to the session demo. refresh!");
    }
    console.log(process.pid, "LOGGED");
});

// start express server at 9999 port
app.listen(9999, () => {
    console.log(
        "Server Bond with process id " + process.pid + "listening on port: ",
        9999
    );
});


// const express = require("express");

// const app = express();

// app.get('/', (req, res) => {
//     res.send("Great to Hear You!!!")
// })
// console.log("Node")

// app.listen(9999, () => {
//     console.log("App Running on 9999");
// })