const STOP = "STOP";
const PUSH = "PUSH";
const ADD = "ADD";
const SUB = "SUB";
const MUL = "MUL";
const DIV = "DIV";
const LT = "LT";
const GT = "GT";
const EQ = "EQ";
const AND = "AND";
const OR = "OR";
const JUMP = "JUMP";
const JUMPI = "JUMPI";

const OPCODE_MAP = {
  STOP,
  PUSH,
  ADD,
  SUB,
  MUL,
  DIV,
  LT,
  GT,
  EQ,
  AND,
  OR,
  JUMP,
  JUMPI,
};

const EXECUTION_COMPLETE = "Execution complete";
const EXECUTION_LIMIT = 10000;

class Interpreter {
  constructor() {
    this.state = {
      programCounter: 0,
      stack: [],
      code: [],
      executionCount: 0,
    };
  }

  jump() {
    const destination = this.state.stack.pop();

    if (destination < 0 || destination > this.state.code.length) {
      throw new Error(`Invalid destination: ${destination}`);
    }

    this.state.programCounter = destination;
    this.state.programCounter--;
  }

  runCode(code) {
    this.state.code = code;

    while (this.state.programCounter < this.state.code.length) {
      this.state.executionCount++;

      if (this.state.executionCount > EXECUTION_LIMIT) {
        throw new Error(
          `Check for an infinite loop. Execution limit of ${EXECUTION_LIMIT} exceeded`
        );
      }

      const opCode = this.state.code[this.state.programCounter];

      try {
        switch (opCode) {
          case STOP:
            throw new Error(EXECUTION_COMPLETE);
          case PUSH:
            this.state.programCounter++;

            if (this.state.programCounter === this.state.code.length) {
              throw new Error(`The 'PUSH' instruction cannot be last.`);
            }

            const value = this.state.code[this.state.programCounter];
            this.state.stack.push(value);
            break;
          case ADD:
          case SUB:
          case MUL:
          case DIV:
          case LT:
          case GT:
          case EQ:
          case AND:
          case OR:
            const a = this.state.stack.pop();
            const b = this.state.stack.pop();

            let result;
            if (opCode === ADD) result = a + b;
            if (opCode === SUB) result = a - b;
            if (opCode === MUL) result = a * b;
            if (opCode === DIV) result = a / b;
            if (opCode === LT) result = (a < b) | 0;
            if (opCode === GT) result = (a > b) | 0;
            if (opCode === EQ) result = (a === b) | 0;
            if (opCode === AND) result = a && b;
            if (opCode === OR) result = a || b;

            this.state.stack.push(result);
            break;
          case JUMP:
            this.jump();
            break;
          case JUMPI:
            const condition = this.state.stack.pop();

            if (condition === 1) {
              this.jump();
            }
            break;
          default:
            break;
        }
      } catch (error) {
        if (error.message === EXECUTION_COMPLETE)
          return this.state.stack[this.state.stack.length - 1];

        throw error;
      }

      this.state.programCounter++;
    }
  }
}

Interpreter.OPCODE_MAP = OPCODE_MAP;
module.exports = Interpreter;

// let code = [PUSH, 2, PUSH, 3, ADD, STOP];
// let result = new Interpreter().runCode(code);
// console.log("Result of 3 ADD 2:", result);

// code = [PUSH, 2, PUSH, 3, SUB, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 SUB 2:", result);

// code = [PUSH, 2, PUSH, 3, MUL, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 MUL 2:", result);

// code = [PUSH, 2, PUSH, 3, DIV, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 DIV 2:", result);

// code = [PUSH, 2, PUSH, 3, LT, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 LT 2:", result);

// code = [PUSH, 2, PUSH, 3, GT, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 GT 2:", result);

// code = [PUSH, 2, PUSH, 3, EQ, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 EQ 2:", result);

// code = [PUSH, 2, PUSH, 3, AND, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 AND 2:", result);

// code = [PUSH, 2, PUSH, 3, OR, STOP];
// result = new Interpreter().runCode(code);
// console.log("Result of 3 OR 2:", result);

// code = [PUSH, 6, JUMP, PUSH, 0, JUMP, PUSH, "jump successful", STOP];
// result = new Interpreter().runCode(code);
// console.log("result of JUMP:", result);

// code = [PUSH, 8, PUSH, 1, JUMPI, PUSH, 0, JUMP, PUSH, "jump successful", STOP];
// result = new Interpreter().runCode(code);
// console.log("result of JUMPI:", result);

// code = [PUSH, 99, PUSH, 1, JUMPI, PUSH, 0, JUMP, PUSH, "jump successful", STOP];
// try {
//   result = new Interpreter().runCode(code);
// } catch (error) {
//   console.log("Invalid destination error:", error.message);
// }

// code = [PUSH, 0, PUSH];
// try {
//   result = new Interpreter().runCode(code);
// } catch (error) {
//   console.log("Expected invalid PUSH error:", error.message);
// }

// code = [PUSH, 0, JUMP, STOP];
// try {
//   result = new Interpreter().runCode(code);
// } catch (error) {
//   console.log("Infinite invalid execution error:", error.message);
// }
