const expressWs = require('express-ws')
const extendWs = require('../prototypes/ws.prototype')
const ChatFactory = require('../factories/chat.factory')
const {
    SERVER,
    Events,
    Messages
} = require('../constants')
const ngFaker = require('ng-faker')
const { default: chalk } = require('chalk')
const rl = require('readline-async')


const errorHandler = (err) => {
    if (err) console.error("ws-error", err)
}
const errorThrow = (err, ws) => {
    console.error(err)
    if (ws) {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                error: err
            }), wsErrorHandler)
        }
    }
}

module.exports = (app, factory = new ChatFactory()) => {
    expressWs(app)

    rl.on('SIGINT', () => {
        app.emit('SIGINT')
        rl.setPrompt('')
        rl.prompt()
    })

    app.on('prompt', () => {
        rl.setPrompt(SERVER + '$ ')
        rl.prompt()
    })

    rl.setPrompt(SERVER + '$ ')
    rl.prompt()

    const uuid = () => Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)

    const chat = factory.create(uuid())

    app.ws('/', (ws, req) => {
        try {
            extendWs(ws)

            if (!ws.id) {
                ws.id = (() => {
                    ngFaker.locale = (['yo', 'ha', 'ig', 'ur', 'bn', 'ek'])[Math.floor(Math.random() * 6)]
                    const name = ngFaker.fake('{{name.firstName}} {{name.lastName}}')
                    console.log(
                        chalk.green(`${name} joined`)
                    )
                    return name
                })()
                if (chat.sockets.listeners.indexOf(ws) < 0) {
                    chat.sockets.listeners.push(ws)
                    chat.sockets.broadcast({
                        message: Events.USER_JOINED,
                        id: ws.id,
                        ...chat.sockets.stats()
                    }, ws)
                    ws.json({
                        message: Events.MESSAGE,
                        content: Messages.WELCOME,
                        id: ws.id,
                        from: SERVER,
                        ...chat.sockets.stats()
                    })
                }
            }

            ws.on('message', (message = '') => {
                let data = {}
                try {
                    data = JSON.parse(message)
                }
                catch (parseError) {
                    console.error('could not parse message:', message)
                }
                switch (data.message) {
                    case Events.MESSAGE:
                    case Events.USER_LEFT:
                        chat.sockets.broadcast({
                            message: data.message,
                            content: data.content,
                            from: ws.id,
                            ...chat.sockets.stats()
                        }, ws)
                    break
                    case Events.LIST_USERS:
                        ws.json({
                            message: Events.LIST_USERS,
                            users: chat.sockets.listUsers(),
                            ...chat.sockets.stats()
                        })
                    break
                    case Events.CHANGE_NAME:
                        chat.sockets.broadcast({
                            message: Events.CHANGE_NAME,
                            from: ws.id,
                            to: data.name,
                            ...chat.sockets.stats()
                        }, ws)
                        console.log(
                            chalk.yellow(`${ws.id} changed their name to ${data.name}`)
                        )
                        ws.id = data.name
                        
                    break
                }
            })

            ws.on('close', () => {
                const index = chat.sockets.listeners.indexOf(ws)
                chat.sockets.listeners.splice(index, 1)
                chat.sockets.broadcast()
                chat.sockets.broadcast({
                    message: Events.USER_LEFT,
                    id: ws.id,
                    ...chat.sockets.stats()
                }, ws)
                console.log(
                    chalk.gray(`${ws.id} left`)
                )
            })
        }
        catch (err) {
            console.error(err)
            errorThrow(err, ws)
        }
    })
}