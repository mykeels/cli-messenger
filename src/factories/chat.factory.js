function ChatFactory() {
    let count = 0
    const chats = {}

    this.create = (id) => {
        count++
        chats[id] = { 
                        id,
                        sockets: {
                            listeners: []
                        }
                    }
        const sockets = chats[id].sockets
        sockets.stats = () => ({ listeners: sockets.listeners.length })
        sockets.listUsers = () => sockets.listeners.map(listener => listener.id)
        sockets.broadcast = (data, exceptWs) => {
            sockets.listeners.filter(ws => !exceptWs || (ws != exceptWs)).forEach((socket) => {
                socket.json(data)
            })
        }
        return chats[id]
    }

    this.get = (id) => {
        return chats[id]
    }

    this.chat = (id) => {
        const currentchat = chats[id]
        if (currentchat) {
            const { id, chat, sockets } = currentchat
            return { 
                id, 
                listeners: sockets.listeners.map(l => l.username) 
            }
        }
        throw { status: 404, message: 'chat not found' }
    }

    this.exists = (id) => {
        return !!chats[id]
    }
    
    this.count = () => count

    this.chats = () => {
        return Object.values(chats).map(({ id, chat, sockets }) => ({ id, ...sockets.stats() }))
    }
}

module.exports = ChatFactory
module.exports.ChatFactory = ChatFactory