/** Defines the stack used by the VM */
export type StackVmStack = { // number|string[];
    push(n: number | string): void;
    pop<T = number | string>(): T;
    length: number;
};

/** Defines a system function that runs in the host outside of StackVM */
export type SystemFunction = (stack: StackVmStack) => number | string;

/** Map of function names to system functions */
export type SystemFunctionsMap = Record<string, SystemFunction>;
