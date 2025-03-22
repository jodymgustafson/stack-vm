import { OpCode } from "../stackvm-types";

/**
 * A function for logging VM instructions
 * @param addr   Address of the instruction
 * @param opcode OpCode of the instruction
 * @param value  Value of the instruction
 */
export function instructionLogger(addr: number, opcode: OpCode, value?: number | string): void {
    let out = `* ${addr.toString(16).toUpperCase().padStart(4, "0")} ${OpCode[opcode]}`;
    if (hasArgument(opcode)) {
        if (opcode === OpCode.push && typeof value === "string") {
            value = `"${value}"`;
        }
        else if (typeof value === "number") {
            value = value.toString(16);
        }
        out += " " + value;
    }
    console.log(out);
}

function hasArgument(opcode: OpCode): boolean {
    switch (opcode) {
        case OpCode.nop:
        case OpCode.pop:
        case OpCode.end:
        case OpCode.add:
        case OpCode.sub:
        case OpCode.mul:
        case OpCode.div:
            return false;
    }

    return true;
}