const { keccakHash } = require('../util');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const Transaction = require('../transaction');
const Trie = require('../store/trie')

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
    constructor({ blockHeaders, transactionSeries }) {
        this.blockHeaders = blockHeaders;
        this.transactionSeries = transactionSeries;
    }

    static calculateBlockTargetHash({ lastBlock }) {
        const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(16);

        if (value.length > HASH_LENGTH) {
            return 'f'.repeat(HASH_LENGTH);
        }

        return '0'.repeat(HASH_LENGTH - value.length) + value;
    }

    static adjustDifficulty({ lastBlock, timestamp }) {
        const { difficulty } = lastBlock.blockHeaders;

        // if it took long to mine the last block, make this block easier to mine
        if ((timestamp - lastBlock.blockHeaders.timestamp) > MINE_RATE) {
            return difficulty - 1;
        }

        if (difficulty < 1) { return 1; };

        return difficulty + 1;
    }

    static mineBlock({ 
        lastBlock, 
        beneficiary, 
        transactionSeries,
        stateRoot }) {
        const target = Block.calculateBlockTargetHash({ lastBlock });
        const transactionsTrie = Trie.buildTrie({items: transactionSeries});
        let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;

        do {
            timestamp = Date.now();
            truncatedBlockHeaders = {
                parentHash: keccakHash(lastBlock.blockHeaders),
                beneficiary,
                difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
                number: lastBlock.blockHeaders.number + 1,
                timestamp,
                transactionsRoot: transactionsTrie.rootHash,
                stateRoot
            };
            header = keccakHash(truncatedBlockHeaders);
            nonce = Math.floor(Math.random() * MAX_NONCE_VALUE) + 1;

            underTargetHash = keccakHash(header + nonce);
        } while (underTargetHash > target);

        return new this({
            blockHeaders: { ...truncatedBlockHeaders, nonce },
            transactionSeries
        });
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static validateBlock({ lastBlock, block, state }) {
        return new Promise((resolve, reject) => {
            if (keccakHash(block) === keccakHash(Block.genesis())) {
                return resolve();
            }

            if (keccakHash(lastBlock.blockHeaders) !== block.blockHeaders.parentHash) {
                return reject(
                    new Error("The parent hash must be a hash of the last block's headers")
                );
            };

            if (block.blockHeaders.number !== lastBlock.blockHeaders.number + 1) {
                return reject(
                    new Error("The block must increment the number by 1")
                );
            };

            if (Math.abs(lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty) > 1) {
                return reject(
                    new Error("The difficulty must only adjust by 1")
                );
            };

            //Do the transactionsSeries match the rootHash?
            const rebuiltTransactionsTrie = Trie.buildTrie({items: block.transactionSeries});
            
            if (rebuiltTransactionsTrie.rootHash !== block.blockHeaders.transactionsRoot){
                return reject(
                    new Error(
                        `The rebuilt transactions root does not the block's` +
                        `transactions root: ${block.blockHeaders.transactionsRoot}`
                    )
                )
            }

            const target = Block.calculateBlockTargetHash({ lastBlock });

            const { blockHeaders } = block;
            const { nonce } = blockHeaders;
            const truncatedBlockHeaders = { ...blockHeaders };
            delete truncatedBlockHeaders.nonce;

            const header = keccakHash(truncatedBlockHeaders);

            const underTargetHash = keccakHash(header + nonce);

            if (underTargetHash > target) {
                return reject(
                    new Error("The block does not meet the proof of work requirement")
                );
            };

            //Are the transactions valid? (could the transactions be run against the current state?)
            Transaction.validateTransactionSeries({
                transactionSeries: block.transactionSeries,
                state
            })
            .then(resolve)
            .catch(reject)
            
            return resolve();
        });
    }

    static runBlock({block, state}){
        for (let transaction of block.transactionSeries){
            Transaction.runTransaction({state, transaction});
        }
    }
}

module.exports = Block;