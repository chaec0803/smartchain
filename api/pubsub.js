const PubNub = require("pubnub");

const credentials = {
  publishKey: "pub-c-cb28fb52-fed6-457b-8b5a-bca5d0d34617",
  subscribeKey: "sub-c-483bf1a0-0249-48ce-abb3-1a5efe25615d",
  secretKey: "sec-c-ZDE3MTE0N2UtOWEwNi00NGRhLTk2OWMtZTcyODU5NzYzMzc0",
  userId: "blockchain-node-1",
};

const CHANNELS_MAP = {
  TEST: "TEST",
  BLOCK: "BLOCK",
};

class PubSub {
  constructor({ blockchain }) {
    this.pubnub = new PubNub(credentials);
    this.blockchain = blockchain;
    this.subscribeToChannels();
    this.listen();
  }

  subscribeToChannels() {
    this.pubnub.subscribe({
      channels: Object.values(CHANNELS_MAP),
    });
  }

  publish({ channel, message }) {
    this.pubnub.publish({ channel, message });
  }

  listen() {
    this.pubnub.addListener({
      message: (messageObject) => {
        const { channel, message } = messageObject;
        const parsedMessage = JSON.parse(message);

        console.log("Message received. Channel:", channel);

        switch (channel) {
          case CHANNELS_MAP.BLOCK:
            console.log("block message", message);
            this.blockchain
              .addBlock({ block: parsedMessage })
              .then(() => console.log("New block accepted"))
              .catch((error) =>
                console.error("New block rejected:", error.message)
              );
            break;
          default:
            return;
        }
      },
    });
  }

  broadcastBlock(block) {
    this.publish({
      channel: CHANNELS_MAP.BLOCK,
      message: JSON.stringify(block),
    });
  }
}

module.exports = PubSub;
