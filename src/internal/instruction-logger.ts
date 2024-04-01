import { OpCode } from "../stack-vm";

/**
 * A function for logging VM instructions
 * @param opcode OpCode of the instruction
 * @param value  Value of the instruction
 */
export function instructionLogger(opcode: OpCode, value?: number | string): void {
    let out = "* " + OpCode[opcode];
    if (hasArgument(opcode)) {
        if (opcode === OpCode.pushs) {
            value = `"${value}"`;
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