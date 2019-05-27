#!/usr/bin/env node

require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const wsRoute = require('./routes/ws.route')
const ngrok = require('ngrok')
const { default: chalk } = require('chalk')
const readline = require('readline')

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

app.on('SIGINT', async () => {
    await ngrok.kill()
})

const listener = app.listen(process.env.PORT || 40404, function(){
    console.log('localhost:connected')

    if (listener.address().port === 40404) {
        console.log(
            chalk.yellow(
                `cli-messenger connect ws://localhost:${listener.address().port}\n`
            )
        )
    }
    else {
        console.log(
            chalk.yellow(
                `cli-messenger connect}`
            )
        )
    }
    
    if (process.env.NGROK) {
        console.log('ngrok:connecting...')
        ngrok.connect({
            addr: listener.address().port
        }).then((address) => {
            readline.moveCursor(process.stdout, 0,-1)
            readline.clearLine(process.stdout, 0);
            console.log(`ngrok:connected`)
            console.log(
                chalk.yellow(
                    `cli-messenger connect ${address.replace(/^https/, 'wss').replace(/^http/, 'ws')}\n`
                )
            )
            app.emit('prompt')
        }).catch(err => {
            console.error('could not connect to ngrok')
            console.error('error:',
                chalk.cyan(
                    JSON.stringify(err)
                )
            )
            app.emit('prompt')
        })
    }
    else {
        app.emit('prompt')
    }
})

app.listener = listener

module.exports.listener = listener

module.exports = app
module.exports.app = app