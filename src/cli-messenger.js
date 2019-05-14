#!/usr/bin/env node

const package = require('../package.json')

if (require.main === module) {
    const program = require('commander')

    program
        .version(package.version)
        .command('server [env]', 'creates a new server')
        .command('connect [env]', 'connects to a server', { isDefault: true })
        .parse(process.argv)
}

