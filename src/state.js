'use strict';
const Transition = require('./transition');

const incr = (function () {
    var i = -1;

    return function () {
        return i += 1;
    }
})();

const incrId = (function () {
    var i = -1;

    return function () {
        return i += 1;
    }
})();

module.exports = class State {
    constructor(isFinal = false, output = []) {
        this.id = incrId();
        this.isFinal = isFinal;
        this.numberOfInputs = 0;
        this.inputLetters = new Set();
        this.output = new Set(output);
        this.transitions = new Map();
        this.prefixes = 0;
    }

    hash() {
        let hash = this.isFinal ? '1' : '0';
        if (this.isFinal) {
            this.output.forEach(out => {
                hash += ('/' + out);
            });
        }

        let trans = new Map([...this.transitions.entries()].sort());
        trans.forEach((val, key) => {
            hash += `+${key}-${val.output}-${val.next.id}-`;
        });
        //return hash.hashCode();
        return hash;
    }

    hashDebug() {
        let hash = this.isFinal ? '1' : '0';
        if (this.isFinal) {
            this.output.forEach(out => {
                hash += ('/' + out);
            });
        }

        this.transitions.forEach((val, key) => {
            let nextIsFinal = val.next.isFinal ? '1' : '0';

            // let transitions = new Map([...val.next.transitions.entries()].filter(([a, b]) => b.isFinal).sort());
            let transitionsLetters = "";
            // transitions.forEach((v, k) => {
            //     transitionsLetters += k;
            // });
            hash += `+${key}-${val.output}-${transitionsLetters}#${val.next.output}-`;
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
            numberOfInputs: this.numberOfInputs,
            output: outputArr,
            transitions: transitionsArr,
            prefixes: this.prefixes
        }
        return state;
    }

    deserialize(state, dictionaryOfStates) {
        this.id = state.id;
        this.isFinal = state.isFinal;
        this.output = new Set(state.output);
        this.inputLetters = new Set(state.inputLetters);
        this.numberOfInputs = state.numberOfInputs;
        this.transitions = new Map();
        this.prefixes = state.prefixes;
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

    setTransition(dictionaryOfStates, next, input, output = 0) {
        //console.log('State #' + this.id + ' => new Transition(' + input + ':' + output + ', next #' + next.id + ')');
        //let equivalentToThis = null;
        let trans = this.transitions.get(input);
        if (trans && trans.output && output == 0)
            output = trans.output;
        //if (shouldIncrement) { // || (shouldIncrement && trans && trans.next.id != next.id))  
        // if (trans) {
        //     if (trans.next.id == next.id) {
        //         next.numberOfInputs = trans.next.numberOfInputs;
        //     } else {
        //         if (!next.inputLetters.has(input))
        //             next.numberOfInputs += 1;
        //         else {
        //             if (dictionaryOfStates) {
        //                 var m = this.copy();
        //                 m.transitions.set(input, new Transition(output, next));
        //                 equivalentToThis = dictionaryOfStates.get(m.hash());
        //             }

        //             if (!equivalentToThis)
        //                 next.numberOfInputs += 1;
        //             else
        //             if (equivalentToThis && next.inputLetters.has(`${equivalentToThis.id}${input}`)) {}
        //             // do nothing
        //         }
        //     }
        // } else {
        //     //if (!next.inputLetters.has(input))
        next.numberOfInputs += 1;
        //}

        // // if (next.inputLetters.has(input) && trans) {
        // //     if (trans.next.id == next.id) {
        // //         next.numberOfInputs = trans.next.numberOfInputs;
        // //     } else {
        // //         // if(trans)
        // //         next.numberOfInputs += 1;
        // //     }
        // // } else {
        // //     if (!next.inputLetters.has(input))
        // //         next.numberOfInputs += 1;
        // // }
        //}
        //next.inputLetters.add(input);
        //let id = equivalentToThis ? equivalentToThis.id : this.id;
        //next.inputLetters.add(`${id}${input}`);
        this.transitions.set(input, new Transition(output, next));
    }

    //returns {next, output}
    getTransition(input) {
        return this.transitions.get(input);
    }

    getNumberOfInputs() {
        return this.prefixes;
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
            res += `${this.id} -> ${transition.next.id} [label="${input}${trOut}#${this.prefixes}"]\n`;
        });
        return res; //`${this.id}#${this.numberOfInputs}\n` + res;
    }

    copy(clone = false) {
        let s = new State(this.isFinal);
        if (!clone)
            s.id = this.id;
        // console.log('Copy of State #' + this.id + ' into state # ' + s.id, this.isFinal, s.isFinal);
        this.transitions.forEach((val, key) => s.setTransition(null, val.next, key, val.output, clone));
        this.output.forEach((val) => s.output.add(val));
        this.inputLetters.forEach((val) => s.inputLetters.add(val));
        s.numberOfInputs = !clone ? this.numberOfInputs : 0;
        s.prefixes = !clone ? this.prefixes : 0;
        return s;
    }

    clear() {
        this.id = incrId();
        this.isFinal = false;
        this.output.clear();
        this.inputLetters.clear();
        this.numberOfInputs = 0;
        this.transitions.clear();
        this.prefixes = 0;
    }
};