# StackVM

Virtual machine that uses a stack for optimized computation of mathematical expressions. 

## Operations

### Stack
- push n: Push a numeric value on the stack
- pop: Pop the value off the top of the stack and discard
- get x: Push a variable's value on top of the stack
- put x: Set a variable's value to the number on top of the stack
- putc x, n: Set a variable's value to the specified constant number

### Math
- add: Pop two values off the stack, add them, push the result (s0=s1+s0)
- sub: Pop two values off the stack, subtract them, push the result (s0=s1-s0)
- mul: Pop two values off the stack, multiply them, push the result (s0=s1*s0)
- div: Pop two values off the stack, divide them, push the result (s0=s1/s0)

### Bitwise
- and: Pop two values off the stack, and them, push the result (s0=s1 & s0)
- or: Pop two values off the stack, or them, push the result (s0=s1 | s0)
- xor: Pop two values off the stack, xor them, push the result (s0=s1 ^ s0)
- not: Pop a value off the stack, flips the bits, push the result (s0=~s0)
- shlc n: Pop a value off the stack, shifts the bits the specified amount left, push the result (s0=s0 << n)
- shrc n: Pop a value off the stack, shifts the bits the specified amount right, push the result (s0=s0 >> n)

### Logic
- cmp: Pop two values off the stack, compare them, push the result
- cmpc n: Compares value on top of the stack to a constant number 
- cmpv x: Compares value on top of the stack to the value of a variable 
- bra x: Branches to a label
- beq x: Branch to a label if a previous compare evaluated to equal
- bne x: Branch to a label if a previous compare evaluated to not equal
- blt x: Branch to a label if a previous compare evaluated to less than
- bgt x: Branch to a label if a previous compare evaluated to greater than

### Misc
- call x: Calls a subroutine
- err x: Throws an error with a message
- end: Ends a program or subroutine

## Comments
Anything on a line after a hash is ignored.

```
# This whole line is a comment
push 3  # This is a comment
```

## Example

2 * (3 + x)^2

    push 3  ; [3]
    get  x  ; [3,1] ; where x=1
    add     ; [4]
    push 2  ; [4,2]
    pow     ; [16]
    push 2  ; [2,16]
    mul     ; [32]
    end

## ByteCode
The instructions sent to the VM are a stream of OpCodes followed by zero, one or two numbers and/or strings.
```
[
    OpCode, (string|number)?, (string|number)?, ...
]
```

Example:

```
[ 1,3, 1,2, 8, 4,"x", 5,"factorial" ]
```

With opcodes:
```
[
    push, 3,
    push, 2,
    mul,
    put, "x",
    call, "factorial"
]
```
