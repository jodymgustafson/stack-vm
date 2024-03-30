import { StackVM, OpCode, FunctionsMap } from "../src/stack-vm"
import { StackVmNativeMathLib } from "../src/internal/stack-vm-math";

describe("When test calling functions", () => {
    const functions: FunctionsMap = {
        ...StackVmNativeMathLib,
        square: [ // number to square is on stack
            OpCode.put, "tmp", // put value into local variable
            OpCode.get, "tmp", // push it onto the stack
            OpCode.mul,
        ],
        // Recursive factorial function
        factorial: [ // number to factorial is on stack
            OpCode.cmpc, 0,
            OpCode.blt, 17,  // n < 0?
            OpCode.beq, 19,  // n == 0?
            OpCode.put, "_1", // save value
            OpCode.push, 1,
            OpCode.sub,  // n = n - 1
            OpCode.call, "factorial", // fact(n - 1)
            OpCode.get, "_1",
            OpCode.mul,  // n = n * fact(n - 1)
            OpCode.end,
            OpCode.err, "Invalid value", // n < 0 => error
            OpCode.push, 1,  // n == 0 => 1
        ],
    };
    const vm = new StackVM(functions, { x: 5 });

    it("should compute factorial: -1", () => {
        expect(() => vm.run([
            OpCode.push, -1,
            OpCode.call, "factorial",
        ]))
        .toThrowError("Invalid value");
    });

    it("should compute factorial: 0", () => {
        expect(vm.run([
            OpCode.push, 0,
            OpCode.call, "factorial",
        ]))
        .toBe(1);
    });

    it("should compute factorial: 1", () => {
        expect(vm.run([
            OpCode.push, 1,
            OpCode.call, "factorial",
        ]))
        .toBe(1);
    });

    it("should compute factorial: 2", () => {
        expect(vm.run([
            OpCode.push, 2,
            OpCode.call, "factorial",
        ]))
        .toBe(2);
    });

    it("should compute factorial: 3", () => {
        expect(vm.run([
            OpCode.push, 3,
            OpCode.call, "factorial",
        ]))
        .toBe(6);
    });

    it("should call sys.abs(-11)", () => {
        expect(vm.run([
            OpCode.push, -11,
            OpCode.call, "abs",
        ]))
        .toBe(Math.abs(-11));
    });

    it("should error when invalid function", () => {
        expect(() => vm.run([
            OpCode.push, 1,
            OpCode.call, "foo",
        ]))
        .toThrowError("Unknown function: foo")
    });
});
