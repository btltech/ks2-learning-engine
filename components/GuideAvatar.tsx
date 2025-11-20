import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { askMiRa, generateSubjectConnections, generateProjectSuggestions, generateQuizHint, generateConceptReinforcement } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useTTS } from '../hooks/useTTS';

interface GuideAvatarProps {
  message: string;
  studentAge: number;
  context?: { subject?: string; topic?: string };
}

const GuideAvatar: React.FC<GuideAvatarProps> = ({ message, studentAge, context }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    // Focus input when chat opens
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  useEffect(() => {
    // Cleanup function to prevent memory leaks
    return () => {
      setIsTyping(false);
    };
  }, []);

  const handleAvatarClick = () => {
    setIsChatOpen(prev => {
      const next = !prev;
      if (next && chatMessages.length === 0) {
        // Add welcome message when opening for the first time
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'mira',
          message: message || "Hi there! I'm MiRa, your learning buddy! Ask me anything about your lessons, and I'll do my best to help! 🤖",
          timestamp: Date.now()
        };
        setChatMessages([welcomeMessage]);
      }
      return next;
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'student',
      message: inputMessage.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Add MiRa's response
      const response = await askMiRa(userMessage.message, studentAge, context);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'mira',
        message: response,
        timestamp: Date.now(),
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to MiRa:', error);
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'mira',
        message: isNetworkError 
          ? "I can't connect right now. Please check your internet connection and try again! 🌐"
          : "Oops! I'm having trouble thinking right now. Can you try asking again?",
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsTyping(true);
    let response = '';

    try {
      switch (action) {
        case 'connections':
          if (context?.subject && context?.topic) {
            response = await generateSubjectConnections(
              context.subject, 
              context.topic, 
              studentAge, 
              {} // We'll need to pass mastery data from props later
            );
          } else {
            response = "I'd love to show you how subjects connect! What subject and topic are you working on right now?";
          }
          break;
        case 'projects':
          if (context?.subject && context?.topic) {
            response = await generateProjectSuggestions(
              context.subject, 
              context.topic, 
              studentAge, 
              {} // We'll need to pass mastery data from props later
            );
          } else {
            response = "Project ideas are so much fun! What subject and topic would you like project suggestions for?";
          }
          break;
        case 'practice':
          if (context?.subject && context?.topic) {
            response = await generateConceptReinforcement(
              context.subject, 
              context.topic, 
              'Medium', // Default difficulty
              studentAge
            );
          } else {
            response = "Extra practice is a great idea! What subject and topic do you want to practice more?";
          }
          break;
        case 'hint':
          response = "I'd be happy to give you a hint! What question are you stuck on? Can you tell me the question and the options?";
          break;
        default:
          response = "That's a great idea! What would you like help with?";
      }

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'mira',
        message: response,
        timestamp: Date.now(),
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with quick action:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'mira',
        message: "Oops! I'm having trouble with that right now. Can you try asking me directly?",
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAvatarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAvatarClick();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="absolute bottom-32 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-pop-in mb-4">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(0, 5)">
                    <line x1="50" y1="10" x2="50" y2="0" stroke="white" strokeWidth="2" />
                    <circle cx="50" cy="10" r="3" fill="white" />
                    <rect x="30" y="15" width="40" height="30" rx="10" fill="white" opacity="0.9" />
                    <circle cx="50" cy="30" r="8" fill="#1e293b" />
                    <circle cx="50" cy="30" r="4" fill="white" className="animate-pulse" />
                    <rect x="20" y="45" width="60" height="40" rx="15" fill="white" opacity="0.8" />
                  </g>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">MiRa</h3>
                <p className="text-xs opacity-90">Your Learning Buddy</p>
              </div>
            </div>
            <button
              onClick={handleAvatarClick}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close chat"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'student'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-md rounded-bl-none'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1 opacity-75">
                    {msg.sender === 'student' ? 'You' : 'MiRa'}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-md rounded-2xl rounded-bl-none px-4 py-2">
                  <p className="text-sm font-semibold mb-1 opacity-75">MiRa</p>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-between"
            >
              Quick Help
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>
            
            {showQuickActions && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickAction('connections')}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md transition-colors"
                  disabled={isTyping}
                >
                  🔗 Subject Links
                </button>
                <button
                  onClick={() => handleQuickAction('projects')}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md transition-colors"
                  disabled={isTyping}
                >
                  🎨 Projects
                </button>
                <button
                  onClick={() => handleQuickAction('practice')}
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-md transition-colors"
                  disabled={isTyping}
                >
                  📝 Extra Practice
                </button>
                <button
                  onClick={() => handleQuickAction('hint')}
                  className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded-md transition-colors"
                  disabled={isTyping}
                >
                  💡 Quiz Hint
                </button>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask MiRa anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Type your question"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Message Bubble - Removed to minimize */}
      {/* {!isChatOpen && (
        <div key={key} className="bg-white p-4 rounded-lg rounded-br-none shadow-xl max-w-xs animate-pop-in mb-4">
          <p className="text-gray-800 font-semibold">{displayedMessage}</p>
          <div className="absolute bottom-0 right-[-10px] w-0 h-0 border-l-[10px] border-l-transparent border-t-[15px] border-t-white"></div>
        </div>
      )} */}

      {/* Avatar Button */}
      <button
        onClick={handleAvatarClick}
        onKeyDown={handleAvatarKeyDown}
        className="w-16 h-16 animate-float hover:scale-110 transition-transform cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400 rounded-full shadow-lg bg-white border-2 border-blue-100"
        aria-label={isChatOpen ? 'Close chat with MiRa' : 'Chat with MiRa'}
        title={isChatOpen ? 'Close MiRa' : 'Open MiRa'}
      >
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="text-3xl">🤖</div>
        </div>
      </button>
    </div>
  );
};

export default GuideAvatar;
