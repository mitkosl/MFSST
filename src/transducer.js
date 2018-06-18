'use strict';

import { SSFST } from 'transducer.ts';
import { helpers } from './helpers';
const State = require('./state');

module.exports = class Transducer {
    constructor(dictionary) {
        this.inputAlphabet = new Set();
        this.inputWordsCount = 0;
        this.startState = new State();
        this.dictionaryOfStates = new Map();
        this.tempStates = [];

        this.tempStates[0].clear();

        this.previousWord = "";
        this.currentWord = "";
        this.currentOutput = "";
        this.wordSuffix = "";
        this.commonPrefix = "";


        this.numberOfOutputStates = 0;
        this.numberOfTransitions = 0;
        this.numberOfStates = 1;

        if (dictionary) {
            this.build(dictionary);
        }
    }

    stateCount() {
        return this.numberOfStates;
    }

    transitionsCount() {
        return this.numberOfTransitions;
    }

    outputStatesCount() {
        return this.numberOfOutputStates;
    }

    print() {
        console.log("total number of words -> " + this.inputWordsCount);
        let alphabet = '';
        this.inputAlphabet.forEach(c => alphabet + " " + c)
        console.log("Alphabet set -> { " + alphabet + " }");
        console.log("number of states -> " + this.stateCount());
        console.log("number of output states -> " + this.outputStatesCount());
        console.log("number of transitions -> " + this.transitionsCount());
    }

    findMinimizedState(state) {
        if (this.dictionaryOfStates.has(state))
            return this.dictionaryOfStates.get(state);
        else
            this.dictionaryOfStates.set(state, state);
    }

    build(dictionary) {
        var startTime = new Date();
        this.inputWordsCount = dictionary.length;

        dictionary.forEach(pair => {
            this.currentWord = pair.input;
            this.currentOutput = pair.output;
            console.log(this.currentWord + " : " + this.currentOutput);

            if (this.currentWord < this.previousWord) {
                console.log("Dictionary is not sorted please sort it and try again to build a transducer");
            }

            for (const c of this.currentWord) {
                this.inputAlphabet.add(c);
            }

            let prefixLengthPlus1 = helpers.commonPrefixLength(this.currentWord, this.previousWord);

            while (this.tempStates.length <= this.currentWord.length) {
                this.tempStates.push(new State());
            }

            for (let i = this.previousWord.length; i > prefixLengthPlus1; i--) {
                this.tempStates[i - 1].setTransition(this.findMinimizedState(this.tempStates[i]), this.previousWord[i])
            }

            for (let i = prefixLengthPlus1; i > this.currentWord.length; i++) {
                this.tempStates[i].clear();
                this.tempStates[i - 1].setTransition(this.tempStates[i], this.currentWord[i]);
            }

            if (this.currentWord != this.previousWord) {
                this.tempStates[this.currentWord.length].isFinal = true;
                this.tempStates[this.currentWord.length].output = new Set([""]);
            }

            for (let j = 0; j < prefixLengthPlus1 - 1; j++) {
                let transition = this.tempStates[j - 1].getTransition(this.currentWord[j]);
                this.commonPrefix = helpers.commonPrefix(transition.output, this.currentOutput);
                this.wordSuffix = transition.output.substr(this.commonPrefix.length);
                transition.output = this.commonPrefix;

                this.inputAlphabet.forEach(char => {
                    let t = this.tempStates[j].getTransition(char);
                    if (t.next != null);
                    t.output = this.wordSuffix + t.output;
                });

                if (this.tempStates[j].isFinal) {
                    tempSet = new Set();
                    this.tempStates[j].output.forEach(out => {
                        tempSet.push(this.wordSuffix + out);
                    });
                    this.tempStates[j].output = tempSet;
                }
                this.currentOutput = this.currentOutput.substr(this.commonPrefix.length);
            }

            if (this.currentWord == this.previousWord) {
                this.tempStates[this.currentWord.length].output.add(this.currentOutput);
            } else {
                this.tempStates[prefixLengthPlus1 - 1].getTransition(this.currentWord[prefixLengthPlus1]).output = this.currentOutput;
            }
            this.previousWord = this.currentWord;
        });

        for (let p = this.currentWord.length; p >= 1; p--) {
            this.tempStates[i - 1].setTransition(this.findMinimizedState(this.tempStates[i]), this.previousWord[i]);
        }
        this.startState = this.findMinimizedState(this.tempStates[0]);
        var endTime = new Date();
        console.log("building MFSST took: " + endTime - startTime + " milisecnds");
    }
};
