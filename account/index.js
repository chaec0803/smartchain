const { ec, keccakHash } = require("../util");
const { START_BALANCE } = require("../config");

class Account {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.address = this.keyPair.getPublic().encode("hex");
    this.balance = START_BALANCE;
  }

  sign(data) {
    return this.keyPair.sign(keccakHash(data));
  }

  toJSON() {
    return {
      balance: this.balance,
      address: this.address,
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
