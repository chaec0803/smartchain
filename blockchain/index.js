const Block = require('./block')

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ block }) {
        return new Promise((resolve, reject) => {
            Block.validateBlock({
                lastBlock: this.chain[this.chain.length - 1],
                block
            }).then(() => {
                this.chain.push(block);

                return resolve(); //return resolve for promise immediately
            }).catch(reject);
        });
    }

    replaceChain({chain}){
        return new Promise(async (resolve, reject) => {
            for(let i=0; i<chain.length;i++){
                const block = chain[i];
                const lastBlock = i == 0 ? null : chain[i - 1];

                try {
                    await Block.validateBlock({ lastBlock, block })
                } catch (error){
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


const blockchain = new Blockchain();

console.log(JSON.stringify(blockchain));