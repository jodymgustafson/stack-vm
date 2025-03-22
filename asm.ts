/*
Loads a StackVM yaml file and compiles it into bytecode that the VM can run and writes it out.

Format:
    node dist/asm.js "path/to/file.yml" [-f][-d]

Flags:
    Use -f to format output
    Use -d to log debugging info (line numbers and opcode names)
*/

import { argv, exit } from "process";
import { StackVmLoader } from "./src/stackvm-loader";
import { StackVmAssemblerError } from "./src/stackvm-assembler";
import { OpCode, StackVmAtom, StackVmCode } from "./src/stackvm-types";
import { getParameterCount, isBranchOpCode } from "./src/internal/utils";

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
            else outputWithFormatting(fn);
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

function outputWithFormatting(fn: StackVmCode): void {
    const codes = [];
    for (let i = 0; i < fn.length; i++) {
        const opCode = fn[i] as OpCode;
        codes.push(toHexString(opCode));
        const cnt = getParameterCount(opCode);
        if (cnt > 0)
            codes.push(getValue(fn[++i], opCode));
        if (cnt > 1)
            codes.push(getValue(fn[++i], opCode));
    }

    console.log("  ", codes.join(","));
}

function outputWithDebug(fn: StackVmCode): void {
    const codes = [];
    for (let i = 0; i < fn.length; i++) {
        const opCode = fn[i] as OpCode;
        let line = `  ${toAddressString(i)} ${OpCode[opCode]?.padEnd(4)}:  ${toHexString(opCode)}`;

        const cnt = getParameterCount(opCode);
        if (cnt > 0)
            line += ` ${getValue(fn[++i], opCode, isBranchOpCode(opCode))}`;
        if (cnt > 1)
            line += ` ${getValue(fn[++i], opCode)}`;

        codes.push(line);
    }

    console.log(codes.join("\n"));
}

function toAddressString(n: number) {
    return n.toString(16).toUpperCase().padStart(4, "0");
}

function toHexString(opCode: OpCode) {
    return opCode.toString(16).toUpperCase().padStart(2, "0");
}

function getValue(atom: StackVmAtom, opCode: OpCode, isAddress = false): string {
    if (typeof atom === "string") {
        return opCode === OpCode.push ? `"${atom}"` : `(${atom})`;
    }
    else if (typeof atom === "number") {
        return (isAddress ? toAddressString(atom) : toHexString(atom));
    }
    return atom;
}
