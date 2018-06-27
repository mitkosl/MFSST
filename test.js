'use strict';
const fs = require('fs');
const helpers = require('./src/helpers');
const readline = require('readline');
const Transducer = require('./index');


function main() {
    const dict = [
        { input: 'april', output: '30' },
        { input: 'aug', output: '31' },
        { input: 'dec', output: '31' },
        { input: 'feb', output: '28' },
        { input: 'feb', output: '29' },
        { input: 'jan', output: '31' },
        { input: 'jul', output: '31' },
        { input: 'jun', output: '30' },
    ];

    var transducer = new Transducer();

    // const file = "./data/2k.dat";
    // helpers.readFile(file)
    //     .then((dict) => {
    //         // transducer = new Transducer(dict);
    //         // transducer.print();
    //         // helpers.writeFile(JSON.stringify(transducer.serialize()));

    //         transducer2 = new Transducer(null);

    //         helpers.readWholeFile('Transducer.dat')
    //         .then(trans => {
    //             transducer2.deserialize(JSON.parse(trans));
    //             console.log(transducer2);
    //         });
    //     });

    // helpers.readFileSingle("file.txt")
    //     .then((dict) => {
    //         transducer.Lookup(dict);
    //     });


    // console.log("_________________________Menu_______________________________");
    // console.log("1. Build new Transducer (from file)");
    // console.log("2. Load Transducer (from file)");
    // console.log("3. Print Transducer Information");
    // console.log("4. Transduce words from file:");
    // console.log("5. Add a word to the transducer");
    // console.log("6. Save Transducer to a file");
    // console.log("7. Menu");
    // console.log("8. Exit");

    helpers.printMenu();
    var stdin = process.openStdin();
    stdin.addListener("data", function (d) {
        let command = d.toString().trim().toLowerCase();
        let commands = command.split(/[ ,]+/);

        if (command == 'exit' || command == 8 || command == 0)
            process.exit();
        if (comman == 'clear')
            console.clear();

        switch (commands[0]) {
            // Build new Transducer (from file)
            case '1':
                {
                    let filename = helpers.checkFileAndCommand(commands);
                    if (!filename)
                        break;
                    console.log("reading file " + filename);
                    helpers.readFile(filename)
                        .then(dict => {
                            transducer.build(dict);
                        });
                }
                break;
            // Load Transducer (from file)
            case '2':
                {
                    let filename = helpers.checkFileAndCommand(commands);
                    if (!filename)
                        filename = 'Transducer.dat';
                    console.log("reading from file " + filename);
                    helpers.readWholeFile(filename)
                        .then(trans => {
                            transducer.deserialize(JSON.parse(trans));
                            console.log("Ready!");
                        });
                }
                break;
            // Print Transducer Information
            case '3':
                if (commands.length > 1)
                    transducer.print(true);
                else
                    transducer.print();
                break;
            // Transduce words from file
            case '4':
                {
                    let filename = helpers.checkFileAndCommand(commands);
                    if (!filename)
                        break;
                    console.log("reading file " + filename);
                    helpers.readFileSingle(filename)
                        .then(dict => {
                            console.log("read the file ");
                            transducer.lookup(dict);
                        });
                }
                break;
            // Add a word to the transducer
            case '5':
                {
                    helpers.printMenu();
                    // Add worddd.... TODO
                }
                break;
            // Save Transducer to a file
            case '6':
                {
                    if (commands.length < 2) {
                        helpers.writeFile(JSON.stringify(transducer.serialize()));
                        console.log('Savet Transducer to file Transducer.dat');
                    } else {
                        helpers.writeFile(JSON.stringify(transducer.serialize()), commands[1]);
                        console.log('Savet Transducer to file ' + commands[1]);
                    }
                }
                break;
            // Menu
            case '7':
            default:
                helpers.printMenu();
        }
        console.log("you entered: [" + commands + "]");
    });
    
    process.on('exit', (code) => {
        console.log("Good Bye ! :)\n");
    });
};

main();