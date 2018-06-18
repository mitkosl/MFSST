'use strict';

import { helpers } from './src/helpers';
const readline = require('readline');
const Transducer = require('./index');


function main() {

    const file = "./data/2k.dat";
    const dict = helpers.readFile(file);
    // const dict = [
    //     { input: 'acheive', output: 'achieve' },
    //     { input: 'arguement', output: 'argument' },
    //     { input: 'independant', output: 'independent' },
    //     { input: 'posession', output: 'possession' },
    //     { input: 'mercy less', output: 'merciless' }
    // ];

    console.log(dict);
    //const mfsst = new Transducer(dict);
    //mfsst.print();

    // readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // }).on('line', input => console.log(transducer.process(input)));
};

main();