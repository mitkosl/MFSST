'use strict';
const fs = require('fs');
const helpers = require('./src/helpers');
const readline = require('readline');
const Transducer = require('./index');

var transducer = new Transducer();

function main() {
    const dict = [{
            input: 'apr',
            output: '30'
        },
        {
            input: 'aug',
            output: '31'
        },
        {
            input: 'dec',
            output: '31'
        },
        {
            input: 'feb',
            output: '28'
        },
        {
            input: 'feb',
            output: '29'
        },
        {
            input: 'jan',
            output: '31'
        }
    ];

    const dict2 = [{
            input: 'jul',
            output: '31'
        },
        {
            input: 'jun',
            output: '30'
        },
    ]


    // var transducer = new Transducer();
    // const file = "./data/data2.dat"; //"./data/2k.dat";
    // const file2 = "./data/data3.dat"; //"./data/2k.dat";
    // helpers.readFile(file)
    //     .then((dict) => {
    //         transducer = new Transducer(dict);
    //         transducer.print();
    //         helpers.readFile(file2)
    //             .then(dict2 => {
    //                 // transducer.lookup(dict2);
    //                 transducer.addWords(dict2);
    //                 transducer.print();
    //             })
    //     });



    // helpers.writeFile(JSON.stringify(transducer.serialize()));

    // let transducer2 = new Transducer(null);

    // helpers.readWholeFile('Transducer.dat')
    // .then(trans => {
    //     transducer2.deserialize(JSON.parse(trans));
    //     console.log(transducer2);
    // });
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
    // console.log("5. Add words to the transducer (from file)");
    // console.log("6. Save Transducer to a file");
    // console.log("7. Delete words from the transducer (file)");
    // console.log("8. Menu");
    // console.log("9. Exit");
    // console.log("10 Plot");
    // console.log("11 Print Trasducer Language");
    // fc.exe dim2.txt dim2_a.txt > diff2.txt


    helpers.printMenu();
    var stdin = process.openStdin();
    stdin.addListener("data", processCommands);

    process.on('exit', (code) => {
        console.log("Good Bye ! :)\n");
    });
};

main();

function processCommands(d) {
    let command = d.toString().trim().toLowerCase();
    let commands = command.split(/[ ,]+/);

    if (command == 'exit' || command == 9)
        process.exit();
    if (command == 'clear' || command == 'cls')
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
                console.log("reading file" + filename);
                helpers.readFileSingle(filename)
                .then(dict => {
                    console.log("read the file ");
                    let outFile = null;
                    if (commands.length > 2)
                        outFile = 'output/' + commands[2];
                    transducer.lookup(dict, outFile);
                    console.log("read " + dict.length + " words");
                });
            }
            break;
            // Add words to the transducer
        case '5':
            {
                let filename = helpers.checkFileAndCommand(commands);
                if (!filename)
                    break;
                console.log("reading file " + filename);
                helpers.readFile(filename)
                .then(dict => {
                    transducer.addWords(dict);
                });
            }
            break;
            // Save Transducer to a file
        case '6':
            {
                if (commands.length < 2) {
                    helpers.writeFile(JSON.stringify(transducer.serialize()));
                    console.log('Saved Transducer to file Transducer.dat');
                } else {
                    helpers.writeFile(JSON.stringify(transducer.serialize()), commands[1]);
                    console.log('Saved Transducer to file ' + commands[1]);
                }
            }
            break;
            // Delete words form transducer
        case '7':
            {
                // commands[1] = "data3.dat";
                let filename = helpers.checkFileAndCommand(commands);
                if (!filename)
                    break;
                console.log("reading words to delete from " + filename);
                helpers.readFile(filename)
                .then(dict => {
                    console.log("read the file ");
                    transducer.deleteWords(dict);
                });
            }
            break;
            // Plot graph
        case '10':
            transducer.generateGraph();
            console.log("Plot was created run 'npm run plot' and follow the address");
            break;
        case '11':
            {
                console.log("Printing language...");
                let language = transducer.language();
                if (commands.length < 2) {
                    console.log(language);
                } else {
                    let outFile = 'output/' + commands[1];
                    helpers.writeFile(language, outFile);
                    console.log('Saved Transducer language to file ' + commands[1]);
                }
            }
            break;
            // Menu
        case '8':
        default:
            helpers.printMenu();
    }
    console.log("you entered: [" + commands + "]");
}