import { StackVmError } from "../../stackvm";
import { SystemFunctionsMap } from "../types";

/**
 * The system library that contains string functions.
 * 
 * str.compare: Compare two strings and return -1, 0 or 1
 *   push "abc"         # ["abc"]
 *   push "def"         # ["def"]
 *   call str.compare   # [-1]
 * 
 * str.concat(startStr:string, endStr:string): Concatenates two strings
 *   push "abc"         # ["abc"]
 *   push "def"         # ["def"]
 *   call str.append    # ["abcdef"]
 * 
 * str.sub(s:string, start:int, end:int): Returns a substring of a string
 *   push "abcdef"      # ["abcdef"]
 *   push 1             # ["abcdef", 1]
 *   push 4             # ["abcdef", 1, 4]
 *   call str.sub       # ["bcd"]
 * 
 * str.length(s:string): Returns the length of a string
 *   push "abcdef"      # ["abcdef"]
 *   call str.length    # [6]
 * 
 * str.parseNumber(s:string): Parses a string to a number
 *   push "123.45"      # ["123.45"]
 *   call str.length    # [123.45]
 * 
 * str.toString(n:number): Converts a number to a string
 *   push 123.45        # [123.45]
 *   call str.toString  # ["123.45"]
 */
export const StringSystemFunctions: SystemFunctionsMap = {
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
    "str.toString": s => s.pop()!.toString(),
};