'use strict';
const Transition = require('./transition');

const incr = (function () {
    var i = 0;

    return function () {
        return i++;
    }
})();

module.exports = class State {
    constructor(isFinal = false, output = []) {
        this.id = incr();
        this.isFinal = isFinal;
        this.output = new Set(output);
        this.transitions = new Map();
    }

    setTransition(next, input, output = '') {
        console.log('State #' + this.id + ' => new Transition(' + output + ', next #' + next.id + ')');
        this.transitions.set(input, new Transition(output, next));
    }

    //returns {next, output}
    getTransition(input) {
        return this.transitions.get(input);
    }

    copy() {
        let s = new State(this.isFinal);
        console.log('Copy of State #' + this.id + ' into state # ' + s.id);
        this.transitions.forEach((val, key) => s.setTransition(val.next, key, val.output));
        this.output.forEach((val) => s.output.add(val));
        return s;
    }

    clear() {
        this.isFinal = false;
        this.output.clear();
        this.transitions.clear();
    }
};
