import { OpCode, StackVmCode } from "./stack-vm";

type AsmInstruction = {
    opcode: OpCode;
    line: number;
    value?: string|number;
    label?: string;
};

export type AssemblerError = {
    message: string;
    line: number;
};

export class StackVmAssemblerError extends Error {
    constructor(readonly errors: AssemblerError[]) {
        super(`There were ${errors.length} assembler errors`);
    }
}

/**
 * An assembler for StackVM assembly code
 */
export class StackVmAssembler {
    // Keeps track of the program counter for resolving labels
    private pc = 0;
    // Map of labels to code index
    private labels: Record<string, number>;
    // Array of parsed instructions
    private instructions: AsmInstruction[];
    private errors: AssemblerError[];

    /**
     * Assembles a StackVM program into code that can be executed by the VM.
     * @param program A program string or array of lines of code
     */
    assemble(program: string | string[]): StackVmCode {
        this.pc = 0;
        this.labels = {};
        this.instructions = [];
        this.errors = [];

        if (typeof program === "string") {
            program = program.split("\n");
        }

        for (let i = 0; i < program.length; i++) {
            const line = program[i].trim();
            if (line) {
                this.parseLine(line, i);
            }
        }

        const code = this.getStackVmCode();
        if (this.errors.length === 0) return code;

        throw new StackVmAssemblerError(this.errors);
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
        if (addr == null) this.addError(`Reference to unknown label "${instr.label}"`, instr.line);
        return addr;
    }

    /**
     * Parses a line of assembly code into an instruction and adds it to the
     * list of instructions if it contains executable code
     * @param line A line of assembly code
     * @param lineNo Line number in the source file
     */
    private parseLine(line: string, lineNo: number): void {
        const re = /\s*([_A-Za-z]\w*:)?\s*([A-Za-z]+)?\s*(\".*\"|[.]|[^#\s]+)?\s*(#.*)?/.exec(line);
        // re[1] = label
        // re[2] = opcode
        // re[3] = value
        // re[4] = comment
        if (re[1]) {
            const label = re[1].slice(0, -1);
            // Add a new label with addr set to the current position
            if (this.labels[label] !== undefined) {
                this.addError(`Duplicate label "${label}"`, lineNo);
            }
            else {
                this.labels[label] = this.pc;
            }
        }
        if (re[2]) {
            const instr: AsmInstruction = {
                opcode: this.getOpCode(re[2], lineNo),
                line: lineNo
            };
            this.pc++;

            if (this.isBranchOp(instr.opcode)) {
                instr.label = re[3];
                this.pc++;
            }
            else {
                instr.value = this.getValue(instr.opcode, re[3]);
                if (instr.value != undefined) this.pc++;
            }

            this.instructions.push(instr);            
        }
    }
    
    private getOpCode(s: string, line: number): OpCode {
        const oc = OpCode[s.toLowerCase()];
        if (oc === undefined) this.addError(`Invalid opcode "${s}"`, line);
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
                return unquote(value);
            // All other ops expect a number
            default:
                if (value[0] === "$") return parseInt(value.slice(1), 16);
                if (value[0] === "%") return parseInt(value.slice(1), 2);
                return parseFloat(value);
        }
    }

    private addError(message: string, line: number): void {
        this.errors.push({
            message,
            line
        });
    }
}

/** Removes any quotes around a string */
function unquote(s: string): string {
    return s[0] === '"' ? s.slice(1, -1) : s;
}