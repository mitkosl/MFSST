'use strict'

const fs = require('fs');

async function readWholeFile(filename = 'Transducer.dat') {
    var obj = fs.readFileSync(filename, 'utf-8');
    return obj;
}

async function readFile(filename) {
    let dict = [];
    var lines = fs.readFileSync(filename, 'utf-8').split('\n');

    lines.forEach(line => {
        let inOut = line.split(/[ ,\t\r]+/);
        if (!inOut[1])
            dict.push({
                input: inOut[0],
                output: ''
            });
        else
            dict.push({
                input: inOut[0],
                output: inOut[1]
            });
    });
    return dict;
}

async function writeFile(data, filename = 'Transducer.dat') {
    var lines = fs.writeFileSync(filename, data, 'utf-8');
}

async function readFileSingle(filename) {
    let dict = [];
    var lines = fs.readFileSync(filename, 'utf-8').split('\n');

    lines.forEach(line => {
        let input = line.split(/[ ,:\t\r]+/);
        dict.push(input[0])
    });
    return dict;
}

const checkFileAndCommand = (commands) => {
    let fileName = null;
    if (commands.length < 2) {
        console.log("Enter 2 arguments:    [#] [filename.ext]");
        return fileName;
    }
    if (fs.existsSync(commands[1]))
        fileName = commands[1];

    if (!fileName && fs.existsSync('data/' + commands[1]))
        fileName = 'data/' + commands[1];

    if (!fileName)
        console.error("file " + commands[1] + " does not exist...");
    return fileName;
}

const commonPrefixLength = (word1, word2) => {
    let i = 0;
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) {
        i+=1;
    }
    return i;
}

const commonPrefix = (word1, word2) => {
    let i = 0;
    let prefix = "";
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) {
        prefix += word1[i];
        i+=1
    }
    return prefix;
}

const isPrefix = (prefix, word) => {
    return commonPrefix(prefix, word) == prefix;
}

const commonSuffix = (word1, word2) => {
    return word1.substr(word2.length);
}

const printMenu = () => {
    console.log("_________________________Menu_______________________________");
    console.log("1. Build new Transducer (from file)");
    console.log("2. Load Transducer (from file)");
    console.log("3. Print Transducer Information");
    console.log("4. Transduce words from file:");
    console.log("5. Add words to the transducer (from file)");
    console.log("6. Save Transducer to a file");
    console.log("7. Delete words from the transducer (file)");
    console.log("8. Menu");
    console.log("9. Exit");
}

String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i+=1) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

module.exports = {
    readFile,
    readWholeFile,
    readFileSingle,
    writeFile,
    commonPrefix,
    isPrefix,
    commonSuffix,
    commonPrefixLength,
    printMenu,
    checkFileAndCommand
};