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
    }

    serialize() {
        let inputAlphabetArr = [];
        this.inputAlphabet.forEach(a => inputAlphabetArr.push(a));

        let dictionaryOfStatesArr = [];
        this.dictionaryOfStates.forEach(val => {
            dictionaryOfStatesArr.push(val.serialize());
        })

        var transducer = {
            inputWordsCount: this.inputWordsCount,
            numberOfFinalStates: this.numberOfFinalStates,
            numberOfTransitions: this.numberOfTransitions,
            inputAlphabet: inputAlphabetArr,
            dictionaryOfStates: dictionaryOfStatesArr,
        }
        return transducer
    }

    deserialize(transducer) {
        this.inputWordsCount = transducer.inputWordsCount;
        this.inputAlphabet = new Set(transducer.inputAlphabet);
        this.dictionaryOfStates = new Map();
        transducer.dictionaryOfStates.forEach(state => {
            let s = new State();
            s.deserialize(state);
            this.dictionaryOfStates.set(s, s);
        });
        this.countAndSetValues();
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

    lookup(words) {
        words.forEach(word => {
            let input = word;
            let output = this.lookupWord(word);
            console.log(`${input} => ${output}`);
        });
    }

    lookupWord(word) {
        let currentState = this.startState;
        let result = "";
        for (let i = 0; i < word.length; i++) {
            let transition = currentState.getTransition(word[i]);
            if (!transition)
                return result;
            result += transition.output;
            currentState = transition.next;
        }
        result += currentState.getOutput();
        return result;
    }

    print(debug) {
        console.log("\ntotal number of words -> " + this.inputWordsCount);
        let alphabet = "";
        this.inputAlphabet.forEach(c => alphabet += (c + ', '));
        console.log("Alphabet set -> |{ " + alphabet + " }| = " + this.inputAlphabet.size);
        console.log("number of states -> " + this.stateCount());
        console.log("number of output states -> " + this.outputStatesCount());
        console.log("number of transitions -> " + this.transitionsCount());
        if (debug)
            this.dictionaryOfStates.forEach(state => state.print());
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
        this.previousWord = "";

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

            console.log('----------------------------1----------------------------');
            // set state transitions
            for (let i = this.previousWord.length; i > prefixLength; i--) {
                this.tempStates[i - 1].setTransition(this.findMinimizedState(this.tempStates[i]), this.previousWord[i - 1]);
            }

            console.log('----------------------------2----------------------------');
            for (let i = prefixLength + 1; i <= this.currentWord.length; i++) {
                this.tempStates[i].clear();
                this.tempStates[i - 1].setTransition(this.tempStates[i], this.currentWord[i - 1]);
            }

            console.log('----------------------------3----------------------------');
            if (this.currentWord != this.previousWord) {
                this.tempStates[this.currentWord.length].isFinal = true;
                this.tempStates[this.currentWord.length].output = new Set([]);
            }

            console.log('----------------------------4----------------------------');
            // set state outputs
            for (let j = 1; j <= prefixLength; j++) {
                // divide (j-1)th state's output to (common) prefix and suffix
                let transition = this.tempStates[j - 1].getTransition(this.currentWord[j - 1]);
                this.commonPrefix = helpers.commonPrefix(transition.output, this.currentOutput);
                this.wordSuffix = helpers.commonSuffix(transition.output, this.commonPrefix);
                // re-set (j-1)'th state's output to prefix
                transition.output = this.commonPrefix;

                console.log('----------------------------4.1----------------------------');
                // re-set j-th state's output to suffix or set final state outputk
                this.inputAlphabet.forEach(char => {
                    let t = this.tempStates[j].getTransition(char);
                    if (t && t.next != null)
                        t.output = this.wordSuffix + t.output;
                });

                console.log('----------------------------4.2----------------------------');
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

            console.log('----------------------------5----------------------------');
            console.log(`${this.currentWord} == ${this.previousWord}, pref=${prefixLength}`);

            if (this.currentWord == this.previousWord) {
                console.log('.');
                this.tempStates[this.currentWord.length].output.add(this.currentOutput);
            } else {
                console.log('....' + this.currentWord[prefixLength] + '   ' + this.currentOutput);
                let transition = this.tempStates[prefixLength].getTransition(this.currentWord[prefixLength])
                transition.output = this.currentOutput;
            }

            // preserve current word for next loop
            this.previousWord = this.currentWord;
        });

        console.log('----------------------------6----------------------------');
        // minimizing the states of the last word
        for (let i = this.currentWord.length; i >= 1; i--) {
            let newState = this.findMinimizedState(this.tempStates[i]);
            this.tempStates[i - 1].setTransition(newState, this.previousWord[i - 1]);
        }
        console.log('----------------------------7----------------------------');
        this.startState = this.findMinimizedState(this.tempStates[0]);

        var endTime = new Date();
        console.log("building MFSST took: " + (endTime - startTime) + " milisecnds");
        this.countAndSetValues();
    }
};