import { StackVmError } from "../../stackvm";
import { SystemFunctionsMap } from "../types";
const prompt = require('prompt-sync')();

/**
 * The system library that contains console interaction functions.
 * 
 * readln: Reads a line of user input from console
 *  call readln         # [{string}]
 *  
 * writeln(s:string): Writes a string to the console followed by a newline
 *  push "some text"    # ["some text"]
 *  call writeln        # []
 */
export const ConsoleSystemFunctions: SystemFunctionsMap = {
    readln: s => {
        return prompt();
    },
    writeln: s => {
        console.log(s.pop());
        return 1;
    }
};
