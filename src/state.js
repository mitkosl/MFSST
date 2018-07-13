'use strict';
const Transition = require('./transition');

const incr = (function () {
    var i = -1;

    return function () {
        return i += 1;
    }
})();

const incrId = (function () {
    var i = 100;

    return function () {
        return i += 1;
    }
})();

module.exports = class State {
    constructor(isFinal = false, output = []) {
        this.id = incr();
        this.isFinal = isFinal;
        this.inputLetters = new Set();
        this.output = new Set(output);
        this.transitions = new Map();
    }

    hash() {
        let hash = this.isFinal ? '1' : '0';
        if (this.isFinal) {
            this.output.forEach(out => {
                hash += ('/' + out);
            });
        }

        this.transitions.forEach((val, key) => {
            hash += `+${key}-${val.output}-${val.next.id}-`;
        });
        //return hash.hashCode();
        return hash;
    }

    serialize() {
        let outputArr = [];
        let inputLetters = [];
        this.output.forEach(a => outputArr.push(a));
        this.inputLetters.forEach(a => inputLetters.push(a));

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
            inputLetters: inputLetters,
            output: outputArr,
            transitions: transitionsArr,
        }
        return state;
    }

    deserialize(state, dictionaryOfStates) {
        this.id = state.id;
        this.isFinal = state.isFinal;
        this.output = new Set(state.output);
        this.inputLetters = new Set(state.inputLetters);
        this.transitions = new Map();
        state.transitions.forEach(trans => {

            var nextState = dictionaryOfStates.get(state.next.hash());
            // dictionaryOfStates.forEach(st => {
            //     if (st.id == trans.next.id)
            //         nextState = st;
            // });
            if (nextState)
                this.transitions.set(trans.input, new Transition(trans.output, nextState));
            else
                console.log(trans.next.id + "NOTFOUND..................");
        });
    }

    setTransition(next, input, output = 0) {
        //console.log('State #' + this.id + ' => new Transition(' + input + ':' + output + ', next #' + next.id + ')');
        let trans = this.transitions.get(input)
        if (trans && trans.output && output == 0)
            output = trans.output;
        next.inputLetters.add(input);
        this.transitions.set(input, new Transition(output, next));
    }

    //returns {next, output}
    getTransition(input) {
        return this.transitions.get(input);
    }

    getNumberOfInputs() {
        return this.inputLetters.size;
    }

    removeTransition(input) {
        this.transitions.delete(input);
    }

    getOutput() {
        let res = 0;
        this.output.forEach(el => res += parseInt(el));
        if (isNaN(parseInt(res)))
            this.output.forEach(el => console.log(el));
        return res;
    }

    print() {
        //console.log(this);
        var res = "";
        this.transitions.forEach((transition, input) => {
            let transitionOutput = transition.output;
            let trOut = transitionOutput ? ':' + transitionOutput : '';
            res += `${this.id} -> ${transition.next.id} [label="${input}${trOut}"]\n`;
        });
        return res;
    }

    copy(cloneNewId = false) {
        let s = new State(this.isFinal);
        // s.id = incrId();
        if (!cloneNewId)
            s.id = this.id;
        // console.log('Copy of State #' + this.id + ' into state # ' + s.id, this.isFinal, s.isFinal);
        this.transitions.forEach((val, key) => s.setTransition(val.next, key, val.output));
        this.output.forEach((val) => s.output.add(val));
        this.inputLetters.forEach((val) => s.inputLetters.add(val));
        return s;
    }

    clear() {
        this.id = incrId();
        this.isFinal = false;
        this.output.clear();
        this.inputLetters.clear();
        this.transitions.clear();
    }
};