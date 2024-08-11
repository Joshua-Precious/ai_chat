'use client'
import React, {useState, useRef, useEffect} from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

export function Jay() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setUpdate] = useState(0);
  const messagesEndRef = useRef(null);
  const botName = "Jay"; // Define the bot's name


useEffect(() => {
  const timer = setInterval(() => {
    setUpdate(prevUpdate => prevUpdate + 1);
  }, 60000); // Update every minute

  return () => clearInterval(timer);
}, []);

  function formatTimestamp(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleString(); // Returns date and time
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    console.log('Trimmed input:', trimmedInput);
    if (trimmedInput.length === 0) {
      console.log('Input is empty, not submitting');
      return;
    }
  
    const userMessage = { role: 'user', content: trimmedInput , timestamp: new Date() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
  
    try {
      console.log('Sending request to API with input:', trimmedInput);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedInput,
          history: messages,
          botName: botName
        }),
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
  
      console.log('Received response from API');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (aiResponse.trim().length === 0) {
            throw new Error('Stream ended without any content');
          }
          break;
        }
        const chunk = decoder.decode(value);
        aiResponse += chunk;
      }
  
      console.log('Full AI response:', aiResponse);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: aiResponse.trim(), timestamp: new Date()  }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  function formatContent(content) {
    if (content.includes('```')) {
      return formatCodeBlocks(content);
    } else if (content.includes('#')) {
      return formatHeaders(content);
    }
    return content;
  }

  function formatCodeBlocks(content) {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) { // This is a code block
        return (
          <pre key={index} className="bg-gray-800 p-4 rounded-md overflow-x-auto">
            <code className="text-sm text-white">{part.trim()}</code>
          </pre>
        );
      }
      return <p key={index}>{part}</p>;
    });
  }

  function formatHeaders(content) {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-3 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-2 mb-1">{line.substring(4)}</h3>;
      }
      return <p key={index}>{line}</p>;
    });
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#1a1a1a] text-white">
      <header className="bg-[#2b2b2b] px-6 py-4 flex items-center justify-between">
        <h1 className="flex justify-between text-xl font-bold">{botName} AI-Chat</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-muted/20">
            <SettingsIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-muted/20">
            <HandHelpingIcon className="w-5 h-5" />
          </Button>
        </div>
      </header>
      <div className="flex-1 box-border w-400px h-full overflow-auto p-6 bg-gradient-to-b from-[#1a1a1a] to-[#2b2b2b]">
        <div className="grid gap-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <Avatar
                  className="w-14 h-14 bg-gradient-to-br from-[#9b59b6] to-[#8e44ad] text-white">
                  <AvatarImage src="/placeholder-ai.jpg" alt={botName} />
                  <AvatarFallback>{botName[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className={`grid gap-2 ${message.role === 'user' ? 'bg-gradient-to-br from-[#9b59b6] to-[#8e44ad]' : 'bg-[#2b2b2b]'} px-4 py-3 rounded-lg shadow-lg`}>
                <div className="text-sm font-medium">{message.role === 'user' ? 'You' : botName}</div>
                <div className="prose text-white">
                  <p>{formatContent(message.content)}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatTimestamp(new Date(message.timestamp))}</span>
                </div>
              </div>
              {message.role === 'user' && (
                <Avatar
                  className="w-14 h-14 bg-gradient-to-br from-[rgba(129,93,214,0)] to-[#ebe6ee] text-white">
                  <AvatarImage src="/placeholder-user.jpg" alt="You" />
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-[#2b2b2b] px-6 py-4 flex items-center gap-4">
        <form onSubmit={handleSubmit} className="bg-[#2b2b2b] px-6 py-4 flex w-full items-center gap-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey){
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 bg-[#3b3b3b] border-none focus:ring-0 focus:outline-none resize-none rounded-lg px-4 py-2 text-white"
          />
          <Button
            onClick={handleSubmit}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-muted/20"
            disabled={isLoading}
          >
            <SendIcon className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function ClockIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HandHelpingIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
      <path
        d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
      <path d="m2 13 6 6" />
    </svg>
  );
}

function SendIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
} 