/*
Runs a StackVM program
Format:
    node index.js "path/to/file.yml"
*/ 

import { argv } from "process";
import { StackVM } from "./src/stack-vm";
import { StackVmAssembler } from "./src/stack-vm-assembler";
import { StackVmLoader } from "./src/stack-vm-loader"
import { StackVmSystemMathLib } from "./src/internal/stack-vm-math";
import { StackVmSystemStringLib } from "./src/internal/stack-vm-string";
import { StackVmSystemConsoleLib } from "./src/internal/stack-vm-console";
import { instructionLogger } from "./src/internal/instruction-logger";
import { StackVmConfig } from "./src/stackvm-types";

const loadedFns = new StackVmLoader().loadSync(argv[2]);

const config: StackVmConfig = {
    functions: { ...loadedFns, ...StackVmSystemMathLib, ...StackVmSystemStringLib, ...StackVmSystemConsoleLib },
    // stackLogger: (...s) => console.log(...s),
    // instructionLogger: instructionLogger,
};

const vm = new StackVM(config);
const result = vm.run();

console.log(result);