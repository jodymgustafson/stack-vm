import { StackVmError } from "../stack-vm";
import { NativeFunctionsMap } from "./types";

/**
 * The native library that contains string functions.
 * 
 * str.compare: Compare two strings and return -1, 0 or 1
 *   stack: [s1:string, s2:string]
 * 
 * str.append: Appends two strings
 *   stack: [startStr:string, endStr:string]
 * 
 * str.sub: Returns a substring of a string
 *   stack: [s:string, start:int, end:int]
 * 
 * str.length: Returns the length of a string
 *   stack: [s:string]
 */
export const StackVmNativeStringLib: NativeFunctionsMap = {
    "str.compare": s => {
        const b = s.pop();
        const a = s.pop();
        if (!(typeof a === "string" && typeof b === "string"))
            throw new StackVmError("Parameters to str.compare must be of type string");
        return a < b ? -1 : a > b ? 1 : 0;
    },
    "str.append": s => {
        const a = s.pop() as string;
        return s.pop() + a;
    },
    "str.sub": s => {
        const end = s.pop() as number;
        const start = s.pop() as number;
        const str = s.pop() as string;
        return str.slice(start, end);
    },
    "str.length": s => (s.pop() as string).length
};