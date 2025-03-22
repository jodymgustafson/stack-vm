import { OpCode } from "../stackvm-types";

const BranchOpCodes = [OpCode.bra, OpCode.beq, OpCode.bne, OpCode.blt, OpCode.bgt];

export function isBranchOpCode(code: OpCode): boolean {
    return BranchOpCodes.includes(code as OpCode);
}


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
};

export function getParameterCount(opCode: OpCode): number {
    return OpCodesWithParam[opCode as number] ?? 0;
}