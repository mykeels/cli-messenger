#!/usr/bin/env node

const package = require('../package.json')

if (require.main === module) {
    const program = require('commander')

    program
        .version(package.version)
        .command('server', 'creates a new server', { isDefault: true })
        .command('connect [address]', 'connects to a server')
        .parse(process.argv)
}

