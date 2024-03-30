import { SystemFunctionsMap } from "./types";

/**
 * The system library that contains math functions.
 */
export const StackVmSystemMathLib: SystemFunctionsMap = {
    abs: s => Math.abs(s.pop()),
    acos: s => Math.acos(s.pop()),
    acosh: s => Math.acosh(s.pop()),
    asin: s => Math.asin(s.pop()),
    asinh: s => Math.asinh(s.pop()),
    atan: s => Math.atan(s.pop()),
    atanh: s => Math.atanh(s.pop()),
    ceil: s => Math.ceil(s.pop()),
    cos: s => Math.cos(s.pop()),
    cosh: s => Math.cosh(s.pop()),
    exp: s => Math.exp(s.pop()),
    floor: s => Math.floor(s.pop()),
    ln: s => Math.log(s.pop()),
    log: s => Math.log(s.pop()),
    log10: s => Math.log10(s.pop()),
    pow: s => { const exp = s.pop() as number; return s.pop() as number ** exp; },
    rand: s => Math.random(),
    round: s => Math.round(s.pop()),
    sin: s => Math.sin(s.pop()),
    sinh: s => Math.sinh(s.pop()),
    sqrt: s => Math.sqrt(s.pop()),
    tan: s => Math.tan(s.pop()),
    tanh: s => Math.tanh(s.pop()),

    pi: () => Math.PI,
    e: () => Math.E,
}
