import { FunctionsMap, NativeFunctionsMap, OpCode, StackVmFunctionsMap } from "./stack-vm";

export const StackVmNativeMathLib: NativeFunctionsMap = {
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
    round: s => Math.round(s.pop()),
    sin: s => Math.sin(s.pop()),
    sinh: s => Math.sinh(s.pop()),
    sqrt: s => Math.sqrt(s.pop()),
    tan: s => Math.tan(s.pop()),
    tanh: s => Math.tanh(s.pop()),

    pi: () => Math.PI,
    e: () => Math.E,
}

// const StackVmMathConstants: StackVmFunctionsMap = {
//     pi: [OpCode.push, Math.PI],
//     e: [OpCode.push, Math.E],
// }

// export const StackVmMathLib: FunctionsMap = {
//     ...StackVmMathConstants,
//     ...StackVmNativeMathLib,
// }