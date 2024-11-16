import React, { useState, useEffect } from "react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { ethers } from "ethers";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userAlice, setUserAlice] = useState(null);
  const [stream, setStream] = useState(null);

  // Create a random signer from a wallet, ideally this is the wallet you will connect
  const signer = ethers.Wallet.createRandom();
  const bobWalletAddress = "0x3654200Fe61158D12dED4e62914A4C74948Fae07";

  useEffect(() => {
    const initializeUserAndStream = async () => {
      try {
        // Initialize wallet user
        const user = await PushAPI.initialize(signer, { env: CONSTANTS.ENV.STAGING });
        setUserAlice(user);

        // Initialize Stream
        const chatStream = await user.initStream([CONSTANTS.STREAM.CHAT]);
        setStream(chatStream);

        // Configure stream listen events and handle incoming messages
        chatStream.on(CONSTANTS.STREAM.CHAT, (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Connect Stream
        chatStream.connect();
      } catch (error) {
        console.error("Error initializing user or stream:", error);
      }
    };

    initializeUserAndStream();

    // Cleanup the stream on component unmount
    return () => {
      if (stream) {
        stream.disconnect();
      }
    };
  }, []); // Only run once on mount

  const sendMessage = async () => {
    if (!userAlice) {
      console.error("User not initialized.");
      return;
    }

    try {
      // Send a message to Bob
      await userAlice.chat.send(bobWalletAddress, { content: input });
      setInput(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <h1>IGuild</h1>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message.content}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
