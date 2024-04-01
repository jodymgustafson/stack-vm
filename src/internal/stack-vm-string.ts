import { StackVmError } from "../stack-vm";
import { SystemFunctionsMap } from "./types";

/**
 * The system library that contains string functions.
 * 
 * str.compare: Compare two strings and return -1, 0 or 1
 *   stack: [s1:string, s2:string]
 * 
 * str.concat(startStr:string, endStr:string): Concatenates two strings
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
 * str.length(s:string): Returns the length of a string
 *   pushs "abcdef"
 *   call str.length
 *   // returns 6
 * 
 * str.parseNumber(s:string): Parses a string to a number
 * 
 * str.toString(n:number): Converts a number to a string
 */
export const StackVmSystemStringLib: SystemFunctionsMap = {
    "str.compare": s => {
        const b = s.pop();
        const a = s.pop();
        if (!(typeof a === "string" && typeof b === "string"))
            throw new StackVmError("Parameters to str.compare must be of type string");
        return a < b ? -1 : a > b ? 1 : 0;
    },
    "str.concat": s => {
        const a = s.pop() as string;
        return s.pop() + a;
    },
    "str.sub": s => {
        const end = s.pop() as number;
        const start = s.pop() as number;
        const str = s.pop() as string;
        return str.slice(start, end);
    },
    "str.length": s => (s.pop() as string).length,
    "str.parseNumber": s => parseFloat(s.pop() as string),
    "str.toString": s => s.pop().toString(),
};