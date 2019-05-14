const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const wsRoute = require('./routes/ws.route')

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
    console.log('Listening on port ' + listener.address().port)
})

app.listener = listener

module.exports.listener = listener

module.exports = app
module.exports.app = app