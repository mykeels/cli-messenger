const WebSocket = require('ws')
const {
    TEST_SERVER,
    Events,
    Messages
} = require('../constants')
const { expect } = require('chai')
const sleep = require('./utils/sleep')

describe('Server', () => {
    before(() => {
        process.env.PORT = 40405
        const { app } = require('../cli-messenger-server')
    })

    after(() => {
        app.listener.close()
    })

    it('receives welcome message', (done) => {
        const ws = new WebSocket(TEST_SERVER)

        ws.on('message', (msg) => {
            const data = JSON.parse(msg)
            expect(data.message).to.equal(Events.MESSAGE)
            expect(data.content).to.equal(Messages.WELCOME)
            ws.close()
            done()
        })
    })

    it('notifies ws1 when ws2 joins', (done) => {
        const ws1 = new WebSocket(TEST_SERVER)
        let ws2

        ws1.on('message', (msg) => {
            const data = JSON.parse(msg)
            if (data.message == Events.USER_JOINED) {
                ws1.close()
                ws2.close()
                done()
            }
        })

        sleep(20).then(() => {
            ws2 = new WebSocket(TEST_SERVER)
        })
    })

    it('notifies ws2 when ws1 sends a message', (done) => {
        const ws1 = new WebSocket(TEST_SERVER)
        const ws2 = new WebSocket(TEST_SERVER)

        ws2.on('message', (msg) => {
            const data = JSON.parse(msg)
            if (data.message == Events.MESSAGE && data.content == 'hello from ws1') {
                ws1.close()
                ws2.close()
                done()
            }
        })

        sleep(10).then(() => {
            ws1.send(JSON.stringify({
                message: Events.MESSAGE,
                content: 'hello from ws1'
            }))
        })
    })
})