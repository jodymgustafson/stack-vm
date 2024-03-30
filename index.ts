// Runs a stackvm program

import { argv } from "process";
import { FunctionsMap, OpCode, StackVM, StackVmFunctionsMap, VariablesMap } from "./src/stack-vm";
import { StackVmAssembler } from "./src/stack-vm-assembler";
import { StackVmLoader } from "./src/stack-vm-loader"
import { StackVmNativeMathLib } from "./src/internal/stack-vm-math";
import { StackVmNativeStringLib } from "./src/internal/stack-vm-string";

// parse command line
// const program = `
// depends:
//   -test-svm.yml
// code:
// `

const pkg = new StackVmLoader().loadSync("./examples/test-svm.yml");
// console.log(JSON.stringify(pkg, null, 2));
const assembler = new StackVmAssembler();
const fns: FunctionsMap = { ...StackVmNativeMathLib, ...StackVmNativeStringLib };
for (const fn of pkg.stackvm.package.functions) {
    const asm = assembler.assemble(fn.definition);
    fns[fn.name] = asm;
}

// node index.js f2c 50
const vars: VariablesMap = {
    arg0: argv[2],
    arg1: parseFloat(argv[3])
};

const vm = new StackVM(fns, vars);
const code = assembler.assemble(`
    get arg1
test1:
    get arg0
    pushs f2c
    call str.compare
    cmpc 0
    bne test2
    call f2c
    bra end
test2:
    get arg0
    pushs c2f
    call str.compare
    cmpc 0
    bne error
    call c2f
error:
    err "Invalid arguments"
end:
    end
`);
console.log(JSON.stringify(code));
const result = vm.run(code);

console.log(result);