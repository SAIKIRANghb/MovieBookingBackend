const { createClient } = require('redis');

const client = createClient({
    username: 'default',
    password: 'NlLgIKIjbbkJSoX3CDQh4kWRgjDyTe0K',
    socket: {
        host: 'redis-11173.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11173
    }
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect();

module.exports = client;
