import { OpCode } from "../stackvm-types";
import { getParameterCount, isBranchOpCode } from "./utils";

/**
 * A function for logging VM instructions
 * @param addr   Address of the instruction
 * @param opcode OpCode of the instruction
 * @param value1  Value of the instruction
 */
export function instructionLogger(addr: number, opcode: OpCode, value1?: number | string, value2?: number | string): void {
    let out = `* ${addr.toString(16).toUpperCase().padStart(4, "0")} ${OpCode[opcode]}`;
    const paramCnt = getParameterCount(opcode);
    if (paramCnt > 0) {
        value1 = valueToString(opcode, value1 ?? "UNKNOWN");
        if (paramCnt === 2) {
            value1 += ", " + valueToString(opcode, value2 ?? "UNKNOWN");
        }
        out += " " + value1;
    }

    console.log(out);
}

function valueToString(opcode: OpCode, value: string | number): string {
    if (typeof value === "number") {
        value = value.toString(16).toUpperCase();
        if (isBranchOpCode(opcode)) {
            value = value.padStart(4, "0"); // pad to 4 digits for branch opcodes
        }
    }
    else if (typeof value === "string") {
        value = opcode === OpCode.push ? `"${value}"` : `(${value})`;
    }

    return value;
}
