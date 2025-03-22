# StackVM

StackVM is a virtual machine that uses a stack for optimized computation of mathematical expressions. It also supports strings and logical operations to build simple programs.

## Operations

### Stack
- push n: Push a value on the stack
- pop: Pop the value off the top of the stack and discard
- get x: Push a variable's value on top of the stack
- put x: Set a variable's value to the value on top of the stack
- putc x, n: Set a variable's value to the specified constant value

### Math
- add: Pop two numbers off the stack, add them, push the result (s0=s1+s0)
- sub: Pop two numbers off the stack, subtract them, push the result (s0=s1-s0)
- mul: Pop two numbers off the stack, multiply them, push the result (s0=s1*s0)
- div: Pop two numbers off the stack, divide them, push the result (s0=s1/s0)

### Bitwise
- and: Pop two numbers off the stack, and them, push the result (s0=s1 & s0)
- or: Pop two values off the stack, or them, push the result (s0=s1 | s0)
- xor: Pop two numbers off the stack, xor them, push the result (s0=s1 ^ s0)
- not: Pop a number off the stack, flip the bits, push the result (s0=~s0)
- shlc n: Pop a number off the stack, shift the bits the specified amount left, push the result (s0=s0 << n)
- shrc n: Pop a number off the stack, shift the bits the specified amount right, push the result (s0=s0 >> n)

### Logic
- cmp: Pop two numbers off the stack, compare them, push the result
- cmpc n: Compares number on top of the stack to a constant number
- cmpv x: Compares number on top of the stack to the value of a variable
- bra x: Branches to a label
- beq x: Branch to a label if a previous compare evaluated to equal
- bne x: Branch to a label if a previous compare evaluated to not equal
- blt x: Branch to a label if a previous compare evaluated to less than
- bgt x: Branch to a label if a previous compare evaluated to greater than

### Misc
- call x: Calls a subroutine
- err x: Throws an error with a message
- end: Ends a function

## Format

- One line of code can contain
  - zero or one label
  - zero or one OpCode
  - zero or one number or string argument for the OpCode
  - zero or one comment

### Valid lines of code

    # Tests a random number
    start:  call rand  # push a random number between 0 and 1
            push .5
            cmp        # compare random number to .5
            blt isLess
    isGreater:         # if greater return 1
            push 1
            bra end
    isLess: push -1    # if less return -1
    end:    end

### Number Format
Numbers can be entered in decimal, hexadecimal or binary.

- Decimal: 123.45
- Hexadecimal: $1A2BF
- Binary: %10110101

### Strings
Strings are defined using double quotes.

    push "This is a string"

### Comments
Anything on a line after a hash # is ignored.

    # This whole line is a comment
    push 3  # This is a comment

### Labels
Use labels for branching. Labels must start with a letter or underscore and end with a colon.
Examples:

    start:
    _isLessThan:
    branch1:

## Example code showing stack

2 * (3 + x)^2

    # op    | stack
    push 3  # [3]
    get  x  # [3,1] where x=1
    add     # [4]
    push 2  # [4,2]
    pow     # [16]
    push 2  # [2,16]
    mul     # [32]
    end

## System Functions
There are built in system functions for basic mathematical and string functions. These can be called using the `call` operation.

sin(pi/2)

    # pi is a sys function that pushes the value of PI on the stack
    call pi  # [3.14156]
    push 2   # [3.14156, 2]
    div      # [1.5707]
    call sin # [1]
    end

There is also a string library.

    push "abc"       # ["abc"]
    push "def"       # ["abc", "def"]
    call str.concat  # ["abcdef"]

You can interact with the command line using the console system functions.

    call readln   # waits for user to enter text, text is on top of stack
    call writeln  # writes the value on top of the stack to command line

## User Defined Functions
User defined functions are programs within themselves that may accept parameters on the stack.

    # Converts fahrenheit to celsius c = (f - 32) * 5 / 9
    # Top of stack is the number to convert to celsius
    push 32
    sub      # r = f - 32
    push 5
    mul      # r = r * 5
    push 9
    div      # r = r / 9
    end

## VM Code
The instructions sent to the VM are a stream of numbers that represent OpCodes followed by zero or one number or string arguments.
```
[
    OpCode, (string|number)?, ...
]
```

Example:

```
[ 1,3, 1,2, 8, 4,"x", 5,"factorial", 8 ]
```

With opcodes:
```
[
    push, 3,
    push, 2,
    mul,
    put, "x",
    call, "factorial"
    end
]
```

## Run a program from command line
To run a StackVM program from the command line use stackvm.js.
The program must have an entry function named `main`.

    node dist/stackvm.js "path/to/file.yml" [-si]

### Flags:
    Use -s to log stack debugging
    Use -i to log instructions debugging
    Use -si to log both

## StackVM Loader
If you want to create your own app that loads and runs StackVM files use the StackVM loader.
The loader reads a YAML file that contains assembly code and compiles it into a map of functions that can be executed by the VM.

    const userFns = new StackVmLoader().loadAndCompileSync(filePath);
    const vm = getStackVM(userFns);
    const result = vm.run();

The file must start with `stackvm` and can define functions and import functions from other files.

For a program to run it must have a `main` function defined. This will be the function called to start the program.

Example:
```yaml
stackvm:
  version: "0.0.0"
  name: Temp_Convert
  description: Program to convert temperature between celsius and fahrenheit
  import:
  - ./metric-convert.yml
  functions:
  - name: main
    description: Entry function
    definition: |
      start:
      #...
```

## StackVM Assembler
If you want to run programs from any program defined in a string use the assembler.
The assembler takes assembly code and compiles it into VM code that can be run by the VM.

To get an instance of the VM initialized with the StackVM built in system functions call the getStackVM() function.
You can pass in any user defined functions.
Then call the VM's run() method passing in the code to execute.
If you don't give it code to execute it will look for a function named `main` and execute that.

    const assembler = new StackVmAssembler();
    const vmCode = assembler.assemble(asm);
    const vm = getStackVM(vmCode);
    const result = vm.run();

## Run the assembler from command line
If you want to only run the assembler and see the output use asm.js.

    node dist/asm.js "path/to/file.yml" [-f][-d]

### Flags:
    Use -f to format output
    Use -d to log debugging info (line numbers and opcode names)
