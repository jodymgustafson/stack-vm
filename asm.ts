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
        const opCode = fn[i] as OpCode;
        codes.push(toHexString(opCode));
        const cnt = OpCodesWithParam[opCode as number] ?? 0;
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
        const opCode = fn[i] as OpCode;
        let line = `  ${toAddressString(i)} ${OpCode[opCode]?.padEnd(4)}:  ${toHexString(opCode)}`;

        const cnt = OpCodesWithParam[opCode as number] ?? 0;
        if (cnt > 0)
            line += ` ${getValue(fn[++i], isBranchOpCode(opCode))}`;
        if (cnt > 1)
            line += ` ${getValue(fn[++i])}`;

        codes.push(line);
    }

    console.log(codes.join("\n"));
}

function toAddressString(i: number) {
    return i.toString(16).toUpperCase().padStart(4, "0");
}

function toHexString(code: OpCode) {
    return code.toString(16).toUpperCase().padStart(2, "0");
}

function getValue(atom: StackVmAtom, isAddress = false): string {
    if (typeof atom === "string") {
        return `"${atom}"`;
    }
    else if (typeof atom === "number") {
        return (isAddress ? toAddressString(atom) : toHexString(atom));
    }
    return atom;
}

function isBranchOpCode(code: StackVmAtom): boolean {
    return BranchOpCodes.includes(code as OpCode);
}

