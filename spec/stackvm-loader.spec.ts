import path from "path";
import { StackVmLoader, StackVmLoaderError } from "../src/stackvm-loader"

describe("When use loader", () => {
    const loader = new StackVmLoader();

    it("should read the file", () => {
        const fns = loader.loadFileSync("./spec/files/test.yml");
        expect(fns).toEqual({
            stackvm: {
                name: "Test File",
                version: "0.0.0",
                description: 'File for testing',
                import: [ './import.yml' ],
                functions: [{ name: 'main', description: 'Entry function', definition: 'start:\n  call test1\n  end\n' }]
            }
        });
    });

    it("should read and compile the file", () => {
        const fns = loader.loadAndCompileSync("./spec/files/test.yml");
        expect(fns).toEqual({
            test1: [ 1, 123, 7 ],
            main: [ 6, 'test1', 7 ]
        });
    });

    it("should get an error if the file doesn't exist", () => {
        expect(() => loader.loadAndCompileSync("./spec/files/foo.yml"))
            .toThrowError(`ENOENT: no such file or directory, open '${path.resolve("./spec/files/foo.yml")}'`);
    });

    it("should get an error if the file isn't in correct format", () => {
        expect(() => loader.loadAndCompileSync("./spec/files/bad.yml"))
        .toThrowError(`Error loading file "./spec/files/bad.yml": File does not conform to StackVM format`);
    });

    it("should get an error if the file contains duplicate functions", () => {
        expect(() => loader.loadAndCompileSync("./spec/files/test-bad.yml"))
        .toThrowError(`Function "test1" would be overwritten by definition in "${path.resolve("./spec/files/import.yml")}"`);
    });
});
