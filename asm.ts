/*
    Loads a StackVM yaml file and compiles it into bytecode that the VM can run.

    Format:
        node dist/asm.js "path/to/file.yml" [-fd]

    Flags:
        Use -f to format output
        Use -d to log debugging info (line numbers and opcode names)
*/

import { argv, exit } from "process";
import { StackVmLoader } from "./src/stackvm-loader";
import { StackVmAssemblerError } from "./src/stackvm-assembler";
import { OpCode, StackVmAtom, StackVmCode } from "./src/stackvm-types";

/** Maps opcodes that have params to the number of params it requires */
const OpCodesWithParam: Record<number, number> = {
    [OpCode.push]: 1,
    [OpCode.get]: 1,
    [OpCode.put]: 1,
    [OpCode.putc]: 2,
    [OpCode.call]: 1,
    [OpCode.err]: 1,
    [OpCode.cmpc]: 1,
    [OpCode.cmpv]: 1,
    [OpCode.bra]: 1,
    [OpCode.beq]: 1,
    [OpCode.bne]: 1,
    [OpCode.blt]: 1,
    [OpCode.bgt]: 1,
}
const BranchOpCodes = [OpCode.bra, OpCode.beq, OpCode.bne, OpCode.blt, OpCode.bgt];

try {
    if (argv.length < 3) {
        console.log(`Format: node dist/asm.js "path/to/file.yml" [-d]`);
        exit();
    }

    const logDebug = (argv[3]?.indexOf("d") >= 0);
    const isFormatted = (argv[3]?.indexOf("f") >= 0);

    const userFns = new StackVmLoader().loadAndCompileSync(argv[2]);
    if (!(logDebug || isFormatted)) {
        console.log(JSON.stringify(userFns));
    }
    else {
        for (const fnName in userFns) {
            console.log(`${fnName}:`);
            const fn = userFns[fnName];
            if (logDebug) outputWithDebug(fn);
            else outputBytecode(fn);
        }
    }
}
catch (err) {
    if (err instanceof StackVmAssemblerError) {
        console.error("ERROR:", err.message);
        err.errors.forEach(e => console.error(e.line, ":", e.message));
    }
    else if (err instanceof Error) {
        console.error("ERROR:", err.message);
    }
    else {
        console.error("ERROR:", err);
    }
}

function outputBytecode(fn: StackVmCode): void {
    const codes = [];
    for (let i = 0; i < fn.length; i++) {
        const code = fn[i];
        codes.push(code.toString(16).padStart(2, "0"));
        const cnt = OpCodesWithParam[code as number] ?? 0;
        if (cnt > 0)
            codes.push(getValue(fn[++i]));
        if (cnt > 1)
            codes.push(getValue(fn[++i]));
    }

    console.log("  ", codes.join(","));
}

function outputWithDebug(fn: StackVmCode): void {
    const codes = [];
    for (let i = 0; i < fn.length; i++) {
        const code = fn[i];
        const opCode = code.toString(16).padStart(2, "0");
        let line = `  ${i.toString(16).padStart(4, "0")} ${OpCode[code as OpCode]?.padEnd(4)}:  ${opCode}`;

        const cnt = OpCodesWithParam[code as number] ?? 0;
        if (cnt > 0)
            line += ` ${getValue(fn[++i], isBranchOpCode(code))}`;
        if (cnt > 1)
            line += ` ${getValue(fn[++i])}`;

        codes.push(line);
    }

    console.log(codes.join("\n"));
}

function getValue(code: StackVmAtom, isAddress = false): string {
    if (typeof code === "string") {
        return `'${code}'`;
    }
    else if (typeof code === "number") {
        const s = code.toString(16);
        return (isAddress ? s.padStart(4, "0") : s);
    }
    return "ERROR: Invalid code type";
}

function isBranchOpCode(code: StackVmAtom): boolean {
    return BranchOpCodes.includes(code as OpCode);
}

