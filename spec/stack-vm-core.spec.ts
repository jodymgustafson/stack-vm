import { StackVM, OpCode } from "../src/stack-vm"

describe("When test core ops", () => {
    const vm = new StackVM({}, { x: 5 });

    it("should push 0", () => {
        expect(vm.run([
            OpCode.push, 0,
        ]))
        .toBe(0);
    });

    it("should push 3", () => {
        expect(vm.run([
            OpCode.push, 3,
        ]))
        .toBe(3);
    });

    it("should get x", () => {
        expect(vm.run([
            OpCode.get, "x",
        ]))
        .toBe(5);
    });

    it("should execute x + 3", () => {
        expect(vm.run([
            OpCode.get, "x",
            OpCode.push, 3,
            OpCode.add,
        ]))
        .toBe(8);
    });

    it("should execute x - 3", () => {
        expect(vm.run([
            OpCode.get, "x",
            OpCode.push, 3,
            OpCode.sub,
        ]))
        .toBe(2);
    });

    it("should execute x * 3", () => {
        expect(vm.run([
            OpCode.get, "x",
            OpCode.push, 3,
            OpCode.mul,
        ]))
        .toBe(15);
    });

    it("should execute x / 2", () => {
        expect(vm.run([
            OpCode.get, "x",
            OpCode.push, 2,
            OpCode.div,
        ]))
        .toBe(2.5);
    });

    it("should execute x ^ 3", () => {
        expect(vm.run([
            OpCode.get, "x",
            OpCode.push, 3,
            OpCode.pow,
        ]))
        .toBe(125);
    });

    it("should execute 2 * (3 + x)^2", () => {
        expect(vm.run([
            OpCode.push, 3,
            OpCode.get, "x",
            OpCode.add,
            OpCode.push, 2,
            OpCode.pow,
            OpCode.push, 2,
            OpCode.mul,
        ]))
        .toBe(128);
    });

    it("should execute (2 * x)^2 + (10 / x) - x", () => {
        expect(vm.run([
            OpCode.push, 2,
            OpCode.get, "x",
            OpCode.mul,
            OpCode.push, 2,
            OpCode.pow,
            OpCode.push, 10,
            OpCode.get, "x",
            OpCode.div,
            OpCode.add,
            OpCode.get, "x",
            OpCode.sub,
        ]))
        .toBe(97);
    });

    it("should error when unknown variable", () => {
        expect(() => vm.run([
            OpCode.get, "foo",
        ]))
        .toThrowError("Unknown variable: foo");
    });

    it("should error when unbalanced stack", () => {
        expect(() => vm.run([
            OpCode.push, 3,
            OpCode.add,
        ]))
        .toThrowError("Stack empty");
    });
});
