const Block = require('./block')

class Blockchain {
    constructor({state}) {
        this.chain = [Block.genesis()];
        this.state = state;
    }

    addBlock({ block, transactionQueue }) {
        return new Promise((resolve, reject) => {
            Block.validateBlock({
                lastBlock: this.chain[this.chain.length - 1],
                block,
                state: this.state
            }).then(() => {
                this.chain.push(block);

                Block.runBlock({block, state: this.state});

                transactionQueue.clearBlockTransactions({
                    transactionSeries: block.transactionSeries
                })


                return resolve(); //return resolve for promise immediately
            }).catch(reject);
        });
    }

    replaceChain({ chain }) {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < chain.length; i++) {
                const block = chain[i];
                const lastBlock = i == 0 ? null : chain[i - 1];

                try {
                    await Block.validateBlock({ lastBlock, block, state: this.state })
                    Block.runBlock({block, state: this.state});
                } catch (error) {
                    return reject(error);
                }

                console.log(`*--Validated block number: ${block.blockHeaders.number}`)
            }

            this.chain = chain;

            return resolve(); //return resolve for promise after for loop finishes
        });
    }
}

module.exports = Blockchain;