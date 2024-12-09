import * as fs from "fs";
import YAML from 'yaml';
import path from "path";
import { StackVmAssembler } from "./stackvm-assembler";
import { StackVmFile, StackVmFunctionsMap } from "./stackvm-types";

/** An error thrown by StackVmLoader */
export class StackVmLoaderError extends Error {
}

/**
 * Loads a program from a YAML file
 */
export class StackVmLoader {
    constructor(readonly assembler = new StackVmAssembler()) {}

    /**
     * Loads a YAML file and compiles the functions contained therein.
     * @param filePath Path to the file to load
     * @param [functions={}] Optional map of functions to add loaded functions into
     * @returns The contents of the file compiled into a StackVmFunctionsMap that can be run by the VM
     * @throws StackVmLoaderError if the file is not in the correct format
     */
    loadAndCompileSync(filePath: string, functions: StackVmFunctionsMap = {}): StackVmFunctionsMap {
        const content = this.loadFileSync(filePath);

        if (content.stackvm.functions) {
            for (const fn of content.stackvm.functions) {
                const vmCode = this.assembler.assemble(fn.definition);
                if (functions[fn.name]) {
                    throw new StackVmLoaderError(`Function "${fn.name}" would be overwritten by definition in "${path.resolve(filePath)}"`)
                }
                functions[fn.name] = vmCode;
            }
        }

        if (content.stackvm.import) {
            const base = path.dirname(filePath);
            for (const dep of content.stackvm.import) {
                this.loadAndCompileSync(path.join(base, dep), functions);
            }
        }

        return functions;
    } 

    /**
     * Loads a YAML file into a StackVmFile object
     * @param filePath Path to the file to load
     * @returns A StackVmFile object
     * @throws StackVmLoaderError if the file is not in the correct format
     */
    loadFileSync(filePath: string): StackVmFile {
        const s = fs.readFileSync(filePath, "utf-8");
        const content = YAML.parse(s) as StackVmFile;
        if (!content.stackvm) throw new StackVmLoaderError(`Error loading file "${filePath}": File does not conform to StackVM format`);
        return content;
    }
}