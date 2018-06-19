'use strict';

const helpers = require('./src/helpers');
const readline = require('readline');
const Transducer = require('./index');


function main() {
    const dict = [
        { input: 'apr', output: '30' },
        { input: 'aug', output: '31' },
        { input: 'dec', output: '31' },
        { input: 'feb', output: '28' },
        { input: 'feb', output: '29' },
        { input: 'jan', output: '31' },
        { input: 'jul', output: '31' },
        { input: 'jun', output: '30' },
    ];

    // const file = "./data/2k.dat";
    // helpers.readFile(file)
    // .then((dict) => {
    const mfsst = new Transducer(dict);
    mfsst.print();
    // });
};

main();