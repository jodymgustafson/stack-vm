import { StackVmAtom, OpCode, StackVmCode } from "./stack-vm";

type AsmInstruction = {
    opcode: OpCode;
    line: number;
    value?: string|number;
    value2?: string|number;
    label?: string;
};

export class StackVmAssemblerError extends Error {
    constructor(msg: string, readonly line: number) {
        super(`Error (line ${line + 1}): ${msg}`);
    }
}

/**
 * An assembler for StackVM assembler code
 */
export class StackVmAssembler {
    private labels: Record<string, number>;
    private instructions: AsmInstruction[];

    /**
     * Assembles a StackVM program into ByteCode.
     * @param code A program string or array of lines of code
     */
    assemble(code: string | string[]): StackVmCode {
        this.labels = {};
        this.instructions = [];

        if (typeof code === "string") {
            code = code.split("\n");
        }

        for (let i = 0; i < code.length; i++) {
            const line = code[i].trim();
            if (line) {
                this.parseLine(line, i);
            }
        }

        // this.resolveLabels();
        return this.getInstructions();
    }

    private getInstructions(): StackVmCode {
        const program: StackVmCode = [];
        for (const i of this.instructions) {
            program.push(i.opcode);
            if (i.label) {
                // resolve the label's address
                program.push(this.getLabelAddress(i));
            }
            else if (i.value !== undefined) {
                program.push(i.value);
            }

            if (i.value2 !== undefined) {
                program.push(i.value);
            }
        }

        return program;
    }

    private parseLine(line: string, lineNo: number) {
        const parts = line.split(" ");
        const token = parts[0];
        if (parts.length > 0 && !token.startsWith("#")) {
            if (this.isLabel(token)) {
                // Add a new label with addr set to the current position
                this.labels[token.slice(0, -1)] = this.instructions.length;
            }
            else {
                const instr: AsmInstruction = {
                    opcode: this.getOpCode(token, lineNo),
                    line: lineNo
                };
                if (this.isBranchOp(instr.opcode)) {
                    instr.label = parts[1];
                }
                else {
                    instr.value = this.getValue(instr.opcode, parts[1]);
                }

                this.instructions.push(instr);
            }
        }
    }

    private isLabel(token: string) {
        return token.endsWith(":");
    }

    private getOpCode(s: string, line: number): OpCode {
        const oc = OpCode[s];
        if (oc === undefined) throw new StackVmAssemblerError(`Invalid opcode '${s}'`, line);
        return oc;
    }

    private getLabelAddress(instr: AsmInstruction): number {
        const label = instr.label
        const addr = this.labels[label];
        if (!addr) throw new StackVmAssemblerError(`Reference to unknown label '${label}'`, instr.line);
        return addr;
    }

    private isBranchOp(opcode: OpCode): boolean {
        switch (opcode) {
            case OpCode.beq:
            case OpCode.bgt:
            case OpCode.blt:
            case OpCode.bne:
            case OpCode.bra:
                return true;
        }
        return false;
    }

    private getValue(opcode: OpCode, value: string): number | string | undefined {
        if (value == null || value === "")
            return undefined;

        switch (opcode) {
            case OpCode.beq:
            case OpCode.bgt:
            case OpCode.blt:
            case OpCode.bne:
            case OpCode.bra:
            case OpCode.err:
            case OpCode.get:
            case OpCode.put:
            case OpCode.call:
                return value;
            default:
                return parseFloat(value);
        }
    }
}