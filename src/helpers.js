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

export const helpers = {
    readFile,
};
