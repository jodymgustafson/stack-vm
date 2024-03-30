import { StackVmError } from "../stack-vm";
import { SystemFunctionsMap } from "./types";

/**
 * The system library that contains string functions.
 * 
 * str.compare: Compare two strings and return -1, 0 or 1
 *   stack: [s1:string, s2:string]
 * 
 * str.append(startStr:string, endStr:string): Appends two strings
 *   pushs "abc"
 *   pushs "def"
 *   call str.append
 *   // returns "abcdef"
 * 
 * str.sub(s:string, start:int, end:int): Returns a substring of a string
 *   pushs "abcdef"
 *   push 1
 *   push 4
 *   call str.sub
 *   // returns "bcd"
 * 
 * str.length: Returns the length of a string
 *   stack: [s:string]
 */
export const StackVmNativeStringLib: SystemFunctionsMap = {
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