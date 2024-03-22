import * as fs from "fs";
import YAML from 'yaml';

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
    }
};

export class StackVmFileLoader {
    constructor(readonly filePath: string) {}

    loadSync(): StackVmFile {
        const s = fs.readFileSync(this.filePath, "utf-8");
        const content = YAML.parse(s);
        if (!content.stackvm) throw new StackVmLoaderError("File does not conform to StackVM format");
        return content;
    } 
}