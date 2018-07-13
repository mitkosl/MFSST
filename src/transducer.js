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

    lookup(words, file) {
        let out = "";
        words.forEach(word => {
            let input = word;
            let output = this.lookupWord(word);
            out += `${input}\t${output}\n`;
        });
        if (file)
            helpers.writeFile(out, file);
        else
            console.log(out);
    }

    lookupWord(word) {
        let result = 0;
        let currentState = this.startState;
        for (let i = 0; i < word.length; i += 1) {
            let transition = currentState.getTransition(word[i]);
            if (!transition) {
                console.log("there is no transition from " + currentState.id + " with " + word[i] + ' ' + word);
                return 0;
            }
            result += parseInt(transition.output);
            currentState = transition.next;
        }
        if (currentState.isFinal) {
            result += parseInt(currentState.getOutput());
            return result;
        } else {
            console.log("state " + currentState.id + " is not final" + ' ' + word);
            return 0;
        }
    }

    reduceToMinimalExceptPrefix(word) {
        if (!helpers.isPrefix(word, this.previousWord) || this.previousWord == word)
            return;

        for (let i = this.previousWord.length; i >= 1; i -= 1) {
            //If no equivalent state in QminusT
            let newState = this.findMinimizedState(this.tempStates[i]);
            this.tempStates[i - 1].setTransition(newState, this.previousWord[i - 1], 0);
            newState.inputLetters.add(this.previousWord[i - 1]);
        }
        this.startState = this.findMinimizedState(this.tempStates[0]);
        this.tempStates = [];
        this.previousWord = word;
    }

    reduceToMinimalExceptEpsilon() {
        if (this.previousWord == "")
            return;

        for (let i = this.tempStates.length - 1; i >= 1; i -= 1) {
            //If no equivalent state in QminusT
            let newState = this.findMinimizedState(this.tempStates[i]);
            this.tempStates[i - 1].setTransition(newState, this.previousWord[i - 1], 0);
            newState.inputLetters.add(this.previousWord[i - 1]);
        }
        this.startState = this.findMinimizedState(this.tempStates[0]);
        this.tempStates = [];
        this.previousWord = "";
    }

    increaseToMinimalExceptPrefix(word) {
        let currentState = this.startState;
        if (this.previousWord == word || !currentState) {
            return;
        }
        let newState = null;
        let i;
        for (i = this.previousWord.length; i <= word.length; i += 1) { //+1
            //Ti WordI  copy of current Ti with word state
            newState = currentState.copy(currentState.getNumberOfInputs() > 1);
            this.tempStates.push(newState);
            if (this.tempStates[i - 1]) {
                this.tempStates[i - 1].setTransition(newState, word[i - 1], 0);
                newState.inputLetters.add(word[i - 1]);
            }

            if (currentState.getNumberOfInputs() > 1) {
                currentState.inputLetters.delete(word[i - 1]);
            } else {
                this.dictionaryOfStates.delete(currentState.hash());
            }
            let trans = newState.getTransition(word[i]);
            if (trans && trans.next) {
                currentState = trans.next;
            } else
                break;
        }
        this.previousWord = word.substr(0, i);
    }

    print(debug) {
        console.log("\ntotal number of words -> " + this.inputWordsCount);
        let alphabet = "";
        this.inputAlphabet.forEach(c => alphabet += (c + ', '));
        console.log("Alphabet set -> |{ " + alphabet + " }| = " + this.inputAlphabet.size);
        console.log("number of states -> " + this.stateCount());
        console.log("number of output states -> " + this.outputStatesCount());
        console.log("number of transitions -> " + this.transitionsCount());
        if (debug) {
            var output = "";
            this.dictionaryOfStates.forEach(state => output += state.print());
            console.log(output);
        }
    }

    generateGraph() {
        var output = `${this.startState.id} [fillcolor="#2ca02c" shape=Mdiamond]\n`;
        this.dictionaryOfStates.forEach(state => {
            if (state.isFinal) {
                let stateOutput = state.getOutput();
                let stOut = stateOutput ? ':' + stateOutput : '';
                output += `${state.id} [label="${state.id}${stOut}" fillcolor="red" shape=doublecircle]\n`;
            }
            output += state.print();

        });
        let data = `<!DOCTYPE html>
            <meta charset="utf-8">
            
            <body>
                <script src="//d3js.org/d3.v4.min.js"></script>
                <script src="https://unpkg.com/viz.js@1.8.0/viz.js" type="javascript/worker"></script>
                <script src="https://unpkg.com/d3-graphviz@1.4.0/build/d3-graphviz.min.js"></script>
                <div id="graph" style="text-align: center;"></div>
                <script>
                    let dotSrc =
                        \`${output}\`;
                    d3.select("#graph").graphviz()
                    .totalMemory(56777216)
                        .renderDot(
                            \`digraph  {
                            node [style="filled"]
                            \${dotSrc}
                        }\`);
                </script>`
        helpers.writeFile(data, "index.html");
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
        this.inputAlphabet = new Set();
        this.inputWordsCount = 0;
        this.tempStates = [];
        this.dictionaryOfStates = new Map();

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
            this.tempStates[i - 1].setTransition(newState, this.previousWord[i - 1], 0);
            newState.inputLetters.add(this.previousWord[i - 1]);
        }
        // this.reduceToMinimalExceptEpsilon('');
        //console.log('----------------------------7----------------------------');
        this.startState = this.findMinimizedState(this.tempStates[0]);
        this.tempStates = [];

        let tempAlphabet = [];
        this.inputAlphabet.forEach(v => tempAlphabet.push(v));
        this.inputAlphabet = new Set(tempAlphabet.sort((a, b) => a.localeCompare(b)));

        var endTime = new Date();
        console.log("Building MFSST took: " + (endTime - startTime) + " milisecnds");
        this.countAndSetValues();
    }

    addWord(pair) {
        this.currentWord = pair.input;
        this.currentOutput = parseInt(pair.output);
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
            let newState = this.findMinimizedState(this.tempStates[i]);
            this.tempStates[i - 1].setTransition(newState, this.previousWord[i - 1], 0);
            newState.inputLetters.add(this.previousWord[i - 1]);
        }

        // console.log('----------------------------2----------------------------');
        for (let i = prefixLength + 1; i <= this.currentWord.length; i += 1) {
            this.tempStates[i].clear();
            this.tempStates[i - 1].setTransition(this.tempStates[i], this.currentWord[i - 1], 0);
            this.tempStates[i].inputLetters.add(this.currentWord[i - 1]);
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
            this.commonPrefix = helpers.commonPrefix(parseInt(transition.output), parseInt(this.currentOutput));
            this.wordSuffix = helpers.commonSuffix(parseInt(this.commonPrefix), parseInt(transition.output));
            // re-set (j-1)'th state's output to prefix
            transition.output = parseInt(this.commonPrefix);

            // console.log('----------------------------4.1----------------------------');
            // re-set j-th state's output to suffix or set final state outputk
            // this.inputAlphabet.forEach(char => {
            //     let t = this.tempStates[j].getTransition(char);
            //     if (t && t.next != null)
            //         t.output = this.wordSuffix + t.output;
            // });

            if (this.wordSuffix) {
                this.tempStates[j].transitions.forEach((t, char) => {
                    if (t.next != null) {
                        t.output = parseInt(this.wordSuffix) + parseInt(t.output);
                    }
                })
            }

            // console.log('----------------------------4.2----------------------------');
            // set final state output if it's a final state
            if (this.tempStates[j].isFinal) {
                let tempSet = new Set();
                this.tempStates[j].output.forEach(out => {
                    tempSet.add(parseInt(this.wordSuffix) + parseInt(out));
                });
                if (tempSet.size == 0 && this.wordSuffix)
                    tempSet.add(parseInt(this.wordSuffix));
                this.tempStates[j].output = tempSet;
            }
            // update current output (subtract prefix)
            this.currentOutput = helpers.commonSuffix(parseInt(this.commonPrefix), parseInt(this.currentOutput));
            // this.currentOutput = this.currentOutput.substr(this.commonPrefix.length);
        }

        // console.log('----------------------------5----------------------------');
        // console.log(`${this.currentWord} == ${this.previousWord}, pref=${prefixLength}`);
        if (this.currentWord == this.previousWord) {
            // console.log('.');
            this.tempStates[this.currentWord.length].output.add(parseInt(this.currentOutput));
        } else {
            // console.log('....' + this.currentWord[prefixLength] + '   ' + this.currentOutput);
            let transition = this.tempStates[prefixLength].getTransition(this.currentWord[prefixLength]);
            transition.output = parseInt(this.currentOutput);
        }

        // preserve current word for next loop
        this.previousWord = this.currentWord;
    }

    addWords(dictionary) {
        console.log('Reading Words');
        this.tempStates = [];
        //dictionary = dictionary.sort((a, b) => a.input > b.input);

        var startTime = new Date();
        this.inputWordsCount += dictionary.length;
        this.previousWord = "";

        dictionary.forEach(pair => {
            this.increaseToMinimalExceptPrefix(pair.input);
            this.addWord(pair);
            this.reduceToMinimalExceptEpsilon();
        });

        var endTime = new Date();
        console.log("Adding words to MFSST took: " + (endTime - startTime) + " milisecnds");
        this.countAndSetValues();
    }

    deleteWord(pair) {
        this.currentWord = pair.input;
        this.currentOutput = pair.output;
        this.tempStates[this.tempStates.length - 1].isFinal = false;
        if (this.tempStates[this.tempStates.length - 1].transitions.size > 0) {
            return;
        }
        for (let i = this.tempStates.length - 1; i > 0; i -= 1) {
            if (this.tempStates[i].transitions.size < 1)
                this.tempStates[i - 1].removeTransition(this.currentWord[i - 1]);

            if (this.tempStates[i].transitions.size > 0) {
                this.previousWord = this.currentWord.substr(0, i);
                return;
            } else {
                this.tempStates.pop();
            }
        }
    }

    deleteWords(dictionary) {
        console.log('Deleting Words');
        this.tempStates = [];

        var startTime = new Date();
        this.inputWordsCount -= dictionary.length;
        this.previousWord = "";

        dictionary.forEach(pair => {
            // //helpers.commonPrefix(pair.input, this.previousWord)
            this.increaseToMinimalExceptPrefix(pair.input);
            this.deleteWord(pair);
            this.reduceToMinimalExceptEpsilon();
        });

        var endTime = new Date();
        console.log("Deleting words from MFSST took: " + (endTime - startTime) + " milisecnds");
        this.countAndSetValues();
    }

    transducetoEnd(state, currentWord, currentLang) {
        if (state.isFinal)
            currentLang += currentWord + '\n';
        state.transitions.forEach((t, char) => {
            let lang = ""
            if (t.next != null)
                currentLang += this.transducetoEnd(t.next, currentWord + char, lang);
        });
        return currentLang;
    }

    language() {
        let currentState = this.startState;
        let language = "";
        let currentWord = ""

        currentState.transitions.forEach((t, char) => {
            let currentLang = ""
            language += this.transducetoEnd(t.next, currentWord + char, currentLang);
        });
        return language;
    }
};