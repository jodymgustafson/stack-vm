// Runs a stackvm program

import { argv } from "process";
import { FunctionsMap, OpCode, StackVM, StackVmFunctionsMap, VariablesMap } from "./src/stack-vm";
import { StackVmAssembler } from "./src/stack-vm-assembler";
import { StackVmLoader } from "./src/stack-vm-loader"
import { StackVmNativeMathLib } from "./src/stack-vm-math";

// parse command line
// const program = `
// depends:
//   -test-svm.yml
// code:
// `

const pkg = new StackVmLoader().loadSync("./examples/test-svm.yml");
// console.log(JSON.stringify(pkg, null, 2));
const assembler = new StackVmAssembler();
const fns: FunctionsMap = StackVmNativeMathLib;
for (const fn of pkg.stackvm.package.functions) {
    const asm = assembler.assemble(fn.definition);
    fns[fn.name] = asm;
}

const vars: VariablesMap = {};
for (let i = 2; i < argv.length; i++) {
    vars["arg" + (i - 2)] = parseFloat(argv[i]);
}

const vm = new StackVM(fns, vars);
const result = vm.run(assembler.assemble(`
  get arg0
  call f2c
`));

console.log(result);