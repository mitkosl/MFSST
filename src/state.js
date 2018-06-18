'use strict';
const Transition = require('./transition');

module.exports = class State {
    constructor(isFinal = false, output = []) {
        this.isFinal = isFinal;
        this.output = new Set(output);
        this.transitions = new Map();
    }

    setTransition(nextState, input, output = '') {
        this.transitions.set(input, new Transition(output, nextState));
    }

    //returns {next, output}
    getTransition(input) {
        return this.transitions.get(input);
    }

    copy() {
        return { ...this };
    }

    clear() {
        this.isFinal = false;
        this.output = null;
        this.transitions.clear();
    }
};
