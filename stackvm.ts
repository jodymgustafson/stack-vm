/*
Loads, compiles and runs a StackVM program.

Format:
    node dist/stackvm.js "path/to/file.yml" [-si]

Flags:
    Use -s to log stack debugging
    Use -i to log instructions debugging
    Use -si to log both
*/

import { argv, exit } from "process";
import { getStackVM } from ".";
import { instructionLogger } from "./src/internal/instruction-logger";
import { StackVmError } from "./src/stackvm";
import { StackVmAssemblerError } from "./src/stackvm-assembler";
import { StackVmLoader } from "./src/stackvm-loader";
import { LoggerFn } from "./src/stackvm-types";

try {
    if (argv.length < 3) {
        console.log(`Format: node dist/stackvm.js "path/to/file.yml" [-si]`);
        exit();
    }

    const userFns = new StackVmLoader().loadAndCompileSync(argv[2]);
    if (!userFns["main"]) {
        throw new StackVmError(`File must contain a function named "main"`)
    }

    
    let stackLogger: LoggerFn | undefined;
    let instrLogger: LoggerFn | undefined;
    const flags = argv[3];
    if (flags) {
        if (flags.indexOf("s") > 0) {
            stackLogger = (...s) => console.log(...s);
        }
        if (flags.indexOf("i") > 0) {
            instrLogger = instructionLogger;
        }
    }

    const vm = getStackVM(userFns, stackLogger, instrLogger);
    const result = vm.run();
    console.log(result);
}
catch (err) {
    if (err instanceof StackVmAssemblerError) {
        console.error("ERROR:", err.message);
        err.errors.forEach(e => console.error(e.line, ":", e.message));
    }
    else if (err instanceof StackVmError) {
        console.error("ERROR:", err.message);
    }
    else if (err instanceof Error) {
        console.error("ERROR:", err.message);
    }
    else {
        console.error("ERROR:", err);
    }
}

