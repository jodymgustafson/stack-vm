import * as fs from "fs";
import YAML from 'yaml';
import { StackVM } from "./stack-vm";

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
        depends?: string[];
    }
};

/**
 * Loads a program from a YAML file
 */
export class StackVmLoader {
    // constructor(readonly vm: StackVM) {}

    /**
     * Loads the program from a YAML file
     * @returns The contents of the file as a StackVmFile object
     */
    loadSync(filePath: string): StackVmFile {
        const s = fs.readFileSync(filePath, "utf-8");
        const content = YAML.parse(s) as StackVmFile;
        if (!content.stackvm) throw new StackVmLoaderError("File does not conform to StackVM format");

        if (content.stackvm.depends) {
            for (const dep of content.stackvm.depends) {

            }
        }

        if (content.stackvm.package) {
        }

        return content;
    } 
}