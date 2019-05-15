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

program
    .parse(process.argv)

if (program.args.length > 0) {
    process.env.ADDRESS = program.args[0]
}

const ws = new WebSocket(process.env.ADDRESS || 'ws://localhost:40404')

ws.on('message', msg => {
    const data = JSON.parse(msg)
    if (data.message == Events.MESSAGE) {
        if (data.from == SERVER) {
            if (data.content == Messages.WELCOME) {
                console.log(
                    chalk.gray('Welcome!\nYou can begin chatting ...')
                )
                rl.setPrompt(data.id + '$ ')
                ws.id = data.id
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
    rl.prompt()
})

rl.addCommands({
    name: 'list',
    description: 'lists all users on this chat',
    func: function () {
        ws.send(
            JSON.stringify({
                message: Events.LIST_USERS
            })
        )
    }
})

rl.onLine(line => {
    ws.send(
        JSON.stringify({
            message: Events.MESSAGE,
            content: line
        })
    )
})