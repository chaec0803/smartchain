const { ec, keccakHash } = require("../util");
const { START_BALANCE } = require("../config");

class Account {
  constructor({ code } = {}) {
    this.keyPair = ec.genKeyPair();
    this.address = this.keyPair.getPublic().encode("hex");
    this.balance = START_BALANCE;
    this.code = code || [];
    this.generateCodeHash();
  }

  generateCodeHash() {
    this.codeHash =
      this.code.length > 0 ? keccakHash(this.address + this.code) : null;
  }

  sign(data) {
    return this.keyPair.sign(keccakHash(data));
  }

  toJSON() {
    return {
      balance: this.balance,
      address: this.address,
      code: this.code,
      codeHash: this.codeHash,
    };
  }

  static verifySignature({ publicKey, data, signature }) {
    const keyFromPublic = ec.keyFromPublic(publicKey, "hex");

    return keyFromPublic.verify(keccakHash(data), signature);
  }

  static calculateBalance({ address, state }) {
    balance = state.getAccount({ address }).balance;
    return balance;
  }
}

module.exports = Account;
