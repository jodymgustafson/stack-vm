// Runs a stackvm program

import { argv } from "process";
import { OpCode, StackVM, StackVmFunctionsMap } from "./src/stack-vm";
import { StackVmAssembler } from "./src/stack-vm-assembler";
import { StackVmFileLoader } from "./src/stack-vm-loader"

// parse command line
// const program = `
// depends:
//   -test-svm.yml
// code:
// `

const pkg = new StackVmFileLoader("./examples/test-svm.yml").loadSync();
// console.log(JSON.stringify(pkg, null, 2));
const assembler = new StackVmAssembler();
const fns: StackVmFunctionsMap = {};
for (const fn of pkg.stackvm.package.functions) {
    const asm = assembler.assemble(fn.definition);
    fns[fn.name] = asm;
}

const vm = new StackVM(fns);
const result = vm.run(assembler.assemble(`
    push ${argv[2] ?? 0}
    call f2c
`));

console.log(result);