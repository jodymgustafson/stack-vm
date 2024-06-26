import { StackVM } from "../src/stackvm"
import { FunctionsMap, OpCode } from "../src/stackvm-types";

describe("When test logic ops", () => {
    const functions: FunctionsMap = {
        // Returns -1, 0 or 1 based on last compare
        compare: [
            OpCode.blt, 7,
            OpCode.bgt, 10,
            OpCode.push, 0,
            OpCode.end,
            OpCode.push, -1,
            OpCode.end,
            OpCode.push, 1,
        ]
    };
    const vm = new StackVM({ functions, variables: { x: 5 } });

    it("should compare two values on stack greater than", () => {
        expect(vm.run([
            OpCode.push, 1,
            OpCode.push, 5,
            OpCode.cmp,
        ]))
        .toBe(1); // 5 > 1
    });

    it("should compare two values on stack less than", () => {
        expect(vm.run([
            OpCode.push, 6,
            OpCode.push, 5,
            OpCode.cmp,
        ]))
        .toBe(-1); // 5 < 6
    });

    it("should compare two values on stack are equal", () => {
        expect(vm.run([
            OpCode.push, 8,
            OpCode.push, 8,
            OpCode.cmp,
        ]))
        .toBe(0); // 8 == 8
    });

    it("should compare value on stack equal to a number", () => {
        expect(vm.run([
            OpCode.push, 7,
            OpCode.cmpc, 7,
            OpCode.call, "compare",
        ]))
        .toBe(0); // 7 == 7
    });

    it("should compare value on stack less than a number", () => {
        expect(vm.run([
            OpCode.push, 4,
            OpCode.cmpc, 7,
            OpCode.call, "compare",
        ]))
        .toBe(-1); // 4 < 7
    });

    it("should compare value on stack greater than a number", () => {
        expect(vm.run([
            OpCode.push, 9,
            OpCode.cmpc, 7,
            OpCode.call, "compare",
        ]))
        .toBe(1); // 9 > 7
    });

    it("should compare value on stack equal to a variable", () => {
        expect(vm.run([
            OpCode.push, 5,
            OpCode.cmpv, "x",
            OpCode.call, "compare",
        ]))
        .toBe(0);
    });

    it("should compare value on stack less than a variable", () => {
        expect(vm.run([
            OpCode.push, 3,
            OpCode.cmpv, "x",
            OpCode.call, "compare",
        ]))
        .toBe(-1);
    });

    it("should compare value on stack greater than a variable", () => {
        expect(vm.run([
            OpCode.push, 8,
            OpCode.cmpv, "x",
            OpCode.call, "compare",
        ]))
        .toBe(1);
    });
});
