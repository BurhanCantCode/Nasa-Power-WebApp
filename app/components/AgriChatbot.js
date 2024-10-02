import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

const AgriChatbot = ({ latitude, longitude, nasaData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Fetch location information when component mounts or coordinates change
    fetchLocationInfo();
  }, [latitude, longitude]);

  const fetchLocationInfo = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      setLocationInfo(data);
    } catch (error) {
      console.error('Error fetching location info:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await getBotResponse(userMessage.content);
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }

    setIsLoading(false);
  };

  const getBotResponse = async (userMessage) => {
    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const YOUR_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
    const YOUR_SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME;

    const locationString = locationInfo ? 
      `${locationInfo.address.city || locationInfo.address.town || locationInfo.address.village || 'Unknown City'}, ${locationInfo.address.country || 'Unknown Country'}` :
      'Unknown Location';

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": YOUR_SITE_URL,
          "X-Title": YOUR_SITE_NAME,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.1-8b-instruct:free",
          "messages": [
            {
              "role": "system",
              "content": `You are an agricultural assistant who only talks about agriculture and crops. Answer concisely. The user's location is at coordinates ${latitude}°N, ${longitude}°E, which is in ${locationString}. Use this location information and the following NASA POWER API data to provide relevant agricultural advice: ${JSON.stringify(nasaData)}`
            },
            {
              "role": "user",
              "content": userMessage
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-100">Agricultural Assistant</h2>
      <div className="h-80 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
              {message.content}
            </span>
          </motion.div>
        ))}
        {isLoading && (
          <div className="text-center">
            <FaRobot className="animate-spin inline-block text-gray-400" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-gray-700 text-gray-100 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask about agriculture..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-r-lg p-2 hover:bg-blue-700 transition duration-300"
          disabled={isLoading}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default AgriChatbot;