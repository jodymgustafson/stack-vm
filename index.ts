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

const config: StackVmConfig = {
    functions: { ...StackVmSystemMathLib, ...StackVmSystemStringLib, ...StackVmSystemConsoleLib },
    // stackLogger: (...s) => console.log(...s),
    // instructionLogger: instructionLogger,
};

const assembler = new StackVmAssembler();
const pkg = new StackVmLoader().loadSync(argv[2]);
// console.log(JSON.stringify(pkg, null, 2));
for (const fn of pkg.stackvm.package.functions) {
    const asm = assembler.assemble(fn.definition);
    config.functions[fn.name] = asm;
}

const vm = new StackVM(config);
const result = vm.run();

console.log(result);