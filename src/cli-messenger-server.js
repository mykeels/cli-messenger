#!/usr/bin/env node

const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const wsRoute = require('./routes/ws.route')
const ngrok = require('ngrok')

app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

wsRoute(app)

if (require.main === module) {
    const program = require('commander')

    program
        .parse(process.argv);
}

const listener = app.listen(process.env.PORT || 40404, function(){
    console.log('local', `ws://localhost:${listener.address().port}`)

    if (process.env.NGROK) {
        console.log('ngrok:connecting')
        ngrok.connect({
            addr: listener.address().port
        }).then((address) => {
            console.log(`ngrok:connected ${address.replace(/^https/, 'wss').replace(/^http/, 'ws')}`)
        })
    }
})

app.listener = listener

module.exports.listener = listener

module.exports = app
module.exports.app = app