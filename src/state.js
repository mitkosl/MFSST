'use strict';
const Transition = require('./transition');

const incr = (function () {
    var i = -1;

    return function () {
        return i++;
    }
})();

const incrId = (function () {
    var i = 100;

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

    serialize() {
        let outputArr = [];
        this.output.forEach(a => outputArr.push(a));

        let transitionsArr = [];
        this.transitions.forEach((trans, inp) => {
            transitionsArr.push({
                input: inp,
                next: trans.next,
                output: trans.output,
            })
        });

        var state = {
            id: this.id,
            isFinal: this.isFinal,
            output: outputArr,
            transitions: transitionsArr,
        }
        return state;
    }

    deserialize(state, dictionaryOfStates) {
        this.id = state.id;
        this.isFinal = state.isFinal;
        this.output = new Set(state.output);
        this.transitions = new Map();
        state.transitions.forEach(trans => {

            var nextState = null;
            dictionaryOfStates.forEach(st => {
                if (st.id == trans.next.id)
                    nextState = st;
            });
            if (nextState)
                this.transitions.set(trans.input, new Transition(trans.output, nextState));
            else
                console.log(trans.next.id + "NOTFOUND..................");
        });
    }

    setTransition(next, input, output = '') {
        console.log('State #' + this.id + ' => new Transition(' + input + ':' + output + ', next #' + next.id + ')');
        let trans = this.transitions.get(input)
        if (trans && trans.output && output == '')
            output = trans.output;
        this.transitions.set(input, new Transition(output, next));
    }

    //returns {next, output}
    getTransition(input) {
        return this.transitions.get(input);
    }

    getOutput() {
        let res = "";
        this.output.forEach(el => res += el);
        return res;
    }
    
    print() {
        //console.log(this);
        this.transitions.forEach((transition, input) => {
            console.log(`#${this.id} => ${input}/${transition.output} => #${transition.next.id}`);
        })
    }

    copy() {
        let s = new State(this.isFinal);
        s.id = incrId();
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