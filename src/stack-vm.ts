import { SystemFunction, StackVmStack } from "./internal/types";
import { FunctionsMap, LoggerFn, OpCode, StackVmCode, StackVmConfig, VariablesMap } from "./stackvm-types";

/** An error thrown by the VM */
export class StackVmError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

/**
 * Defines a virtual machine that runs StackVM code
 */
export class StackVM {
    private stack: StackVmStack = [];
    // Stack frames to hold local variables
    private varStack: VariablesMap[] = [];
    // Result of the last compare
    private compareResult = 0;

    private functions: FunctionsMap;
    private stackLogger: LoggerFn;
    private instructionLogger: LoggerFn;

    /**
     * @param config Configuration for the VM
     */
    constructor(readonly config: StackVmConfig) {
        this.functions = config.functions;
        if (config.variables) {
            this.varStack.push(config.variables);
        }
        this.stackLogger = config.stackLogger;
        this.instructionLogger = config.instructionLogger;
    }

    /**
     * Runs the specified set of instructions
     * @param code Code to run
     * @returns The value on top of the stack when the code finishes
     */
    run(code?: StackVmCode): number | string {
        // Always start with an empty stack
        this.stack = [];
        return this.runFrame(code ?? this.functions["main"] as StackVmCode);
    }
    
    /**
     * Runs the specified set of instructions in a new context
     * @param code Code to run
     * @returns The value on top of the stack when the code finishes
     */
    private runFrame(code: StackVmCode): number | string {
        // Push a new variables context
        this.varStack.push({});

        let tmp: number | string;    
        for (let pc = 0; pc < code.length; pc++) {
            this.stackLogger && this.stackLogger(this.stack);
            const opcode = code[pc];
            this.instructionLogger && this.instructionLogger(opcode, code[pc + 1]);
            // Noop does nothing
            if (opcode === OpCode.nop) continue;
            // End immediately breaks out of the loop
            if (opcode === OpCode.end) break;

            switch (opcode) {
                case OpCode.push:
                case OpCode.pushs: this.stack.push(code[++pc]);
                    break;
                case OpCode.pop: this.pop();
                    break;
                case OpCode.get:
                    tmp = this.getVariable(code[++pc] as string);
                    this.stack.push(tmp);
                    break;
                case OpCode.put:
                    this.setVariable(code[++pc] as string, this.peek());
                    break;
                case OpCode.putc:
                    this.setVariable(code[++pc] as string, code[++pc] as number);
                    break;
                case OpCode.call:
                    tmp = this.callFunction(code[++pc] as string);
                    this.stack.push(tmp);
                    break;
                case OpCode.add:
                    this.stack.push(this.pop() + this.pop());
                    break;
                case OpCode.sub:
                    tmp = this.pop();
                    this.stack.push(this.pop() - tmp);
                    break;
                case OpCode.mul:
                    this.stack.push(this.pop() * this.pop());
                    break;
                case OpCode.div:
                    tmp = this.pop();
                    this.stack.push(this.pop() / tmp);
                    break;
                case OpCode.and:
                    tmp = this.pop();
                    this.stack.push(this.pop() & tmp);
                    break;
                case OpCode.or:
                    tmp = this.pop();
                    this.stack.push(this.pop() | tmp);
                    break;
                case OpCode.xor:
                    tmp = this.pop();
                    this.stack.push(this.pop() ^ tmp);
                    break;
                case OpCode.not:
                    this.stack.push(~this.pop());
                    break;
                case OpCode.shlc:
                    this.stack.push(this.pop() << (code[++pc] as number));
                    break;
                case OpCode.shrc:
                    this.stack.push(this.pop() >> (code[++pc] as number));
                    break;
                case OpCode.cmp:
                    this.compareResult = this.compare(this.pop(), this.pop());
                    this.stack.push(this.compareResult);
                    break;
                case OpCode.cmpc:
                    this.compareResult = this.compare(this.peek(), code[++pc]);
                    break;
                case OpCode.cmpv:
                    this.compareResult = this.compare(this.peek(), this.getVariable(code[++pc] as string));
                    break;
                case OpCode.bra:
                    pc = code[++pc] as number - 1;
                    break;
                case OpCode.beq:
                    ++pc;
                    if (this.compareResult === 0)
                        pc = code[pc] as number - 1;
                    break;
                case OpCode.bne:
                    ++pc;
                    if (this.compareResult !== 0)
                        pc = code[pc] as number - 1;
                    break;
                case OpCode.blt:
                    ++pc;
                    if (this.compareResult < 0)
                        pc = code[pc] as number - 1;
                    break;
                case OpCode.bgt:
                    ++pc;
                    if (this.compareResult > 0)
                        pc = code[pc] as number - 1;
                    break;
                case OpCode.err:
                    throw new StackVmError(code[++pc] as string);
                default:
                    throw new StackVmError("Invalid opcode: " + OpCode[opcode]);
            }
        }

        // Pop stack frame
        this.varStack.pop();
        // Return the value on the stack
        return this.pop();
    }

    private callFunction(fnName: string): number | string {
        if (typeof fnName !== "string") throw new StackVmError("Invalid function call");

        const fn = this.functions[fnName];
        if (!fn) throw new StackVmError("Unknown function: " + fnName);

        if (typeof fn === "function") return fn(this.stack);
        else return this.runFrame(fn);
    }

    /**
     * Compares two number and returns -1 if first less than second, 1 if greater, 0 if equal.
     * @param topOfStack Number on top of the stack
     * @param value Value to compare. If a string it will assume it's a variable and use its value.
     */
    private compare(topOfStack: number, value: string | number): number {
        if (typeof value === "string") {
            value = this.getVariable(value);
        }
        return topOfStack < <number>value ? -1 : topOfStack > <number>value ? 1 : 0;
    }

    private setVariable(name: string, value?: number) {
        if (typeof name !== "string") throw new StackVmError("Undefined variable name");
        // Set variable in the current stack frame
        const v = value ?? this.peek();
        this.varStack[this.varStack.length - 1][name] = v;
    }

    private getVariable(name: string): number | string {
        if (typeof name !== "string") throw new StackVmError("Undefined variable name");

        // Walk up the stack frames to find the variable
        let val: number | string;
        for (let i = this.varStack.length - 1; i >= 0 && val == null; i--) {
            val = this.varStack[i][name];
        }

        if (val == null) throw new StackVmError("Unknown variable: " + name);
        return val;
    }

    /**
     * Pops the number off the top of the stack.
     * @throws If the stack is empty
     */
    private pop(): number {
        const v = this.stack.pop() as number;
        if (v == null) throw new StackVmError("Stack empty");
        return v;
    }

    /**
     * Gets the number off the top of the stack without removing it.
     * @param offset Offset from top of stack, default is 0.
     * @throws If the stack is empty or offset too large
     */
    private peek(offset = 0): number {
        if (offset < 0) throw new StackVmError("Invalid peek offset: " + offset);
        const v = this.stack[this.stack.length - 1 - offset];
        if (v == null) throw new StackVmError("Stack empty");
        return v;
    }
}
