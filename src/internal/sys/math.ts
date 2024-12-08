import { SystemFunctionsMap } from "../types";

/**
 * The system library that contains math functions.
 */
export const MathSystemFunctions: SystemFunctionsMap = {
    abs: s => Math.abs(s.pop() as number),
    acos: s => Math.acos(s.pop() as number),
    acosh: s => Math.acosh(s.pop() as number),
    asin: s => Math.asin(s.pop() as number),
    asinh: s => Math.asinh(s.pop() as number),
    atan: s => Math.atan(s.pop() as number),
    atanh: s => Math.atanh(s.pop() as number),
    ceil: s => Math.ceil(s.pop() as number),
    cos: s => Math.cos(s.pop() as number),
    cosh: s => Math.cosh(s.pop() as number),
    exp: s => Math.exp(s.pop() as number),
    floor: s => Math.floor(s.pop() as number),
    ln: s => Math.log(s.pop() as number),
    log: s => Math.log(s.pop() as number),
    log10: s => Math.log10(s.pop() as number),
    pow: s => { const exp = s.pop() as number as number; return s.pop() as number as number ** exp; },
    rand: s => Math.random(),
    round: s => Math.round(s.pop() as number),
    sin: s => Math.sin(s.pop() as number),
    sinh: s => Math.sinh(s.pop() as number),
    sqrt: s => Math.sqrt(s.pop() as number),
    tan: s => Math.tan(s.pop() as number),
    tanh: s => Math.tanh(s.pop() as number),

    pi: () => Math.PI,
    e: () => Math.E,
}
