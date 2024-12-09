import { ConsoleSystemFunctions } from "./src/internal/sys/console";
import { MathSystemFunctions } from "./src/internal/sys/math";
import { StringSystemFunctions } from "./src/internal/sys/string";
import { StackVM, StackVmError } from "./src/stackvm";
import { StackVmAssemblerError } from "./src/stackvm-assembler";
import { StackVmLoader } from "./src/stackvm-loader";
import { LoggerFn, StackVmConfig, StackVmFunctionsMap } from "./src/stackvm-types";

export { 
    StackVmLoader,
    StackVmError,
    StackVmConfig,
    StackVM,
    StackVmAssemblerError,
    StackVmFunctionsMap,
    LoggerFn
};

/**
 * Gets a default StackVM instance with system functions and the specified user functions
 * @param userFns Map of function names to their StackVM code
 * @param stackLogger An optional logger for debugging the stack
 * @param instrLogger An optional logger for debugging instructions
 * @returns An instance of a StackVM
 */
export function getStackVM(userFns: StackVmFunctionsMap, stackLogger?: LoggerFn, instrLogger?: LoggerFn): StackVM {
    return new StackVM({
        functions: { ...userFns, ...MathSystemFunctions, ...StringSystemFunctions, ...ConsoleSystemFunctions },
        stackLogger,
        instructionLogger: instrLogger
    });
}
