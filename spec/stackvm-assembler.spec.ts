import { StackVmAssembler, StackVmAssemblerError } from "../src/stackvm-assembler"
import { OpCode } from "../src/stackvm-types";

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
                `start:  push "this string"  # push string
                `
            ]);
            expect(assembler["instructions"]).toEqual([
                { opcode: OpCode.push, value: "this string", line: 0 },
            ]);
            expect(prog).toEqual([OpCode.push, "this string"]);
        });    
    });

    describe("and has branches", () => {
        it("should resolve labels", () => {
            const prog = assembler.assemble([
                "# Test program",
                "s:    # start here",
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
        let err: StackVmAssemblerError;
        beforeAll(() => {
            try {
                assembler.assemble([
                    "Test program",
                ]);
            }
            catch (e) {
                err = e as StackVmAssemblerError;
            }    
        });

        it("should throw an error", () => {
            expect(err).toBeDefined();
            expect(err.message).toBe("There were 1 assembler errors");
        });
        it("should have error messages", () => {
            expect(err.errors).toEqual([
                { message: 'Invalid opcode "Test"', line: 0 }
            ]);
        });
    });

    describe("and has a label error", () => {
        let err: StackVmAssemblerError;
        beforeAll(() => {
            try {
                assembler.assemble(
                    `start:
                      bra foo
                     bar:
                       end`
                );
            }
            catch (e) {
                err = e as StackVmAssemblerError;
            }    
        });
        it("should throw an error", () => {
            expect(err).toBeDefined();
            expect(err.message).toBe("There were 1 assembler errors");
        });
        it("should have error messages", () => {
            expect(err.errors).toEqual([
                { message: 'Reference to unknown label "foo"', line: 1 }
            ]);
        });
    });

    describe("and has duplicate labels", () => {
        let err: StackVmAssemblerError;
        beforeAll(() => {
            try {
                assembler.assemble(
                    `start:
                        bra start
                    end:
                        bra end
                    start:
                        push 45.6
                    end:
                       end`
                );
            }
            catch (e) {
                err = e as StackVmAssemblerError;
            }    
        });
        it("should throw an error", () => {
            expect(err).toBeDefined();
            expect(err.message).toBe("There were 2 assembler errors");
        });
        it("should have error messages", () => {
            expect(err.errors).toEqual([
                { message: 'Duplicate label "start"', line: 4 },
                { message: 'Duplicate label "end"', line: 6 }
            ]);
        });
    });
});
