// Runs a stackvm program

import { argv } from "process";
import { FunctionsMap, OpCode, StackVM, StackVmFunctionsMap, VariablesMap } from "./src/stack-vm";
import { StackVmAssembler } from "./src/stack-vm-assembler";
import { StackVmLoader } from "./src/stack-vm-loader"
import { StackVmSystemMathLib } from "./src/internal/stack-vm-math";
import { StackVmNativeStringLib } from "./src/internal/stack-vm-string";

// parse command line
// const program = `
// depends:
//   -test-svm.yml
// code:
// `

// This package contains temperature conversion functions
const pkg = new StackVmLoader().loadSync("./examples/test-svm.yml");
// console.log(JSON.stringify(pkg, null, 2));
const assembler = new StackVmAssembler();
const fns: FunctionsMap = { ...StackVmSystemMathLib, ...StackVmNativeStringLib };
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
# arg0 is the function to call (f2c or c2f)
# arg1 is the temperature to convert
s:  get arg1  # start
test1:
    get arg0
    pushs "f2c"
    call str.compare
    cmpc 0
    pop
    bne test2
    call f2c
    bra end
test2:
    get arg0
    pushs "c2f"
    call str.compare
    cmpc 0
    pop
    bne error
    call c2f
    bra end
error:
    err "Invalid arguments"
end:
    end
`);
console.log(JSON.stringify(code));
const result = vm.run(code);

console.log(result);