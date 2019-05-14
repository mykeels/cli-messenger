const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')

app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

if (require.main === module) {
    const program = require('commander')

    program
        .parse(process.argv);

    const listener = app.listen(process.env.PORT || 40404, function(){
        console.log('Listening on port ' + listener.address().port)
    })

    module.exports.listener = listener
}

module.exports = app
module.exports.app = app