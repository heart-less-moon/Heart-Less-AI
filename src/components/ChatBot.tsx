
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Heart Less AI. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLanguageColor = (language: string) => {
    const colors = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-orange-500',
      cpp: 'bg-purple-500',
      c: 'bg-gray-500',
      html: 'bg-red-500',
      css: 'bg-pink-500',
      json: 'bg-indigo-500',
      sql: 'bg-teal-500',
      php: 'bg-violet-500',
      ruby: 'bg-red-600',
      go: 'bg-cyan-500',
      rust: 'bg-orange-600',
      swift: 'bg-orange-400',
      kotlin: 'bg-purple-600',
      bash: 'bg-gray-700',
      shell: 'bg-gray-700',
      default: 'bg-slate-500'
    };
    return colors[language.toLowerCase()] || colors.default;
  };

  const formatMessageContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Heart Less Chatbot",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1-0528:free",
          "messages": [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: inputMessage
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-full">
                <Bot className="w-6 h-6" />
              </div>
             Heart Less AI Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[520px]">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500">
                        <AvatarFallback className="bg-transparent text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white text-gray-800 border shadow-md'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        {formatMessageContent(message.content).map((part, index) => (
                          <div key={index}>
                            {part.type === 'text' ? (
                              <span className="whitespace-pre-wrap">{part.content}</span>
                            ) : (
                              <div className="my-3">
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                                  <div className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 border-b border-gray-600">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(part.language)}`}></div>
                                      <span className="text-sm font-medium text-gray-200 capitalize">
                                        {part.language}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(part.content)}
                                      className="h-8 px-3 text-gray-300 hover:text-white hover:bg-gray-600 transition-all duration-200 rounded-lg"
                                    >
                                      {copiedCode === part.content ? (
                                        <div className="flex items-center gap-1">
                                          <Check className="w-4 h-4 text-green-400" />
                                          <span className="text-xs text-green-400">Copied!</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <Copy className="w-4 h-4" />
                                          <span className="text-xs">Copy</span>
                                        </div>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="relative">
                                    <pre className="p-4 text-sm text-gray-100 overflow-x-auto font-mono leading-relaxed bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                                      <code className="text-gray-100 font-mono">{part.content}</code>
                                    </pre>
                                    <div className="absolute top-2 right-2 opacity-20">
                                      <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500">
                        <AvatarFallback className="bg-transparent text-white">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500">
                      <AvatarFallback className="bg-transparent text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-2xl px-4 py-3 border shadow-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="border-t bg-gray-50/50 p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatBot;
