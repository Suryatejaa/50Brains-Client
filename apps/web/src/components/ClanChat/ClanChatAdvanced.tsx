import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClanChatService } from '../../services/clanChat/ClanChatService';
import './ClanChatAdvanced.css';

// Simple debounce utility function
const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

interface Message {
    id: string;
    content: string;
    userId: string;
    timestamp?: string; // Keep for backward compatibility
    createdAt?: string; // Primary timestamp field from database
    messageType: 'TEXT' | 'IMAGE' | 'FILE';
    isDelivered?: boolean;
    readBy?: string[];
    readAt?: string[];
    isDeleted?: boolean;
    contextMenuPosition?: { x: number; y: number }; // Add position for context menu
}

interface MessageStatus {
    messageId: string;
    isDelivered: boolean;
    deliveredAt?: string;
    readCount: number;
    isDeleted: boolean;
    deletedAt?: string;
    deletedBy?: string;
}

interface DeliveryDetails {
    messageId: string;
    senderId: string;
    totalMembers: number;
    deliveredCount: number;
    readCount: number;
    deliveryDetails: Array<{
        userId: string;
        role: string;
        isDelivered: boolean;
        deliveredAt?: string;
        hasRead: boolean;
        readAt?: string;
    }>;
}

const ClanChatAdvanced: React.FC<{ userId: string, clanId: string, clanName: string, memberDetails: any[] }> = ({ userId, clanId, clanName, memberDetails }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageStatus>>(new Map());
    const [deliveryDetails, setDeliveryDetails] = useState<Map<string, DeliveryDetails>>(new Map());
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [showMessageDetails, setShowMessageDetails] = useState(false);
    const [clanChatService, setClanChatService] = useState<ClanChatService | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const currentUserId = userId; // Use the actual userId prop instead of hardcoded value

    // Get display name for a user ID from existing memberDetails
    const getUserDisplayName = useCallback((userId: string): string => {
        const member = memberDetails.find(member => member.id === userId);
        if (member) {
            return member.username || member.displayName || member.firstName || member.name || 'Unknown User';
        }
        return userId; // Fallback to ID if member not found
    }, [memberDetails]);

    // Initialize ClanChatService
    useEffect(() => {
        const service = new ClanChatService(currentUserId, clanId);
        setClanChatService(service);

        // Set up event listeners
        service.on('message', handleNewMessage);
        service.on('typing_started', handleTypingStarted);
        service.on('typing_stopped', handleTypingStopped);
        service.on('message_sent', handleMessageSent);
        service.on('delivery_confirmed', handleDeliveryConfirmed);
        service.on('read_receipt', handleReadReceipt);
        service.on('message_deleted', handleMessageDeleted);
        service.on('message_status', handleMessageStatus);
        service.on('delivery_details', handleDeliveryDetails);
        service.on('recent_messages', handleRecentMessages);
        service.on('more_messages', handleMoreMessages);
        service.on('connected', () => setConnectionStatus('connected'));
        service.on('disconnected', () => setConnectionStatus('disconnected'));

        // Connect to WebSocket
        service.connect();

        // Load existing messages from database
        setTimeout(() => {
            service.requestRecentMessages();
        }, 1000);

        return () => {
            service.disconnect();
        };
    }, [currentUserId, clanId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle new message - Fixed to prevent duplicates and update optimistic messages
    const handleNewMessage = useCallback((message: Message) => {
        console.log('📨 Handling new message:', message.id, message.content);

        // Check if message already exists to prevent duplicates
        setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === message.id);
            if (messageExists) {
                console.log('⚠️ Message already exists, skipping duplicate:', message.id);
                return prev;
            }

            // Check if this is a broadcasted version of our optimistic message
            const optimisticMessageIndex = prev.findIndex(msg =>
                msg.content === message.content &&
                msg.userId === message.userId &&
                msg.id.startsWith('temp_')
            );

            if (optimisticMessageIndex !== -1) {
                console.log('✅ Updating optimistic message with real ID:', message.id);
                // Replace optimistic message with real message
                const newMessages = [...prev];
                newMessages[optimisticMessageIndex] = {
                    ...message,
                    isDelivered: true // Broadcasted messages are delivered
                };
                return newMessages;
            }

            console.log('✅ Adding new message to state:', message.id);
            return [...prev, message];
        });

        // Auto-mark as read if it's NOT our own message (like WhatsApp)
        if (message.userId !== currentUserId) {
            console.log('👁️ Auto-marking message as read:', message.id, 'from user:', message.userId);
            clanChatService?.markMessageAsRead(message.id);
        }
    }, [currentUserId, clanChatService]);

    // Handle typing indicators
    const handleTypingStarted = useCallback((data: { userId: string; clanId: string }) => {
        console.log('⌨️ Typing started received:', data);
        if (data.userId !== currentUserId) {
            console.log('✅ Adding typing user:', data.userId);
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.add(data.userId);
                console.log('📝 Current typing users:', Array.from(newSet));
                return newSet;
            });
        }
    }, [currentUserId]);

    const handleTypingStopped = useCallback((data: { userId: string; clanId: string }) => {
        console.log('⌨️ Typing stopped received:', data);
        setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            console.log('✅ Removed typing user:', data.userId);
            console.log('📝 Current typing users:', Array.from(newSet));
            return newSet;
        });
    }, []);

    // Handle message status updates
    const handleMessageStatus = useCallback((status: MessageStatus) => {
        setMessageStatuses(prev => new Map(prev).set(status.messageId, status));
    }, []);

    // Handle delivery details
    const handleDeliveryDetails = useCallback((data: { messageId: string; details: DeliveryDetails }) => {
        setDeliveryDetails(prev => new Map(prev).set(data.messageId, data.details));
    }, []);

    // Handle message sent confirmation - Fixed to update message status
    const handleMessageSent = useCallback((data: any) => {
        console.log('✅ Message sent confirmation received:', data);

        // Update the message status to show it's delivered
        if (data.messageId) {
            console.log('🔄 Updating message status for:', data.messageId);
            setMessages(prev => prev.map(msg => {
                // Match by content and userId for recently sent messages
                if (msg.content === data.content && msg.userId === currentUserId) {
                    console.log('✅ Updating message:', msg.id, 'to delivered status with new ID:', data.messageId);
                    return {
                        ...msg,
                        id: data.messageId, // Use the real message ID from server
                        isDelivered: true,
                        deliveredAt: data.timestamp
                    };
                }
                return msg;
            }));
        }
    }, [currentUserId]);

    // Handle delivery confirmation - Fixed to update message status
    const handleDeliveryConfirmed = useCallback((data: any) => {
        console.log('📨 Delivery confirmed received:', data);

        // Update message delivery status
        if (data.messageId) {
            console.log('🔄 Updating delivery status for:', data.messageId);
            setMessages(prev => prev.map(msg => {
                // Match by message ID first, then by content and userId for recently sent messages
                if (msg.id === data.messageId || (msg.content === data.content && msg.userId === currentUserId)) {
                    console.log('✅ Updating message delivery:', msg.id);
                    return {
                        ...msg,
                        isDelivered: true,
                        deliveredAt: data.timestamp
                    };
                }
                return msg;
            }));
        }
    }, [currentUserId]);

    // Handle read receipt - Fixed to update message status
    const handleReadReceipt = useCallback((data: any) => {
        console.log('👁️ Read receipt:', data);

        // Update message read status
        if (data.messageId) {
            setMessages(prev => prev.map(msg => {
                // Match by message ID first, then by content and userId for recently sent messages
                if (msg.id === data.messageId || (msg.content === data.content && msg.userId === currentUserId)) {
                    const readBy = msg.readBy || [];
                    const readAt = msg.readAt || [];

                    if (!readBy.includes(data.readBy)) {
                        readBy.push(data.readBy);
                        readAt.push(data.timestamp);
                    }

                    return {
                        ...msg,
                        readBy,
                        readAt
                    };
                }
                return msg;
            }));
        }
    }, [currentUserId]);

    // Handle message deleted
    const handleMessageDeleted = useCallback((data: any) => {
        setMessages(prev => prev.filter(msg => {
            // Match by message ID first, then by content and userId for recently sent messages
            return !(msg.id === data.messageId || (msg.content === data.content && msg.userId === currentUserId));
        }));
    }, [currentUserId]);

    // Handle recent messages (message history from database) - Updated with pagination logic
    const handleRecentMessages = useCallback((data: { messages: Message[] }) => {
        console.log('📚 Received recent messages:', data);
        console.log('📚 Messages array:', data.messages);
        console.log('📚 Messages count:', data.messages?.length || 0);

        if (data.messages && Array.isArray(data.messages)) {
            console.log('✅ Setting messages in state:', data.messages);

            // Extract unique user IDs for debugging
            const userIds = Array.from(new Set(data.messages.map(msg => msg.userId)));
            console.log('👥 Unique user IDs found:', userIds);
            console.log('👥 Available member details:', memberDetails.length);

            setMessages(data.messages);

            // Set pagination state - if we got 20 messages, there might be more
            if (data.messages.length === 20) {
                setHasMoreMessages(true);
                console.log('📚 Likely more messages available, pagination enabled');
            } else {
                setHasMoreMessages(false);
                console.log('📚 All messages loaded, pagination disabled');
            }

            // Auto-mark all other users' messages as read (like WhatsApp)
            setTimeout(() => {
                data.messages.forEach(message => {
                    if (message.userId !== currentUserId && !message.readBy?.includes(currentUserId)) {
                        console.log('👁️ Auto-marking historical message as read:', message.id, 'from user:', message.userId);
                        clanChatService?.markMessageAsRead(message.id);
                    }
                });
            }, 1000); // Small delay to ensure chat service is ready
        } else {
            console.warn('⚠️ Invalid messages data received:', data);
        }
    }, [memberDetails, currentUserId, clanChatService]);

    // Handle more messages (pagination) - Fixed to prepend older messages
    const handleMoreMessages = useCallback((data: { messages: Message[], page: number, limit: number }) => {
        console.log('📚 Received more messages:', data);
        console.log('📚 More messages array:', data.messages);
        console.log('📚 More messages count:', data.messages?.length || 0);
        console.log('📚 Page:', data.page, 'Limit:', data.limit);

        if (data.messages && Array.isArray(data.messages)) {
            console.log('✅ Prepending more messages to state:', data.messages);

            // Prepend older messages (they come in reverse chronological order)
            setMessages(prev => [...data.messages, ...prev]);

            // If we got fewer messages than requested, we've reached the end
            if (data.messages.length < data.limit) {
                setHasMoreMessages(false);
                console.log('📚 Reached end of messages');
            }
        } else {
            console.warn('⚠️ Invalid more messages data received:', data);
        }
    }, []);

    // Send message - Fixed to properly handle typing state
    const sendMessage = useCallback(() => {
        if (!inputValue.trim() || !clanChatService) return;

        const messageContent = inputValue.trim();
        const tempMessageId = `temp_${Date.now()}_${currentUserId}`;

        // Add optimistic message to show immediate feedback
        const optimisticMessage: Message = {
            id: tempMessageId,
            content: messageContent,
            userId: currentUserId,
            messageType: 'TEXT',
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            isDelivered: false
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setInputValue('');

        // Immediately stop typing when message is sent
        setIsTyping(false);
        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = undefined;
        }
        // Send typing stopped indicator
        clanChatService.sendTypingIndicator(false);

        // Send message to server
        const success = clanChatService.sendMessage(messageContent);
        if (!success) {
            // If sending failed, remove the optimistic message
            setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        }
    }, [inputValue, clanChatService, currentUserId]);

    // Handle typing - Fixed to properly manage typing state with debouncing
    const handleTyping = useCallback(() => {
        if (!clanChatService) return;

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // If not already typing, start typing
        if (!isTyping) {
            setIsTyping(true);
            clanChatService.sendTypingIndicator(true);
        }

        // Set new timeout to stop typing (debounced)
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            clanChatService.sendTypingIndicator(false);
            typingTimeoutRef.current = undefined;
        }, 2000); // Reduced from 3000ms to 2000ms for better responsiveness
    }, [isTyping, clanChatService]);

    // Debounced typing handler to prevent excessive typing indicators
    const debouncedTyping = useCallback(
        debounce(() => {
            if (clanChatService && isTyping) {
                clanChatService.sendTypingIndicator(true);
            }
        }, 500), // Only send typing indicator every 500ms
        [clanChatService, isTyping]
    );

    // Delete message
    const deleteMessage = useCallback((messageId: string) => {
        if (confirm('Are you sure you want to delete this message?')) {
            clanChatService?.deleteMessage(messageId);
        }
    }, [clanChatService]);

    // Get message status
    const getMessageStatus = useCallback(async (messageId: string) => {
        if (!clanChatService) return;

        const status = await clanChatService.getMessageStatus(messageId);
        if (status && typeof status === 'object' && 'messageId' in status) {
            setMessageStatuses(prev => new Map(prev).set(messageId, status as MessageStatus));
        }
    }, [clanChatService]);

    // Get delivery details
    const getDeliveryDetails = useCallback(async (messageId: string) => {
        if (!clanChatService) return;

        const details = await clanChatService.getDeliveryDetails(messageId);
        if (details && typeof details === 'object' && 'messageId' in details) {
            setDeliveryDetails(prev => new Map(prev).set(messageId, details as DeliveryDetails));
        }
    }, [clanChatService]);

    // Check if message seen by all
    const checkMessageSeenByAll = useCallback(async (messageId: string): Promise<boolean> => {
        if (!clanChatService) return false;

        try {
            return await clanChatService.checkMessageSeenByAll(messageId);
        } catch (error) {
            console.error('Error checking message seen by all:', error);
            return false;
        }
    }, [clanChatService]);

    // Get read receipts
    const getReadReceipts = useCallback(async (messageId: string) => {
        if (!clanChatService) return [];

        return await clanChatService.getReadReceipts(messageId);
    }, [clanChatService]);

    // Check and update message read status manually
    const checkAndUpdateMessageReadStatus = useCallback(async (messageId: string) => {
        if (!clanChatService) return;

        try {
            console.log('🔍 Manually checking read status for message:', messageId);

            // Get read receipts from the service
            const readReceipts = await clanChatService.getReadReceipts(messageId);
            console.log('📋 Read receipts received:', readReceipts);

            if (readReceipts && Array.isArray(readReceipts) && readReceipts.length > 0) {
                // Update the message with read receipts
                setMessages(prev => prev.map(msg => {
                    if (msg.id === messageId) {
                        const readBy = readReceipts.map(receipt => receipt.userId || receipt.readBy);
                        const readAt = readReceipts.map(receipt => receipt.timestamp || receipt.readAt);

                        console.log('✅ Updating message read status:', messageId, 'Readers:', readBy);

                        return {
                            ...msg,
                            readBy,
                            readAt,
                            isDelivered: true
                        };
                    }
                    return msg;
                }));
            }
        } catch (error) {
            console.error('❌ Error checking message read status:', error);
        }
    }, [clanChatService]);

    // Format timestamp - WhatsApp style: only time for messages
    const formatTimestamp = (timestamp: string | Date) => {
        try {
            let date: Date;

            if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            } else {
                date = timestamp;
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('⚠️ Invalid timestamp received:', timestamp);
                return 'Invalid Date';
            }

            // WhatsApp style: only show time (HH:MM format)
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Use 24-hour format like WhatsApp
            });
        } catch (error) {
            console.error('❌ Error formatting timestamp:', error, timestamp);
            return 'Invalid Date';
        }
    };

    // Format date for separators - WhatsApp style
    const formatDateSeparator = (timestamp: string | Date) => {
        try {
            let date: Date;

            if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            } else {
                date = timestamp;
            }

            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / 86400000);

            // Today
            if (diffDays === 0) {
                return 'Today';
            }
            // Yesterday
            if (diffDays === 1) {
                return 'Yesterday';
            }
            // This week
            if (diffDays < 7) {
                return date.toLocaleDateString('en-US', { weekday: 'long' });
            }
            // Older dates
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Check if we need to show a date separator
    const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
        if (!previousMessage) return true;

        const currentDate = new Date(currentMessage.createdAt || currentMessage.timestamp || new Date());
        const previousDate = new Date(previousMessage.createdAt || previousMessage.timestamp || new Date());

        // Show separator if dates are different
        return currentDate.toDateString() !== previousDate.toDateString();
    };

    // Message status function removed - using inline status display instead

    // Add lazy loading functionality
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const messagesTopRef = useRef<HTMLDivElement>(null);

    // Load more messages when scrolling to top
    const loadMoreMessages = useCallback(async () => {
        if (isLoadingMore || !hasMoreMessages || !clanChatService) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            console.log(`📚 Loading more messages, page ${nextPage}...`);

            // Request more messages from the service
            const success = await clanChatService.requestMoreMessages(nextPage, 20);

            if (success) {
                setCurrentPage(nextPage);
                console.log(`✅ Loaded more messages, page ${nextPage}`);
            } else {
                setHasMoreMessages(false);
                console.log('📚 No more messages to load');
            }
        } catch (error) {
            console.error('❌ Error loading more messages:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMoreMessages, currentPage, clanChatService]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && hasMoreMessages && !isLoadingMore) {
                        loadMoreMessages();
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (messagesTopRef.current) {
            observer.observe(messagesTopRef.current);
        }

        return () => observer.disconnect();
    }, [loadMoreMessages, hasMoreMessages, isLoadingMore]);

    // Reset pagination when clan changes
    useEffect(() => {
        setCurrentPage(1);
        setHasMoreMessages(true);
        setMessages([]);
    }, [clanId]);

    // Cleanup typing indicators and timeouts on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Stop typing when component unmounts
            if (clanChatService && isTyping) {
                clanChatService.sendTypingIndicator(false);
            }
        };
    }, [clanChatService, isTyping]);

    // Add keyboard support for modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedMessage) {
                setSelectedMessage(null);
            }
        };

        if (selectedMessage) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [selectedMessage]);

    // Modal function removed - using inline message details instead

    // Add periodic read status check
    useEffect(() => {
        if (!clanChatService || messages.length === 0) return;

        const interval = setInterval(() => {
            // Check read status for all delivered messages from current user
            messages.forEach(msg => {
                if (msg.userId === currentUserId && msg.isDelivered && (!msg.readBy || msg.readBy.length === 0)) {
                    console.log('🔄 Periodic check: Checking read status for message:', msg.id);
                    checkAndUpdateMessageReadStatus(msg.id);
                }
            });
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [clanChatService, messages, currentUserId, checkAndUpdateMessageReadStatus]);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-100">
            {/* Header - WhatsApp Style */}
            <div className="bg-green-600 text-white p-4 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-xl">🏛️</span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">{clanName}</h1>
                        <div className="flex items-center gap-2 text-sm text-green-100">
                            <div className={`w-2 h-2 rounded-full connection-indicator ${connectionStatus === 'connected' ? 'bg-green-300 connected' : 'bg-yellow-300'}`} />
                            <span className="capitalize">{connectionStatus}</span>
                            <span>•</span>
                            <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            console.log('🔄 Manually requesting recent messages...');
                            clanChatService?.requestRecentMessages();
                        }}
                        className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                        title="Load Messages"
                    >
                        📚
                    </button>
                    <button
                        onClick={() => {
                            console.log('🔄 Manually checking read status for all messages...');
                            messages.forEach(msg => {
                                if (msg.userId === currentUserId && msg.isDelivered) {
                                    checkAndUpdateMessageReadStatus(msg.id);
                                }
                            });
                        }}
                        className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                        title="Check Read Status"
                    >
                        👁️
                    </button>
                </div>
            </div>

            {/* Messages Container - WhatsApp Style */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 messages-container">
                {/* Loading more messages indicator */}
                {isLoadingMore && (
                    <div className="flex justify-center py-4">
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-sm">Loading more messages...</span>
                        </div>
                    </div>
                )}

                {/* Message count indicator */}
                {messages.length === 0 && (
                    <div className="text-center py-8 empty-state">
                        <div className="text-gray-400 mb-2">
                            <div className="text-4xl mb-2">💬</div>
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="text-sm">Click the 📚 button to load chat history</p>
                        </div>
                    </div>
                )}

                {/* Top reference for lazy loading */}
                <div ref={messagesTopRef} className="h-1" />

                {messages.map((message, index) => {
                    const isOwnMessage = message.userId === currentUserId;
                    const showUsername = index === 0 ||
                        (index > 0 && messages[index - 1].userId !== message.userId);
                    const isLastInGroup = index === messages.length - 1 ||
                        (index < messages.length - 1 && messages[index + 1].userId !== message.userId);

                    return (
                        <React.Fragment key={message.id}>
                            {/* Date Separator - WhatsApp Style */}
                            {shouldShowDateSeparator(message, index > 0 ? messages[index - 1] : undefined) && (
                                <div className="date-separator">
                                    <div className="date-separator-content">
                                        {formatDateSeparator(message.createdAt || message.timestamp || new Date())}
                                    </div>
                                </div>
                            )}

                            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} message-group`}>
                                <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                    {/* Avatar and Username */}
                                    <div className={`flex items-start gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                                            {isOwnMessage ? 'You' : getUserDisplayName(message.userId).charAt(0).toUpperCase()}
                                        </div>

                                        {/* Username - only show for first message in group */}
                                        {showUsername && (
                                            <div className="text-xs font-medium text-gray-600 mb-1">
                                                {getUserDisplayName(message.userId)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message bubble */}
                                    <div className={`relative group ${isOwnMessage ? 'ml-auto' : 'mr-auto'} message-bubble`}>
                                        <div
                                            className={`px-4 py-2 rounded-2xl shadow-sm w-fit max-w-full break-words ${isOwnMessage
                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                                                }`}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                const messageWithPosition = {
                                                    ...message,
                                                    contextMenuPosition: { x: e.clientX, y: e.clientY }
                                                };
                                                setSelectedMessage(messageWithPosition);
                                            }}
                                            onTouchStart={(e) => {
                                                // Mobile-friendly: show context menu on touch
                                                const touch = e.touches[0];
                                                const messageWithPosition = {
                                                    ...message,
                                                    contextMenuPosition: { x: touch.clientX, y: touch.clientY }
                                                };
                                                setSelectedMessage(messageWithPosition);
                                            }}
                                            title="Right-click or tap for options"
                                        >
                                            {/* Message content */}
                                            <div className="mb-1">
                                                {message.isDeleted ? (
                                                    <em className="italic opacity-70">Message deleted</em>
                                                ) : (
                                                    message.content
                                                )}
                                            </div>

                                            {/* Message status - only for own messages */}
                                            {isOwnMessage && (
                                                <div className="flex items-center justify-end gap-1 text-xs text-blue-100">
                                                    {message.readBy && message.readBy.length > 0 ? (
                                                        <span className="text-blue-200">✓✓ {message.readBy.length} seen</span>
                                                    ) : message.isDelivered ? (
                                                        <span className="text-blue-200">✓ Delivered</span>
                                                    ) : (
                                                        <span className="text-blue-200">⏳ Sending...</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Message actions - show on hover */}
                                        {message.userId === currentUserId && !message.isDeleted && (
                                            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} 
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-lg shadow-lg p-1 border message-actions`}>
                                                <button
                                                    onClick={() => deleteMessage(message.id)}
                                                    className="block w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                {/* Typing indicators */}
                {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                                </div>
                                <span className="text-sm text-gray-600 ml-2">
                                    {Array.from(typingUsers).map(userId =>
                                        getUserDisplayName(userId)
                                    ).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Debug: Show typing users count
                {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400 ml-4">
                        Debug: {typingUsers.size} typing user(s): {Array.from(typingUsers).join(', ')}
                    </div>
                )} */}

                <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
            {selectedMessage && selectedMessage.contextMenuPosition && (
                <div className="fixed inset-0 z-50" onClick={() => setSelectedMessage(null)}>
                    <div
                        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[200px]"
                        style={{
                            top: selectedMessage.contextMenuPosition.y,
                            left: selectedMessage.contextMenuPosition.x,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Timestamp */}
                        <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-200">
                            {formatTimestamp(selectedMessage.createdAt || selectedMessage.timestamp || new Date())}
                        </div>

                        {/* Menu Options */}
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    // Forward functionality would go here
                                    console.log('Forward message:', selectedMessage.id);
                                    setSelectedMessage(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Forward
                            </button>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedMessage.content);
                                    setSelectedMessage(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                            </button>

                            {selectedMessage.userId === currentUserId && !selectedMessage.isDeleted && (
                                <button
                                    onClick={() => {
                                        deleteMessage(selectedMessage.id);
                                        setSelectedMessage(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Input Container - WhatsApp Style - Fixed positioning above navigation */}
            <div className="bg-white border-t border-gray-200 p-4 pb-6 clan-chat-input">
                <div className="flex items-end gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-end input-field">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                // Only trigger typing if there's actual content
                                if (e.target.value.trim()) {
                                    handleTyping();
                                } else {
                                    // If input is empty, stop typing immediately
                                    setIsTyping(false);
                                    if (typingTimeoutRef.current) {
                                        clearTimeout(typingTimeoutRef.current);
                                        typingTimeoutRef.current = undefined;
                                    }
                                    clanChatService?.sendTypingIndicator(false);
                                }
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            onBlur={() => {
                                // Stop typing when input loses focus
                                setIsTyping(false);
                                if (typingTimeoutRef.current) {
                                    clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = undefined;
                                }
                                clanChatService?.sendTypingIndicator(false);
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-500"
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim()}
                        className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md send-button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>

                {/* Typing indicator */}
                {isTyping && (
                    <div className="text-xs text-gray-500 mt-2 ml-4">
                        You are typing...
                    </div>
                )}
            </div>

            {/* Read Receipt Modal */}
            {/* Modal removed - using inline message details instead */}
        </div>
    );
};

export default ClanChatAdvanced;
