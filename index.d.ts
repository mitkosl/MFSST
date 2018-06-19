declare module 'transducer' {

    export class Transducer {
        constructor(dictionary: Array<{ input: string, output: string }>);

        stateCount: () => number;

        transitionsCount: () => number;

        outputStatesCount: () => number;

        print: () => void;

        findMinimizedState: (state: any) => any;

        build: (dictionary: Array<{ input: string, output: string }>) => void;
    }

}