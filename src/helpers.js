'use strict'

var InOutPair = require('inOutpair.js');
var Lazy = require('lazy.js');

const readFile = (filename) => {
    let dict = [];
    Lazy.readFile(filename)
        .lines()
        .each((line) => {
            let ll = line.split('\t');
            if (!ll[1])
                dict.push(ll[0]);
            dict.push(new InOutPair(ll[0], ll[1]));
        });
}

const commonPrefixLengthPlus1 = (word1, word2) => {
    let i = 1;
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) do {
        i++;
    }
    return i;
}

const commonPrefix = (word1, word2) => {
    let i = 1;
    prefix = "";
    while ((i < word1.length) && (i < word2.length) && word1[i] == word2[i]) do {
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
