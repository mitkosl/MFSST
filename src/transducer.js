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
            s.deserialize(state, this.dictionaryOfStates);
            this.dictionaryOfStates.set(s.hash(), s);
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
        for (let i = 0; i < word.length; i += 1) {
            let transition = currentState.getTransition(word[i]);
            if (!transition)
                return result;
            result += transition.output;
            currentState = transition.next;
        }
        result += currentState.getOutput();
        return result;
    }

    reduceToMinimalExceptPrefix(word) {
        if (!helpers.isPrefix(word, this.previousWord) || this.previousWord == word)
            return;

        for (let i = this.previousWord.length; i > word.length; i -= 1) {
            //If no equivalent state in QminusT
            let newState = this.findMinimizedState(this.tempStates[i]);
            //Redirect transition
            this.tempStates[i - 1].setTransition(newState, this.previousWord[i - 1]);
            this.currentState = newState;
        }
        this.tempStates = [];
        this.previousWord = word;
    }

    increaseToMinimalExceptPrefix(word) {
        if (this.previousWord == word || !this.currentState) {
            return;
        }
        let newState = null;
        for (let i = this.previousWord.length; i < word.length; i += 1) {
            //Ti WordI  copy of current Ti with word state
            newState = this.currentState.copy();
            this.tempStates.push(newState);
            if (this.tempStates[i - 1])
                this.tempStates[i - 1].setTransition(newState, word[i - 1]);
            let nextState = this.currentState.next;
            this.dictionaryOfStates.delete(this.currentState);
            this.currentState = nextState;
        }

        this.previousWord = word;
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
        if (this.dictionaryOfStates.has(state.hash())) {
            s = this.dictionaryOfStates.get(state.hash());
        } else {
            s = state.copy();
            this.dictionaryOfStates.set(s.hash(), s);
        }
        return s;
    }

    build(dictionary) {
        console.log('Build()');
        //dictionary = dictionary.sort((a, b) => a.input.localeCompare(b.input));

        var startTime = new Date();
        this.inputWordsCount = dictionary.length;
        this.previousWord = "";

        for (let i = 0; i < 20; i++) {
            this.tempStates.push(new State());
        }
        console.log("Building Started, please wait...")
        dictionary.forEach(pair => {
            if (pair.input || pair.output)
                this.addWord(pair)
        });

        //console.log('----------------------------6----------------------------');
        //minimizing the states of the last word
        for (let i = this.currentWord.length; i >= 1; i -= 1) {
            let newState = this.findMinimizedState(this.tempStates[i]);
            this.tempStates[i - 1].setTransition(newState, this.previousWord[i - 1]);
        }
        // this.reduceToMinimalExceptPrefix('');
        //console.log('----------------------------7----------------------------');
        this.startState = this.findMinimizedState(this.tempStates[0]);
        this.tempStates = [];

        var endTime = new Date();
        console.log("Building MFSST took: " + (endTime - startTime) + " milisecnds");
        this.countAndSetValues();
    }

    addWord(pair) {
        this.currentWord = pair.input;
        this.currentOutput = pair.output;
    //console.log(this.currentWord + " : " + this.currentOutput);

        // if (this.currentWord.localeCompare(this.previousWord) < 0) {
        //     console.log("Dictionary is not sorted please sort it and try again to build a transducer");
        // }

        // add letters to the input alphabet set
        for (const c of this.currentWord) {
            this.inputAlphabet.add(c);
        }

        let prefixLength = helpers.commonPrefixLength(this.currentWord, this.previousWord);

        // expand tempStates buffer to current word length
        while (this.tempStates.length <= this.currentWord.length) {
            this.tempStates.push(new State());
        }

        //console.log('----------------------------1----------------------------');
        // set state transitions
        for (let i = this.previousWord.length; i > prefixLength; i -= 1) {
            this.tempStates[i - 1].setTransition(this.findMinimizedState(this.tempStates[i]), this.previousWord[i - 1]);
        }

        // console.log('----------------------------2----------------------------');
        for (let i = prefixLength + 1; i <= this.currentWord.length; i += 1) {
            this.tempStates[i].clear();
            this.tempStates[i - 1].setTransition(this.tempStates[i], this.currentWord[i - 1]);
        }


        // console.log('----------------------------3----------------------------');
        if (this.currentWord != this.previousWord) {
            this.tempStates[this.currentWord.length].isFinal = true;
            this.tempStates[this.currentWord.length].output = new Set([]);
        }
        // console.log('----------------------------4----------------------------');
        // set state outputs
        for (let j = 1; j <= prefixLength; j += 1) {
            // divide (j-1)th state's output to (common) prefix and suffix
            let transition = this.tempStates[j - 1].getTransition(this.currentWord[j - 1]);
            this.commonPrefix = helpers.commonPrefix(transition.output, this.currentOutput);
            this.wordSuffix = helpers.commonSuffix(transition.output, this.commonPrefix);
            // re-set (j-1)'th state's output to prefix
            transition.output = this.commonPrefix;

            // console.log('----------------------------4.1----------------------------');
            // re-set j-th state's output to suffix or set final state outputk
            // this.inputAlphabet.forEach(char => {
            //     let t = this.tempStates[j].getTransition(char);
            //     if (t && t.next != null)
            //         t.output = this.wordSuffix + t.output;
            // });

            this.tempStates[j].transitions.forEach((t, char) => {
                if (t.next != null)
                    t.output = this.wordSuffix + t.output;
            })

            // console.log('----------------------------4.2----------------------------');
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

        // console.log('----------------------------5----------------------------');
        // console.log(`${this.currentWord} == ${this.previousWord}, pref=${prefixLength}`);
        if (this.currentWord == this.previousWord) {
            // console.log('.');
            this.tempStates[this.currentWord.length].output.add(this.currentOutput);
        } else {
            // console.log('....' + this.currentWord[prefixLength] + '   ' + this.currentOutput);
            let transition = this.tempStates[prefixLength].getTransition(this.currentWord[prefixLength]);
            transition.output = this.currentOutput;
        }

        // preserve current word for next loop
        this.previousWord = this.currentWord;
    }

    addWords(dictionary) {
        console.log('Reading Words');
        //dictionary = dictionary.sort((a, b) => a.input > b.input);

        var startTime = new Date();
        this.inputWordsCount = dictionary.length;
        this.previousWord = "";

        dictionary.forEach(pair => {
            this.increaseToMinimalExceptPrefix(helpers.commonPrefix(pair.input, this.previousWord));
            this.addWord(pair);
            this.reduceToMinimalExceptPrefix('');
        });

        var endTime = new Date();
        console.log("Adding words to MFSST took: " + (endTime - startTime) + " milisecnds");
        this.countAndSetValues();
    }
};