const expressWs = require('express-ws')
const extendWs = require('../prototypes/ws.prototype')
const ChatFactory = require('../factories/chat.factory')
const {
    SERVER,
    Events,
    Messages
} = require('../constants')

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

    const uuid = () => Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)

    const chat = factory.create(uuid())

    app.ws('/', (ws, req) => {
        try {
            extendWs(ws)

            if (!ws.id) {
                ws.id = uuid()
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
                }
            })

            ws.on('close', () => {
                const index = chat.sockets.listeners.indexOf(ws)
                chat.sockets.listeners.splice(index, 1)
                chat.sockets.broadcast()
                chat.sockets.broadcast({
                    message: Events.USER_LEFT,
                    content: ws.id,
                    ...chat.sockets.stats()
                }, ws)
            })
        }
        catch (err) {
            console.error(err)
            errorThrow(err, ws)
        }
    })
}