'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdAt: string;
  isRead: boolean;
  attachments?: any[];
}

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load conversations
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  // Handle URL params for new conversation
  useEffect(() => {
    const to = searchParams.get('to');
    if (to && conversations.length > 0) {
      const existingConversation = conversations.find(c => c.participantId === to);
      if (existingConversation) {
        setActiveConversation(existingConversation.id);
      } else {
        // Create new conversation
        startNewConversation(to);
      }
    }
  }, [searchParams, conversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/messages/conversations');
      
      if (response.success) {
        setConversations((response.data as Conversation[]) || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/api/messages/conversations/${conversationId}/messages`);
      
      if (response.success) {
        setMessages((response.data as Message[]) || []);
        // Mark messages as read
        markMessagesAsRead(conversationId);
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await apiClient.put(`/api/messages/conversations/${conversationId}/read`);
      // Update unread count in conversations
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const startNewConversation = async (participantId: string) => {
    try {
      const response = await apiClient.post('/api/messages/conversations', {
        participantId,
      });
      
      if (response.success) {
        const newConversation = response.data as Conversation;
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation.id);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to start conversation');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await apiClient.post(`/api/messages/conversations/${activeConversation}/messages`, {
        content: newMessage.trim(),
        type: 'TEXT',
      });
      
      if (response.success) {
        const sentMessage = response.data as Message;
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? { 
                ...conv, 
                lastMessage: sentMessage.content,
                lastMessageAt: sentMessage.createdAt 
              }
            : conv
        ));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActiveConversationData = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            <div className="card-glass overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="flex h-full">
                {/* Conversations Sidebar */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="p-4 text-center">
                        <div className="mb-4">
                          <div className="mx-auto mb-4 h-12 w-12 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xl">💬</span>
                          </div>
                          <p className="text-gray-600 text-sm">No conversations yet</p>
                        </div>
                      </div>
                    ) : (
                      conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => setActiveConversation(conversation.id)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            activeConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {conversation.participantAvatar ? (
                                  <img 
                                    src={conversation.participantAvatar} 
                                    alt="Avatar" 
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  conversation.participantName[0]?.toUpperCase() || 'U'
                                )}
                              </div>
                              {conversation.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-lg border-2 border-white"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {conversation.participantName}
                                </h3>
                                {conversation.lastMessageAt && (
                                  <span className="text-xs text-gray-500">
                                    {formatMessageTime(conversation.lastMessageAt)}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.lastMessage || 'No messages yet'}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-none px-2 py-1 min-w-[20px] text-center">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                  {activeConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white font-semibold">
                            {getActiveConversationData()?.participantAvatar ? (
                              <img 
                                src={getActiveConversationData()?.participantAvatar} 
                                alt="Avatar" 
                                className="w-10 h-10 rounded-none object-cover"
                              />
                            ) : (
                              getActiveConversationData()?.participantName[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {getActiveConversationData()?.participantName}
                            </h3>
                            {getActiveConversationData()?.isOnline && (
                              <p className="text-sm text-green-600">Online</p>
                            )}
                          </div>
                        </div>
                        
                        <Link
                          href={`/profile/${getActiveConversationData()?.participantId}` as any}
                          className="btn-ghost-sm"
                        >
                          View Profile
                        </Link>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-none ${
                                message.senderId === user?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-200">
                        <form onSubmit={sendMessage} className="flex space-x-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="input flex-1"
                            disabled={sendingMessage}
                          />
                          <button
                            type="submit"
                            disabled={!newMessage.trim() || sendingMessage}
                            className="btn-primary px-6"
                          >
                            {sendingMessage ? 'Sending...' : 'Send'}
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    /* No Conversation Selected */
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-2xl">💬</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Select a conversation
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Choose a conversation from the sidebar to start messaging
                        </p>
                        
                        <div className="space-y-2">
                          <Link href="/influencers" className="btn-primary block">
                            Find Influencers
                          </Link>
                          <Link href="/crew" className="btn-ghost block">
                            Find Crew Members
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
