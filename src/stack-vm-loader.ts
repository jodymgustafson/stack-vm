import * as fs from "fs";
import YAML from 'yaml';
import { StackVM } from "./stack-vm";
import path from "path";
import { StackVmAssembler } from "./stack-vm-assembler";
import { StackVmFunctionsMap } from "./stackvm-types";

export class StackVmLoaderError extends Error {
}

type StackVmFunction = {
    name: string;
    description: string;
    definition: string;
};

export type StackVmPackage = {
    name: string;
    description: string;
    version: string;
    functions: StackVmFunction[];
};

export type StackVmFile = {
    stackvm: {
        version: string;
        package?: StackVmPackage
        import?: string[];
    }
};

/**
 * Loads a program from a YAML file
 */
export class StackVmLoader {
    constructor(readonly assembler = new StackVmAssembler()) {}

    /**
     * Loads the program from a YAML file and returns a map of assembled functions ready to be used by the VM.
     * @returns The contents of the file as a StackVmFile object
     */
    loadSync(filePath: string, functions: StackVmFunctionsMap = {}): StackVmFunctionsMap {
        const s = fs.readFileSync(filePath, "utf-8");
        const content = YAML.parse(s) as StackVmFile;
        if (!content.stackvm) throw new StackVmLoaderError("File does not conform to StackVM format");

        if (content.stackvm.import) {
            const base = path.dirname(filePath);
            for (const dep of content.stackvm.import) {
                this.loadSync(path.join(base, dep), functions);
            }
        }

        if (content.stackvm.package) {
            for (const fn of content.stackvm.package.functions) {
                const asm = this.assembler.assemble(fn.definition);
                functions[fn.name] = asm;
            }
        }

        return functions;
    } 
}