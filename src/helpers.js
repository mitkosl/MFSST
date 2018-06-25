'use strict'

const fs = require('fs');

async function readFile(filename) {
    let dict = [];
    // var lines = require('fs').readFileSync(filename, 'utf-8')
    // .split('\n');

    // lines.forEach((line) => {
    //     let inOut = line.split('\t');
    //     if (!inOut[1])
    //         dict.push({ input: inOut[0], output: '' });
    //     else
    //         dict.push({ input: inOut[0], output: inOut[1] });
    // });
    // return dict;

    var lines = fs.readFileSync(filename, 'utf-8')
        .split('\n');

    lines.forEach(line => {
        //console.log('Line from file:', line);
        let inOut = line.split(/[ ,]+/);
        if (!inOut[1])
            dict.push({ input: inOut[0], output: '' });
        else
            dict.push({ input: inOut[0], output: inOut[1] });
    });
    return dict;
}

const commonPrefixLength = (word1, word2) => {
    let i = 0;
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) {
        i++;
    }
    return i;
}

const commonPrefix = (word1, word2) => {
    let i = 0;
    let prefix = "";
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) {
        prefix+= word1[i];
        i++;
    }
    return prefix;
}

const commonSuffix = (word1, word2) => {
    return word1.substr(word2.length);
}

module.exports = {
    readFile,
    commonPrefix,
    commonSuffix,
    commonPrefixLength
};
