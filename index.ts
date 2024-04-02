/*
Runs a StackVM program
Format:
    node index.js "path/to/file.yml" [-si]

Flags:
    Use -s to log stack debugging
    Use -i to log instructions debugging
    Use -si to log both
*/ 

import { argv } from "process";
import { StackVM, StackVmError } from "./src/stackvm";
import { StackVmLoader } from "./src/stackvm-loader";
import { StackVmConfig } from "./src/stackvm-types";
import { instructionLogger } from "./src/internal/instruction-logger";
import { StringSystemFunctions } from "./src/internal/sys/string";
import { MathSystemFunctions } from "./src/internal/sys/math";
import { ConsoleSystemFunctions } from "./src/internal/sys/console";

const userFns = new StackVmLoader().loadSync(argv[2]);

const config: StackVmConfig = {
    functions: { ...userFns, ...MathSystemFunctions, ...StringSystemFunctions, ...ConsoleSystemFunctions },
};

const flags = argv[3];
if (flags) {
    if (flags.indexOf("s") > 0) {
        config.stackLogger = (...s) => console.log(...s);
    }
    if (flags.indexOf("i") > 0) {
        config.instructionLogger = instructionLogger;
    }
}

const vm = new StackVM(config);
try {
    const result = vm.run();
    console.log(result);
}
catch (err) {
    if (err instanceof StackVmError) {
        console.error("VM ERROR:", err.message);
    }
}
