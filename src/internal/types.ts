/** The stack used by the VM */
export type StackVmStack = { // number|string[];
    push(n: number | string): void;
    pop<T = number | string>(): T;
    length: number;
};

/** Defines a native function that runs in the host outside of StackVM */
export type NativeFunction = (stack: StackVmStack) => number | string;

/** Map of function names to native functions */
export type NativeFunctionsMap = Record<string, NativeFunction>;
