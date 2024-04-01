import { StackVM } from "../src/stack-vm";
import { OpCode } from "../src/stackvm-types";
import { StackVmSystemStringLib } from "../src/internal/stack-vm-string";

describe("When test calling string functions", () => {
    const vm = new StackVM({ functions: StackVmSystemStringLib });

    it("should call str.compare(a, b)", () => {
        expect(vm.run([
            OpCode.pushs, "a",
            OpCode.pushs, "b",
            OpCode.call, "str.compare",
        ]))
        .toBe(-1);
    });

    it("should call str.compare(b, a)", () => {
        expect(vm.run([
            OpCode.pushs, "b",
            OpCode.pushs, "a",
            OpCode.call, "str.compare",
        ]))
        .toBe(1);
    });

    it("should call str.compare(a, a)", () => {
        expect(vm.run([
            OpCode.pushs, "a",
            OpCode.pushs, "a",
            OpCode.call, "str.compare",
        ]))
        .toBe(0);
    });
});