import { StackVmError } from "../../stackvm";
import { SystemFunctionsMap } from "../types";
const prompt = require('prompt-sync')();

/**
 * The system library that contains console interaction functions.
 */
export const ConsoleSystemFunctions: SystemFunctionsMap = {
    // reads user input from console, no parameters
    readln: s => {
        return prompt();
    },
    // Writes a string to the console
    writeln: s => {
        console.log(s.pop());
        return 1;
    }
};
