import { OpCode, StackVmCode } from "./stack-vm";

type AsmInstruction = {
    opcode: OpCode;
    line: number;
    value?: string|number;
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
    // Keeps track of the program counter for resolving labels
    private pc = 0;
    // Map of labels to code index
    private labels: Record<string, number>;
    // Array of parsed instructions
    private instructions: AsmInstruction[];

    /**
     * Assembles a StackVM program into code that can be executed by the VM.
     * @param code A program string or array of lines of code
     */
    assemble(code: string | string[]): StackVmCode {
        this.pc = 0;
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

        return this.getStackVmCode();
    }

    /**
     * Converts the parsed instructions into StackVM code and resolves addresses of labels
     * @returns Code that can be executed by the VM
     */
    private getStackVmCode(): StackVmCode {
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
        }

        return program;
    }

    private getLabelAddress(instr: AsmInstruction): number {
        const addr = this.labels[instr.label];
        if (addr == null) throw new StackVmAssemblerError(`Reference to unknown label '${instr.label}'`, instr.line);
        return addr;
    }

    /**
     * Parses a line of assembly code into an instruction and adds it to the
     * list of instructions if it contains executable code
     * @param line A line of assembly code
     * @param lineNo Line number in the source file
     */
    private parseLine(line: string, lineNo: number): void {
        const parts = line.split(" ");
        const token = parts[0];
        if (parts.length > 0 && !token.startsWith("#")) {
            if (this.isLabel(token)) {
                // Add a new label with addr set to the current position
                this.labels[token.slice(0, -1)] = this.pc;
            }
            else {
                const instr: AsmInstruction = {
                    opcode: this.getOpCode(token, lineNo),
                    line: lineNo
                };
                this.pc++;

                const lblOrValue = this.parseLabelOrValue(parts)
                if (this.isBranchOp(instr.opcode)) {
                    instr.label = lblOrValue;
                    this.pc++;
                }
                else {
                    instr.value = this.getValue(instr.opcode, lblOrValue);
                    if (instr.value != undefined) this.pc++;
                }

                this.instructions.push(instr);
            }
        }
    }
    
    private parseLabelOrValue(parts: string[]): string {
        let s = parts[1];
        if (s && s.charAt(0) === '"') {
            // Parse a quoted string
            // Remove the start quote
            let pieces = [s.slice(1)];
            for (let i = 1; i < parts.length; i++) {
                if (s.charAt(s.length - 1) === '"') break;
                s = parts[i + 1];
            }
            // Remove the end quote
            return pieces.join(" ").slice(0, -1);
        }

        return s;
    }

    private isLabel(token: string) {
        return token.endsWith(":");
    }

    private getOpCode(s: string, line: number): OpCode {
        const oc = OpCode[s.toLowerCase()];
        if (oc === undefined) throw new StackVmAssemblerError(`Invalid opcode '${s}'`, line);
        return oc;
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
            // All of these ops expect a string
            case OpCode.pushs:
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
            // All other ops expect a number
            default:
                if (value.charAt(0) === "$") return parseInt(value.slice(1), 16);
                if (value.charAt(0) === "%") return parseInt(value.slice(1), 2);
                return parseFloat(value);
        }
    }
}