// export type OpCodeNames = "push" | "pop" | "add" | "sub" | "mul" | "div"| "pow" | "call" | "get" | "put" | "end";

export enum OpCode {
    noop = 0,
    push,
    pop,
    get,
    put,
    put_n,
    call,
    end,
    err,
    add,
    sub,
    mul,
    div,
    pow,
    cmp,
    cmp_n,
    cmp_x,
    bra,
    beq,
    bne,
    blt,
    bgt,
}

export type StackVmStack = { //number[];
    push(n: number): void;
    pop(): number;
    length: number;
};

/** Defines a StackVM item in the stream */
export type StackVmAtom = OpCode | number | string;

/** Defines a set of instructions, aka a function */
export type StackVmCode = StackVmAtom[];

/** Map of variable names to values */
export type VariablesMap = Record<string, number>;

/** Map of function names to their StackVM code */
export type StackVmFunctionsMap = Record<string, StackVmCode>;

/** Defines a native function that runs in the host outside of StackVM */
export type NativeFunction = (stack: StackVmStack) => number;

/** Map of function names to native functions */
export type NativeFunctionsMap = Record<string, NativeFunction>;

export type FunctionsMap = Record<string, NativeFunction | StackVmCode>;

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

    /**
     * @param functions Global functions map
     * @param globalVars Global variables
     */
    constructor(readonly functions: FunctionsMap, globalVars?: VariablesMap) {
        if (globalVars) {
            this.varStack.push(globalVars);
        }
    }

    /**
     * Runs the specified set of instructions
     * @param code Code to run
     * @returns The value on top of the stack when the code finishes
     */
    run(code: StackVmCode): number {
        // Always start with an empty stack
        this.stack = [];
        return this.runFrame(code);
    }
    
    /**
     * Runs the specified set of instructions in a new context
     * @param code Code to run
     * @returns The value on top of the stack when the code finishes
     */
    private runFrame(code: StackVmCode): number {
        // Push a new variables context
        this.varStack.push({});

        let tmp: number;    
        for (let pc = 0; pc < code.length; pc++) {
            const opcode = code[pc];
            // Noop does nothing
            if (opcode === OpCode.noop) continue;
            // End immediately breaks out of the loop
            if (opcode === OpCode.end) break;

            switch (opcode) {
                case OpCode.push: this.stack.push(this.getValue(code[++pc])); break;
                case OpCode.pop: this.pop(); break;
                case OpCode.get:
                    tmp = this.getVariable(code[++pc] as string);
                    this.stack.push(tmp);
                    break;
                case OpCode.put:
                    this.setVariable(code[++pc] as string, this.peek());
                    break;
                case OpCode.put_n:
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
                case OpCode.pow:
                    tmp = this.pop();
                    this.stack.push(Math.pow(this.stack.pop(), tmp));
                    break;
                case OpCode.cmp:
                    this.compareResult = this.compare(this.pop(), this.pop());
                    this.stack.push(this.compareResult);
                    break;
                case OpCode.cmp_n:
                    this.compareResult = this.compare(this.peek(), code[++pc]);
                    break;
                case OpCode.cmp_x:
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

    private callFunction(fnName: string): number {
        if (typeof fnName !== "string") throw new StackVmError("Invalid function call");

        const fn = this.functions[fnName];
        if (!fn) throw new StackVmError("Unknown function: " + fnName);

        if (typeof fn === "function") return fn(this.stack);
        else return this.runFrame(fn);
    }

    private compare(topOfStack: number, value: string | number): number {
        if (typeof value === "string") {
            value = this.getVariable(value);
        }
        return topOfStack < value ? -1 : topOfStack > value ? 1 : 0;
    }

    private setVariable(name: string, value?: number) {
        if (typeof name !== "string") throw new StackVmError("Undefined variable name");
        // Set variable in the current stack frame
        const v = value ?? this.peek();
        this.varStack[this.varStack.length - 1][name] = v;
    }

    private getVariable(name: string): number {
        if (typeof name !== "string") throw new StackVmError("Undefined variable name");

        // Walk up the stack frames to find the variable
        let val: number;
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
        const v = this.stack.pop();
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

    private getValue(value: string | number): number {
        // Must be a number
        if (typeof value !== "number") {
            throw new StackVmError("Value must be a number: " + value);
        }
        return value;
    }
}
