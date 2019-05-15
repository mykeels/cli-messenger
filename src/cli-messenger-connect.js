#!/usr/bin/env node

const program = require('commander')
const rl = require('readline-async')
const readline = require('readline')
const WebSocket = require('ws')
const {
    SERVER,
    TEST_SERVER,
    Events,
    Messages
} = require('./constants')
const { default: chalk } = require('chalk')
const sleep = require('./tests/utils/sleep')
const openDialog = require('open-dialog')
const { default: axios } = require('axios')
const fs = require('fs')
const FormData = require('form-data')

if (require.main === module) {
    program.parse(process.argv)

    if (program.args.length > 0) {
        process.env.ADDRESS = program.args[0]
    }
}

const uuid = () => Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)

let ws

function connect ({ displayName }) {
    ws = new WebSocket(process.env.ADDRESS || 'ws://localhost:40404')

    ws.on('message', msg => {
        const data = JSON.parse(msg)
        if (data.message == Events.MESSAGE) {
            if (data.from == SERVER) {
                if (data.content == Messages.WELCOME) {
                    console.log(
                        chalk.gray(`Welcome!\nYou can begin chatting ... Type .help for command list`)
                    )
                    if (!displayName) {
                        rl.setPrompt(data.id + '$ ')
                        displayName = ws.id = data.id
                    }
                    else {
                        rl.setPrompt(displayName + '$ ')
                        ws.id = displayName
                        ws.send(
                            JSON.stringify({
                                message: Events.CHANGE_NAME,
                                name: displayName
                            })
                        )
                    }
                }
                else console.log(chalk.gray(data.content))
            }
            else {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                console.log(
                    chalk.green(`${data.from}$`),
                    chalk.green(data.content)
                )
            }
            rl.prompt()
        }
        else if (data.message == Events.USER_JOINED) {
            rl.setPrompt(SERVER + '$ ')
            rl.prompt()
            console.log(
                chalk.gray(`User ${data.id} joined`)
            )
            rl.setPrompt(ws.id + '$ ')
            rl.prompt()
        }
        else if (data.message == Events.USER_LEFT) {
            rl.setPrompt(SERVER + '$ ')
            rl.prompt()
            console.log(
                chalk.gray(`User ${data.id} left`)
            )
            rl.setPrompt(ws.id + '$ ')
            rl.prompt()
        }
        else if (data.message == Events.LIST_USERS) {
            if (Array.isArray(data.users)) {
                rl.setPrompt(SERVER + '$ ')
                data.users.map(user => {
                    rl.prompt()
                    console.log(
                        chalk.gray(`${user} is in the chat`)
                    )
                })
                rl.setPrompt(ws.id + '$ ')
                rl.prompt()
            }
        }
        else if (data.message == Events.CHANGE_NAME) {
            rl.setPrompt(SERVER + '$ ')
            rl.prompt()
            console.log(
                chalk.gray(`${data.from} has changed their name to ${data.to}`)
            )
            rl.setPrompt(ws.id + '$ ')
            rl.prompt()
        }
    })

    const handleError = () => {
        if (!handleError.executed) {
            if (ws.id) displayName = ws.id
            rl.setPrompt(SERVER + '$ ')
            rl.prompt()
            console.log(
                chalk.yellow(`You are not connected ... re-connecting in 3 seconds`)
            )
            rl.setPrompt((displayName|| '') + '$ ')
            rl.prompt()
            sleep(3000).then(() => connect({ displayName }))
        }
        handleError.executed = 1
    }

    ws.on('close', handleError)

    ws.on('error', handleError)
}

module.exports = connect

if (require.main === module) {
    connect({
        displayName: process.env.DISPLAY_NAME || ''
    })
}

rl
.addCommands({
    name: 'list',
    description: 'lists all users on this chat',
    func: function () {
        readline.moveCursor(process.stdout, 0,-1)
        ws.send(
            JSON.stringify({
                message: Events.LIST_USERS
            })
        )
    }
}, {
    name: 'name',
    description: 'change your display name',
    argNames: [ '<names>' ],
    func: function (...names) {
        readline.moveCursor(process.stdout, 0,-1)
        const name = names.join(' ')
        if (name && name.trim()) {
            ws.send(
                JSON.stringify({
                    message: Events.CHANGE_NAME,
                    name
                })
            )
            ws.id = name
            rl.setPrompt(ws.id + '$ ')
            rl.prompt()
        }
    }
}, {
    name: 'file',
    description: 'upload and send a file',
    func: function () {
        readline.moveCursor(process.stdout, 0,-1)
        openDialog({}).then((files = []) => {
            files.map(file => {
                const form = new FormData()
                form.append('name', file.split('/\/|\\/').slice(-1)[0] || uuid())
                form.append('file', fs.createReadStream(file))

                axios({
                    url: 'https://uguu.se/api.php?d=upload-tool',
                    method: 'post',
                    headers: form.getHeaders(),
                    data: form
                })
                .then(res => {
                    if (res && res.data) {
                        ws.send(
                            JSON.stringify({
                                message: Events.MESSAGE,
                                content: res.data
                            })
                        )
                        console.log(res.data)
                        rl.prompt()
                    }
                })
            })
        })
    }
})

rl.onLine(line => {
    ws.send(
        JSON.stringify({
            message: Events.MESSAGE,
            content: line
        })
    )
    readline.moveCursor(process.stdout, 0,-1)
})