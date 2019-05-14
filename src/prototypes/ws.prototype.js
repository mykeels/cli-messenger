module.exports = (ws) => {
    ws.json = function (data) {
        if (ws.readyState == ws.OPEN) {
            if (data) ws.send(JSON.stringify(data))
        }
        else console.error('cannot send message because ws connection is not OPEN')
    }
}