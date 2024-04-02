import { StackVM } from "../src/stack-vm";
import { OpCode } from "../src/stackvm-types";
import { StackVmSystemStringLib } from "../src/internal/stack-vm-string";

describe("When test calling string functions", () => {
    const vm = new StackVM({ functions: StackVmSystemStringLib });

    it("should call str.compare(a, b)", () => {
        expect(vm.run([
            OpCode.push, "a",
            OpCode.push, "b",
            OpCode.call, "str.compare",
        ]))
        .toBe(-1);
    });

    it("should call str.compare(b, a)", () => {
        expect(vm.run([
            OpCode.push, "b",
            OpCode.push, "a",
            OpCode.call, "str.compare",
        ]))
        .toBe(1);
    });

    it("should call str.compare(a, a)", () => {
        expect(vm.run([
            OpCode.push, "a",
            OpCode.push, "a",
            OpCode.call, "str.compare",
        ]))
        .toBe(0);
    });

    it("should call str.concat(abc, def)", () => {
        expect(vm.run([
            OpCode.push, "abc",
            OpCode.push, "def",
            OpCode.call, "str.concat",
        ]))
        .toBe("abcdef");
    });

    it("should call str.sub(abcdef, 1, 4)", () => {
        expect(vm.run([
            OpCode.push, "abcdef",
            OpCode.push, 1,
            OpCode.push, 4,
            OpCode.call, "str.sub",
        ]))
        .toEqual("bcd");
    });

    it("should call str.length(abcdef)", () => {
        expect(vm.run([
            OpCode.push, "abcdef",
            OpCode.call, "str.length",
        ]))
        .toEqual(6);
    });

    it("should call str.parseNumber(123.45)", () => {
        expect(vm.run([
            OpCode.push, "123.45",
            OpCode.call, "str.parseNumber",
        ]))
        .toEqual(123.45);
    });

    it("should call str.toString(123.45)", () => {
        expect(vm.run([
            OpCode.push, 123.45,
            OpCode.call, "str.toString",
        ]))
        .toEqual("123.45");
    });
});