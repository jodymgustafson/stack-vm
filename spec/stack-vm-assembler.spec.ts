import { StackVmAssembler } from "../src/stack-vm-assembler"
import { OpCode } from "../src/stack-vm";

describe("When assemble code", () => {
    const assembler = new StackVmAssembler();

    describe("and uses numbers with different bases", () => {
        it("should parse hex numbers", () => {
            const prog = assembler.assemble([
                "push $23"
            ]);
            expect(assembler["instructions"]).toEqual([
                { opcode: OpCode.push, value: 0x23, line: 0 },
            ]);
        });
        it("should parse binary numbers", () => {
            const prog = assembler.assemble([
                "push %10101010"
            ]);
            expect(assembler["instructions"]).toEqual([
                { opcode: OpCode.push, value: 0b10101010, line: 0 },
            ]);
        });
        it("should parse decimal numbers", () => {
            const prog = assembler.assemble([
                "push 32"
            ]);
            expect(assembler["instructions"]).toEqual([
                { opcode: OpCode.push, value: 32, line: 0 },
            ]);
        });
    });

    describe("and has no branches", () => {
        it("should create bytecode", () => {
            const prog = assembler.assemble([
                "# Test program",
                "",
                "start: # start here",
                "  push 2  # push 2",
                "  push 3  # push 3",
                "  add     # add them",
            ]);
            expect(assembler["instructions"]).toEqual([
                { opcode: OpCode.push, value: 2, line: 3 },
                { opcode: OpCode.push, value: 3, line: 4 },
                { opcode: OpCode.add, value: undefined, line: 5 },
            ]);
            expect(prog).toEqual([OpCode.push, 2, OpCode.push, 3, OpCode.add]);
        });    
    });

    describe("and has quoted strings", () => {
        it("should parse strings", () => {
            const prog = assembler.assemble([
                `  pushs "this-string"  # push 2
                   push 3  # push 3
                   add     # add them
                `
            ]);
            expect(assembler["instructions"]).toEqual([
                { opcode: OpCode.pushs, value: "this-string", line: 0 },
            ]);
            expect(prog).toEqual([OpCode.pushs, "this-string"]);
        });    
    });

    describe("and has branches", () => {
        it("should resolve labels", () => {
            const prog = assembler.assemble([
                "# Test program",
                "start:    # start here",
                " ",
                "  bra init",
                "  nop",
                "init:",
                "  push 3  # push 3",
                "  cmp     # compare to value on stack",
                "  blt lessthan # n < 3",
                "  beq isequal  # n == 3",
                "  push 1",
                "  add",
                "  bra end",
                "lessthan: # when less than 3 add 2",
                "  push 2",
                "  add",
                "  bra end",
                "isequal: # when equal to 3 add 3",
                "  push 3",
                "  add",
                "end:",
            ]);
            // console.log(JSON.stringify(assembler["instructions"]));
            expect(assembler["instructions"]).toEqual([
                { opcode: OpCode.bra, line: 3, label: "init"},
                { opcode: 0, line: 4, value: undefined },
                { opcode: OpCode.push, value: 3, line: 6 }, // init
                { opcode: OpCode.cmp, value: undefined, line: 7 },
                { opcode: OpCode.blt, line: 8, label: "lessthan" },
                { opcode: OpCode.beq, line: 9, label: "isequal" },
                { opcode: OpCode.push, value: 1, line: 10 },
                { opcode: OpCode.add, value: undefined, line: 11 },
                { opcode: OpCode.bra, line: 12, label: "end" },
                { opcode: OpCode.push, value: 2, line: 14 }, // lessthan
                { opcode: OpCode.add, value: undefined, line: 15 },
                { opcode: OpCode.bra, line: 16, label: "end" },
                { opcode: OpCode.push, value: 3, line: 18 }, // isequal
                { opcode: OpCode.add, value: undefined, line: 19 },
            ]);
            expect(prog).toEqual([
                OpCode.bra, 3,
                OpCode.nop,
                OpCode.push, 3, // init
                OpCode.cmp,
                OpCode.blt, 15,
                OpCode.beq, 20,
                OpCode.push, 1,
                OpCode.add,
                OpCode.bra, 23,
                OpCode.push, 2, // lessthan
                OpCode.add,
                OpCode.bra, 23,
                OpCode.push, 3, // isequal
                OpCode.add,
            ])
        });
    });

    describe("and has an opcode error", () => {
        it("should throw an error", () => {
            expect(() => assembler.assemble([
                "Test program",
            ]))
            .toThrowError("Error (line 1): Invalid opcode 'Test'");
        });
    });

    describe("and has an label error", () => {
        it("should throw an error", () => {
            expect(() => assembler.assemble(
                `start:
                  bra foo
                 bar:
                   end`
            ))
            .toThrowError("Error (line 2): Reference to unknown label 'foo'");
        });
    });
});
