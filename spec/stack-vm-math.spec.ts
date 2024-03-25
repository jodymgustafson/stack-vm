import { StackVM, OpCode, FunctionsMap } from "../src/stack-vm"
import { StackVmNativeMathLib } from "../src/stack-vm-math";

describe("When test calling functions", () => {
    const vm = new StackVM(StackVmNativeMathLib, { x: 5 });

    it("should call abs(-11)", () => {
        expect(vm.run([
            OpCode.push, -11,
            OpCode.call, "abs",
        ]))
        .toBe(Math.abs(-11));
    });

    it("should call abs(1.23)", () => {
      expect(vm.run([
          OpCode.push, 1.23,
          OpCode.call, "abs",
      ]))
      .toBe(Math.abs(1.23));
  });

  it("should call acos(.23)", () => {
    expect(vm.run([
        OpCode.push, .23,
        OpCode.call, "acos",
    ]))
    .toBe(Math.acos(.23));
  });


  it("should execute x ^ 3", () => {
    expect(vm.run([
        OpCode.get, "x",
        OpCode.push, 3,
        OpCode.call, "pow",
    ]))
    .toBe(125);
});

    it("should call sin(-11)", () => {
        expect(vm.run([
            OpCode.push, -11,
            OpCode.call, "sin",
        ]))
        .toBe(Math.sin(-11));
    });

    it("should error when invalid sys call", () => {
        expect(() => vm.run([
            OpCode.push, 1,
            OpCode.call, "foo",
        ]))
        .toThrowError("Unknown function: foo")
    });

    it("should error when invalid call", () => {
        expect(() => vm.run([
            OpCode.push, 1,
            OpCode.call, "foo",
        ]))
        .toThrowError("Unknown function: foo")
    });

    it("should get pi", () => {
        expect(vm.run([
            OpCode.call, "pi",
        ]))
        .toBe(Math.PI);
    });
});
