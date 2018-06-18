'use strict'
var Lazy = require('lazy.js');

const readFile = (filename) => {
    let dict = [];
    Lazy.readFile(filename)
        .lines()
        .each(line => {
            let inOut = line.split('\t');
            if (!inOut[1])
                dict.push({ input: inOut[0], output: '' });
            else
                dict.push({ input: inOut[0], output: inOut[1] });
        });
    return dict;
}

const commonPrefixLengthPlus1 = (word1, word2) => {
    let i = 1;
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) {
        i++;
    }
    return i;
}

const commonPrefix = (word1, word2) => {
    let i = 1;
    prefix = "";
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) {
        prefix + word1[i];
        i++;
    }
    return prefix;
}

export const helpers = {
    readFile,
    commonPrefix,
    commonPrefixLength,
};
