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
import { StackVmSystemConsoleLib } from "./src/internal/stack-vm-console";
import { StackVmSystemMathLib } from "./src/internal/stack-vm-math";
import { StackVmSystemStringLib } from "./src/internal/stack-vm-string";
import { StackVM, StackVmError } from "./src/stack-vm";
import { StackVmLoader } from "./src/stack-vm-loader";
import { StackVmConfig } from "./src/stackvm-types";
import { instructionLogger } from "./src/internal/instruction-logger";

const userFns = new StackVmLoader().loadSync(argv[2]);

const config: StackVmConfig = {
    functions: { ...userFns, ...StackVmSystemMathLib, ...StackVmSystemStringLib, ...StackVmSystemConsoleLib },
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
