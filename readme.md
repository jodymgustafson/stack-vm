# StackVM

Virtual machine that uses a stack for optimized computation of mathematical expressions. 

## Operations

### Stack
push n: Push a numeric value on the stack
pop: Pop the value off the top of the stack
get x: Get a variable's value and push on stack
put x: Set a variable's value to the number on top of the stack
put.n x, n: Set a variable's value to the specified number

### Math
add: Pop two values off the stack, add them, push the result
sub: Pop two values off the stack, subtract them, push the result
mul: Pop two values off the stack, multiply them, push the result
div: Pop two values off the stack, divide them, push the result
pow: Pop two values off the stack, compute exponent, push the result

### Logic
cmp: Pop two values off the stack, compare them, push the result
cmp.n n: Compares value on top of the stack to a number 
cmp.x x: Compares value on top of the stack to the value of a variable 
bra x: Branches to a label
beq x: Branch to a label if a previous compare evaluated to equal
bne x: Branch to a label if a previous compare evaluated to not equal
blt x: Branch to a label if a previous compare evaluated to less than
bgt x: Branch to a label if a previous compare evaluated to greater than

### Misc
call x: Calls a subroutine
err x: Throws an error with a message
end: Ends a program or subroutine

## Example

2 * (3 + x)^2

    push 3  # [3]
    get  x  # [3,1] where x=1
    add     # [4]
    push 2  # [4,2]
    pow     # [16]
    push 2  # [2,16]
    mul     # [32]
    end

## ByteCode
The instructions sent to the VM are a stream of OpCodes followed by zero, one or two numbers and/or strings.
```
[
    OpCode, (string|number)?, (string|number)?, ...
]
```

Example:
    [ 1,3, 1,2, 8, 4,"x", 5,"factorial" ]

[
    push, 3,
    push, 2,
    mul,
    put, "x",
    call, "factorial"
]
