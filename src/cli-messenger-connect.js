if (require.main === module) {
    const program = require('commander')

    program
        .parse(process.argv);
}

