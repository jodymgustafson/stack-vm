import { StackVM, OpCode } from "../src/stack-vm"
import { StackVmNativeMathLib } from "../src/stack-vm-math";

describe("When test core ops", () => {
  const vm = new StackVM(StackVmNativeMathLib, { x: 5 });

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

  it("should execute 2 * (3 + x)^2", () => {
    expect(vm.run([
      OpCode.push, 3,
      OpCode.get, "x",
      OpCode.add,
      OpCode.push, 2,
      OpCode.call, "pow",
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
      OpCode.call, "pow",
      OpCode.push, 10,
      OpCode.get, "x",
      OpCode.div,
      OpCode.add,
      OpCode.get, "x",
      OpCode.sub,
    ]))
      .toBe(97);
  });

  it("should execute bitwise and", () => {
    expect(vm.run([
      OpCode.push, 0b101010,
      OpCode.push, 0b011110,
      OpCode.and,
    ]))
      .toBe(0b001010);
  });

  it("should execute bitwise or", () => {
    expect(vm.run([
      OpCode.push, 0b101010,
      OpCode.push, 0b011110,
      OpCode.or,
    ]))
      .toBe(0b111110);
  });

  it("should execute bitwise xor", () => {
    expect(vm.run([
      OpCode.push, 0b101010,
      OpCode.push, 0b011110,
      OpCode.xor,
    ]))
      .toBe(0b110100);
  });

  it("should execute bitwise not", () => {
    expect(vm.run([
      OpCode.push, 0b101010,
      OpCode.not,
    ]))
      .toBe(~0b101010);
  });

  it("should execute bitwise shift left", () => {
    expect(vm.run([
      OpCode.push, 0b101010,
      OpCode.shlc, 2
    ]))
      .toBe(0b101010 << 2);
  });

  it("should execute bitwise shift right", () => {
    expect(vm.run([
      OpCode.push, 0b101010,
      OpCode.shrc, 2
    ]))
      .toBe(0b101010 >> 2);
  });

  it("should set a variable from stack", () => {
    expect(vm.run([
      OpCode.push, 2,
      OpCode.put, "x",
      OpCode.get, "x",
    ]))
      .toBe(2);
  });

  it("should set a variable to a constant", () => {
    expect(vm.run([
      OpCode.putc, "x", 3,
      OpCode.get, "x",
    ]))
      .toBe(3);
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
