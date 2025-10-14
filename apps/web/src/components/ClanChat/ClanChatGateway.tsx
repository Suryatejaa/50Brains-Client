import React, { useEffect, useState, useRef } from 'react';
import { WebSocketManager } from '../../services/websocket/WebSocketManager';

interface ClanChatGatewayProps {
    userId: string;
    clanId: string;
    clanName?: string;
    memberDetails?: any[];
}

interface ChatMessage {
    id: string;
    userId: string;
    content: string;
    messageType: string;
    timestamp: string;
    isDelivered?: boolean;
    readBy?: string[];
    isDeleted?: boolean;
    isLocal?: boolean;
}

export function ClanChatGateway({ userId, clanId, clanName, memberDetails }: ClanChatGatewayProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Get WebSocketManager instance
    const wsManager = WebSocketManager.getInstance();

    // Subscribe to clan chat when connected
    useEffect(() => {
        const connectToClanChat = async () => {
            try {
                await wsManager.connect('clan-chat', { userId, clanId });
                setIsConnected(true);
                console.log('🏛️ ClanChatGateway: Connected to clan-chat service');

                // Subscribe to clan chat after connection
                subscribeToClanChat();
            } catch (error) {
                console.error('❌ ClanChatGateway: Failed to connect:', error);
                setIsConnected(false);
            }
        };

        if (clanId && userId) {
            connectToClanChat();
        }

        // Cleanup on unmount
        return () => {
            unsubscribeFromClanChat();
            wsManager.disconnect('clan-chat', { userId, clanId });
            setIsConnected(false);
        };
    }, [clanId, userId, wsManager]);

    // Subscribe to clan chat
    const subscribeToClanChat = () => {
        const message = {
            type: 'subscribe_clan_chat',
            clanId: clanId
        };
        wsManager.send('clan-chat', { userId, clanId }, message);
    };

    // Unsubscribe from clan chat
    const unsubscribeFromClanChat = () => {
        const message = {
            type: 'unsubscribe_clan_chat',
            clanId: clanId
        };
        wsManager.send('clan-chat', { userId, clanId }, message);
    };

    // Set up message handlers
    useEffect(() => {
        if (!isConnected) return;

        // Listen to clan-chat events from WebSocket Gateway
        const unsubscribeChat = wsManager.on('clan-chat.chat', (data: any) => {
            handleChatMessage(data);
        });

        const unsubscribeTyping = wsManager.on('clan-chat.typing', (data: any) => {
            handleTypingIndicator(data);
        });

        const unsubscribeDelivered = wsManager.on('clan-chat.message_delivered', (data: any) => {
            handleMessageDelivered(data);
        });

        const unsubscribeRead = wsManager.on('clan-chat.message_read', (data: any) => {
            handleMessageRead(data);
        });

        const unsubscribeDeleted = wsManager.on('clan-chat.message_deleted', (data: any) => {
            handleMessageDeleted(data);
        });

        // Listen to subscription confirmation
        const unsubscribeSubConfirm = wsManager.on('clan-chat.subscription_confirmed', (data: any) => {
            console.log('🏛️ ClanChatGateway: Subscription confirmed:', data);
        });

        // Listen to message sent confirmation
        const unsubscribeMessageSent = wsManager.on('clan-chat.message_sent', (data: any) => {
            console.log('🏛️ ClanChatGateway: Message sent confirmation:', data);
            // Update local message with server message ID
            setMessages(prev =>
                prev.map(msg =>
                    msg.isLocal && msg.content === data.content
                        ? { ...msg, id: data.messageId, isLocal: false, isDelivered: true }
                        : msg
                )
            );
        });

        return () => {
            unsubscribeChat();
            unsubscribeTyping();
            unsubscribeDelivered();
            unsubscribeRead();
            unsubscribeDeleted();
            unsubscribeSubConfirm();
            unsubscribeMessageSent();
        };
    }, [isConnected, wsManager]);

    // Handle incoming chat messages
    const handleChatMessage = (message: any) => {
        const newChatMessage: ChatMessage = {
            id: message.messageId || message.id,
            userId: message.userId,
            content: message.content,
            messageType: message.messageType || 'text',
            timestamp: message.timestamp || new Date().toISOString(),
            isDelivered: false,
            readBy: []
        };

        setMessages(prev => [...prev, newChatMessage]);

        // Mark message as read after a short delay
        setTimeout(() => {
            markMessageAsRead(newChatMessage.id);
        }, 1000);
    };

    // Handle typing indicators
    const handleTypingIndicator = (message: any) => {
        if (message.isTyping) {
            setTypingUsers(prev => new Set(prev).add(message.userId));
        } else {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(message.userId);
                return newSet;
            });
        }
    };

    // Handle message delivered status
    const handleMessageDelivered = (message: any) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === message.messageId
                    ? { ...msg, isDelivered: true }
                    : msg
            )
        );
    };

    // Handle message read status
    const handleMessageRead = (message: any) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === message.messageId
                    ? { ...msg, readBy: [...(msg.readBy || []), message.userId] }
                    : msg
            )
        );
    };

    // Handle message deletion
    const handleMessageDeleted = (message: any) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === message.messageId
                    ? { ...msg, isDeleted: true, content: '[Message deleted]' }
                    : msg
            )
        );
    };

    // Send message
    const handleSendMessage = () => {
        if (!newMessage.trim() || !isConnected) return;

        // Add optimistic message
        const optimisticMessage: ChatMessage = {
            id: `local-${Date.now()}`,
            userId: userId,
            content: newMessage.trim(),
            messageType: 'text',
            timestamp: new Date().toISOString(),
            isLocal: true,
            isDelivered: false,
            readBy: []
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        // Stop typing indicator
        setIsTyping(false);
        sendTypingIndicator(false);

        // Send message through WebSocket
        sendChatMessage(newMessage.trim());
    };

    // Send chat message
    const sendChatMessage = (content: string) => {
        const message = {
            type: 'chat',
            clanId,
            content,
            messageType: 'TEXT',
            timestamp: new Date().toISOString()
        };

        wsManager.send('clan-chat', { userId, clanId }, message);
    };

    // Send typing indicator
    const sendTypingIndicator = (isTyping: boolean) => {
        const message = {
            type: 'typing_indicator',
            clanId,
            isTyping,
            timestamp: new Date().toISOString()
        };

        wsManager.send('clan-chat', { userId, clanId }, message);
    };

    // Mark message as read
    const markMessageAsRead = (messageId: string) => {
        const message = {
            type: 'read_receipt',
            clanId,
            messageId,
            timestamp: new Date().toISOString()
        };

        wsManager.send('clan-chat', { userId, clanId }, message);
    };

    // Handle typing
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Send typing indicator
        if (!isTyping) {
            setIsTyping(true);
            sendTypingIndicator(true);
        }

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing indicator after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendTypingIndicator(false);
        }, 2000);
    };

    // Get display name for user
    const getDisplayName = (userId: string): string => {
        if (userId === 'system') return 'System';

        const member = memberDetails?.find(m => m.id === userId);
        if (member) {
            if (member.firstName && member.lastName) {
                return `${member.firstName} ${member.lastName}`;
            } else if (member.firstName) {
                return member.firstName;
            } else if (member.lastName) {
                return member.lastName;
            } else {
                return member.username || userId;
            }
        }

        return userId;
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup typing timeout
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    if (!isConnected) {
        return (
            <div className="text-yellow-500 p-4">
                🔌 Connecting to clan chat...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-gray-100 p-4 border-b">
                <h3 className="font-semibold">Clan Chat - {clanName || 'Loading...'}</h3>
                <div className="flex items-center space-x-2 mt-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Connected to WebSocket Manager</span>
                </div>
                {typingUsers.size > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                        {Array.from(typingUsers).map(id => getDisplayName(id)).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                    </p>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${message.userId === userId
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                                    }`}
                            >
                                <div className="text-sm font-medium mb-1">
                                    {message.userId === userId ? 'You' : getDisplayName(message.userId)}
                                </div>
                                <div className="text-sm">
                                    {message.isDeleted ? (
                                        <span className="italic text-gray-500">{message.content}</span>
                                    ) : (
                                        message.content
                                    )}
                                </div>
                                <div className="text-xs mt-1 opacity-75">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                    {message.isLocal && ' 🔄'}
                                    {message.isDelivered && !message.isLocal && ' ✓'}
                                    {message.readBy && message.readBy.length > 0 && ` 👁️ ${message.readBy.length}`}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isConnected}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
