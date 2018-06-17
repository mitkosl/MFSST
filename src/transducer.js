'use strict';

import { SSFST } from 'transducer.ts';
const State = require('./state');

module.exports = class Transducer {
    constructor(dictionary) {
        if (dictionary) {
            this.build(dictionary)
        }
        this.inputAlphabet = new Set();
        this.startState = new State();
        this.numberOfOutputStates = 0;
        this.numberOfStates = 1;
    }


};
