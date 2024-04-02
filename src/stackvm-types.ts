import { SystemFunction } from "./internal/types";

/** Op codes supported by the VM */
export enum OpCode {
    nop = 0,
    push,
    pop,
    get,
    put,
    putc,
    call,
    end,
    err,
    add,
    sub,
    mul,
    div,
    cmp,
    cmpc,
    cmpv,
    bra,
    beq,
    bne,
    blt,
    bgt,
    and,
    or,
    xor,
    not,
    shlc,
    shrc
}

/** Defines a StackVM item in the stream */
export type StackVmAtom = OpCode | number | string;

/** Defines a set of instructions, aka a function */
export type StackVmCode = StackVmAtom[];

/** Map of variable names to values */
export type VariablesMap = Record<string, number | string>;

/** Map of function names to their StackVM code */
export type StackVmFunctionsMap = Record<string, StackVmCode>;

/** Map of all system and user functions */
export type FunctionsMap = Record<string, SystemFunction | StackVmCode>;

export type LoggerFn = (...s) => void;

/** The config for creating a new VM */
export type StackVmConfig = {
    /** Map of functions */
    functions?: FunctionsMap;
    /** Global variables */
    variables?: VariablesMap;
    /** A function to log stack debugging info */
    stackLogger?: LoggerFn;
    /** A function to log instruction debugging info */
    instructionLogger?: LoggerFn;
};

/** A function definition in a StackVM file */
export type StackVmFunction = {
    /** Name of the function */
    name: string;
    /** Description of the function */
    description: string;
    /** Assembly code of the function */
    definition: string;
};

/** The format of a StackVM file */
export type StackVmFile = {
    stackvm: {
        /** StackVM version the file was created for */
        version: string;
        /** Name of the package */
        name: string;
        /** Description of the package */
        description?: string;
        /** Array of any files to import */
        import?: string[];
        /** Array of function definitions */
        functions: StackVmFunction[];
    }
};
