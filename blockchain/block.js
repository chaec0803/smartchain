const { keccakHash } = require('../util');
const { GENESIS_DATA } = require('../config')

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
    constructor({ blockHeaders }) {
        this.blockHeaders = blockHeaders
    }

    static calculateBlockTargetHash({ lastBlock }) {
        const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(16);

        if (value.length > HASH_LENGTH) {
            return 'f'.repeat(HASH_LENGTH);
        }

        return '0'.repeat(HASH_LENGTH - value.length) + value;
    }

    static mineBlock({ lastBlock, beneficiary }) {
        const target = Block.calculateBlockTargetHash({ lastBlock });

        let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;

        do {
            timestamp = Date.now();
            truncatedBlockHeaders = {
                parentHash: keccakHash(lastBlock.blockHeaders),
                beneficiary,
                difficulty: lastBlock.blockHeaders.difficulty + 1,
                number: lastBlock.blockHeaders.number + 1,
                timestamp,
            };
            header = keccakHash(truncatedBlockHeaders);
            nonce = Math.floor(Math.random() * MAX_NONCE_VALUE) + 1;

            underTargetHash = keccakHash(header + nonce);
        } while (underTargetHash >= target);

        return new this({
            blockHeaders: { ...truncatedBlockHeaders, nonce }
        })
    }


    static genesis() {
        return new this(GENESIS_DATA);
    }
}

module.exports = Block;


/**Term	What It Is
Current Block:	The block you're trying to mine now
Target Hash:	The threshold value determined by difficulty
Under Target Hash:	The hash of your current block header, 
                    if it's less than the target */