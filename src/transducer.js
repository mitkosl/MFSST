'use strict';

const helpers = require('./helpers');
const State = require('./state');

module.exports = class Transducer {
    constructor(dictionary) {
        this.inputAlphabet = new Set();
        this.inputWordsCount = 0;
        this.startState = new State();
        this.dictionaryOfStates = new Map();
        this.tempStates = [];

        // this.tempStates[0].clear();

        this.previousWord = "";
        this.currentWord = "";
        this.currentOutput = "";
        this.wordSuffix = "";
        this.commonPrefix = "";


        this.numberOfFinalStates = 0;
        this.numberOfTransitions = 0;

        if (dictionary) {
            this.build(dictionary);
        }
        console.log('constructor()');
    }

    stateCount() {
        return this.dictionaryOfStates.size;
    }

    transitionsCount() {
        return this.numberOfTransitions;
    }

    outputStatesCount() {
        return this.numberOfFinalStates;
    }

    countAndSetValues() {
        let transitionsCount = 0;
        let finalStatesCount = 0;
        this.dictionaryOfStates.forEach(state => {
            transitionsCount += state.transitions.size
            if (state.isFinal)
                finalStatesCount++;
        });
        this.numberOfFinalStates = finalStatesCount;
        this.numberOfTransitions = transitionsCount;
    }

    print() {
        console.log("\ntotal number of words -> " + this.inputWordsCount);
        let alphabet = "";
        this.inputAlphabet.forEach(c => alphabet += (c + ', '));
        console.log("Alphabet set -> |{ " + alphabet + " }| = " + this.inputAlphabet.size);
        console.log("number of states -> " + this.stateCount());
        console.log("number of output states -> " + this.outputStatesCount());
        console.log("number of transitions -> " + this.transitionsCount());


        this.dictionaryOfStates.forEach(state => console.log(state));
    }

    findMinimizedState(state) {
        let s = null;
        if (this.dictionaryOfStates.has(state)) {
            s = this.dictionaryOfStates.get(state);
        } else {
            s = state.copy();
            this.dictionaryOfStates.set(s, s);
        }
        return s;
    }

    build(dictionary) {
        console.log('build()');
        dictionary = dictionary.sort((a, b) => a.input > b.input);

        var startTime = new Date();
        this.inputWordsCount = dictionary.length;

        dictionary.forEach(pair => {

            this.currentWord = pair.input;
            this.currentOutput = pair.output;
            console.log(this.currentWord + " : " + this.currentOutput);

            if (this.currentWord < this.previousWord) {
                console.log("Dictionary is not sorted please sort it and try again to build a transducer");
            }

            // add letters to the input alphabet set
            for (const c of this.currentWord) {
                this.inputAlphabet.add(c);
            }

            let prefixLength = helpers.commonPrefixLength(this.currentWord, this.previousWord);

            // expand tempStates buffer to current word length
            while (this.tempStates.length <= this.currentWord.length) {
                this.tempStates.push(new State());
            }


            // set state transitions
            for (let i = this.previousWord.length; i > prefixLength; i--) {
                this.tempStates[i - 1].setTransition(this.findMinimizedState(this.tempStates[i]), this.previousWord[i - 1]);
            }

            for (let i = prefixLength + 1; i <= this.currentWord.length; i++) {
                this.tempStates[i].clear();
                this.tempStates[i - 1].setTransition(this.tempStates[i], this.currentWord[i - 1]);
            }

            if (this.currentWord != this.previousWord) {
                this.tempStates[this.currentWord.length].isFinal = true;
                this.tempStates[this.currentWord.length].output = new Set([]);
            }

            // set state outputs
            for (let j = 1; j <= prefixLength; j++) {
                // divide (j-1)th state's output to (common) prefix and suffix
                let transition = this.tempStates[j - 1].getTransition(this.currentWord[j - 1]);
                this.commonPrefix = helpers.commonPrefix(transition.output, this.currentOutput);
                this.wordSuffix = helpers.commonSuffix(transition.output, this.commonPrefix.length);
                // re-set (j-1)'th state's output to prefix
                transition.output = this.commonPrefix;

                // re-set j-th state's output to suffix or set final state outputk
                this.inputAlphabet.forEach(char => {
                    let t = this.tempStates[j].getTransition(char);
                    if (t && t.next != null)
                        t.output = this.wordSuffix + t.output;
                });

                // set final state output if it's a final state
                if (this.tempStates[j].isFinal) {
                    let tempSet = new Set();
                    this.tempStates[j].output.forEach(out => {
                        tempSet.add(this.wordSuffix + out);
                    });
                    this.tempStates[j].output = tempSet;
                }
                // update current output (subtract prefix)
                this.currentOutput = this.currentOutput.substr(this.commonPrefix.length);
            }

            if (this.currentWord == this.previousWord) {
                this.tempStates[this.currentWord.length].output.add(this.currentOutput);
            } else {
                this.tempStates[prefixLength].getTransition(this.currentWord[prefixLength]).output = this.currentOutput;
            }
            // preserve current word for next loop
            this.previousWord = this.currentWord;
        });

        //minimizing the states of the last word
        for (let i = this.currentWord.length; i >= 1; i--) {
            this.tempStates[i - 1].setTransition(this.findMinimizedState(this.tempStates[i]), this.previousWord[i]);
            this.numberOfTransitions++;
        }
        this.startState = this.findMinimizedState(this.tempStates[0]);

        var endTime = new Date();
        console.log("building MFSST took: " + (endTime - startTime) + " milisecnds");
        this.countAndSetValues();
    }
};
