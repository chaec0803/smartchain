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
  constructor() {
    this.pubnub = new PubNub(credentials);
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
        console.log("messageObject", messageObject);
      },
    });
  }
}

module.exports = PubSub;

const pubsub = new PubSub();

setTimeout(() => {
  pubsub.publish({
    channel: CHANNELS_MAP.TEST,
    message: "foo",
  });
}, 3000);
