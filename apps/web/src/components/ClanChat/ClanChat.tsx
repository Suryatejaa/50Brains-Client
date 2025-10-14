import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClanChatService } from '../../services/clanChat/ClanChatService';
import { WebSocketManager } from '../../services/websocket/WebSocketManager';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import './ClanChat.css';

interface ClanChatProps {
  userId: string;
  clanId: string;
  clanName: string;
  memberDetails?: Array<{
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
    location?: string;
    email?: string;
    roles?: string[];
  }>;
}

export const ClanChat: React.FC<ClanChatProps> = ({ userId, clanId, clanName, memberDetails = [] }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [useMockServer, setUseMockServer] = useState(false);
  const [messageInfo, setMessageInfo] = useState<{
    message: any;
    position: { x: number; y: number };
    show: boolean;
  } | null>(null);

  // Lazy loading state
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  const chatServiceRef = useRef<ClanChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track which messages have been marked as read to prevent duplicates
  const readMessagesRef = useRef<Set<string>>(new Set());

  // Helper function to get display name for a user ID
  const getDisplayName = (userId: string): string => {
    if (userId === 'system') return 'System';

    const member = memberDetails.find(m => m.id === userId);
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

    return userId; // Fallback to user ID if no member details found
  };

  // Convert messages to simple format for rendering
  const renderMessages = () => {
    return messages.map((message, index) => {
      const isOwnMessage = message.userId === userId;
      const isFirstInGroup = index === 0 ||
        (index > 0 && messages[index - 1].userId !== message.userId) ||
        message.userId === 'system';

      // Get message status for display
      const getMessageStatus = () => {
        if (message.isLocal) return '↻'; // Sending
        if (message.isDelivered && message.readBy?.length > 0) return '✓✓'; // Read
        if (message.isDelivered) return '✓'; // Delivered
        return '↻'; // Sending (fallback)
      };

      return (
        <div key={message.id || index} className={`message-wrapper ${isFirstInGroup ? 'first-in-group' : 'consecutive'}`} data-message-id={message.id || index}>
          {isFirstInGroup && !isOwnMessage && message.userId !== 'system' && (
            <div className="message-username">
              {getDisplayName(message.userId)}
            </div>
          )}
          <div
            className={`message ${isOwnMessage ? 'own' : 'other'} ${isFirstInGroup ? 'first' : 'consecutive'}`}
            onTouchStart={(e) => handleMessageLongPress(message, e)}
            onContextMenu={(e) => handleMessageRightClick(message, e)}
            onMouseDown={() => handleMessageMouseDown(message)}
            onMouseUp={handleMessageMouseUp}
            onMouseLeave={handleMessageMouseUp}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-footer">
              <span className="timestamp">
                {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {isOwnMessage && (
                <span className="message-status">
                  {getMessageStatus()}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  // Initialize chat service
  useEffect(() => {
    console.log('🔌 ClanChat: Initializing chat service for user:', userId, 'clan:', clanId);

    chatServiceRef.current = new ClanChatService(userId, clanId);

    // Connection health monitoring
    let connectionHealthInterval: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const startConnectionHealthCheck = () => {
      connectionHealthInterval = setInterval(() => {
        if (chatServiceRef.current) {
          const status = chatServiceRef.current.getConnectionStatus();
          console.log('💓 ClanChat: Connection health check - Status:', status);

          if (status === 'disconnected' && reconnectAttempts < maxReconnectAttempts) {
            console.log('🔄 ClanChat: Connection lost, attempting reconnection...');
            reconnectAttempts++;
            chatServiceRef.current.connect().catch(error => {
              console.error('❌ ClanChat: Reconnection attempt failed:', error);
            });
          } else if (status === 'connected') {
            reconnectAttempts = 0; // Reset counter on successful connection
          }
        }
      }, 5000); // Check every 5 seconds
    };

    // Enhanced event listeners with better error handling
    const setupEventListeners = () => {
      if (!chatServiceRef.current) return;

      const unsubscribeMessage = chatServiceRef.current.on('message', (message: any) => {
        console.log('📨 ClanChat: Received message:', message);

        // Check if this message matches a local message we sent
        setMessages(prev => {
          const existingLocalIndex = prev.findIndex(msg =>
            msg.isLocal &&
            msg.content === message.content &&
            msg.userId === message.userId &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000 // Within 5 seconds
          );

          if (existingLocalIndex !== -1) {
            console.log('🔄 ClanChat: Replacing local message with real message:', message.id);
            // Replace local message with real message and mark as delivered
            const newMessages = [...prev];
            newMessages[existingLocalIndex] = {
              ...message,
              isLocal: false,
              isDelivered: true, // Mark as delivered since we received it
              deliveredAt: new Date().toISOString()
            };
            return newMessages;
          } else {
            // Add new message and sort by timestamp to maintain proper order
            const newMessages = [...prev, { ...message, isLocal: false, isDelivered: true }];
            return newMessages.sort((a, b) =>
              new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime()
            );
          }
        });

        // Force scroll to bottom for new messages with delay
        setTimeout(() => {
          forceScrollToBottom();
        }, 100);

        // Send delivery confirmation for incoming messages
        if (message.userId !== userId && chatServiceRef.current) {
          try {
            chatServiceRef.current.sendDeliveryConfirmation(message.id);
          } catch (error) {
            console.error('❌ ClanChat: Failed to send delivery confirmation:', error);
          }
        }
      });

      const unsubscribeMessageSent = chatServiceRef.current.on('message_sent', (data: any) => {
        console.log('✅ ClanChat: Message sent confirmation:', data);
        // Update local message status to delivered
        setMessages(prev => prev.map(msg => {
          if (msg.isLocal && msg.content === data.content) {
            console.log('✅ ClanChat: Marking local message as sent:', msg.id);
            return {
              ...msg,
              isLocal: false,
              isDelivered: true,
              deliveredAt: new Date().toISOString()
            };
          }
          return msg;
        }));
      });

      const unsubscribeDeliveryConfirmed = chatServiceRef.current.on('delivery_confirmed', (data: any) => {
        console.log('📬 ClanChat: Delivery confirmed:', data);
        // Update message delivery status
        setMessages(prev => prev.map(msg => {
          if (msg.id === data.messageId || (msg.isLocal && msg.content === data.content)) {
            console.log('✅ ClanChat: Updating message delivery status:', msg.id || 'local');
            return {
              ...msg,
              isDelivered: true,
              deliveredAt: data.timestamp,
              isLocal: false // Mark as no longer local
            };
          }
          return msg;
        }));
      });

      const unsubscribeReadReceipt = chatServiceRef.current.on('read_receipt', (data: any) => {
        console.log('👁️ ClanChat: Read receipt received:', data);
        // Update message read status with deduplication
        setMessages(prev => prev.map(msg => {
          if (msg.id === data.messageId || (msg.content === data.content && msg.userId === data.readBy)) {
            // Check if this user has already been marked as reading this message
            if (msg.readBy && msg.readBy.includes(data.readBy)) {
              console.log('👁️ ClanChat: User already marked as reading message:', data.readBy);
              return msg; // No change needed
            }

            console.log('👁️ ClanChat: Updating message read status:', msg.id || 'local');
            return {
              ...msg,
              readBy: [...(msg.readBy || []), data.readBy],
              readAt: [...(msg.readAt || []), data.timestamp]
            };
          }
          return msg;
        }));
      });

      const unsubscribeMessageDeleted = chatServiceRef.current.on('message_deleted', (data: any) => {
        console.log('🗑️ ClanChat: Message deleted:', data);
        // Remove deleted message from UI
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      });

      const unsubscribeMessageStatus = chatServiceRef.current.on('message_status', (data: any) => {
        console.log('📊 ClanChat: Message status update:', data);
        // Update message with full status information
        setMessages(prev => prev.map(msg => {
          if (msg.id === data.messageId || (msg.isLocal && msg.content === data.content)) {
            console.log('📊 ClanChat: Updating message status:', msg.id || 'local');
            return {
              ...msg,
              isDelivered: data.isDelivered || msg.isDelivered,
              deliveredAt: data.deliveredAt || msg.deliveredAt,
              readCount: data.readCount || msg.readCount,
              readBy: data.readBy || msg.readBy,
              readAt: data.readAt || msg.readAt,
              isDeleted: data.isDeleted || msg.isDeleted,
              deletedAt: data.deletedAt || msg.deletedAt,
              deletedBy: data.deletedBy || msg.deletedBy,
              isLocal: false // Mark as no longer local when we get status
            };
          }
          return msg;
        }));
      });

      const unsubscribeTypingStarted = chatServiceRef.current.on('typing_started', ({ userId: typingUserId }: { userId: string }) => {
        console.log('⌨️ ClanChat: User started typing:', typingUserId);
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(typingUserId);
          return newSet;
        });

        // Force scroll to bottom when someone starts typing
        setTimeout(() => {
          forceScrollToBottom();
        }, 100);
      });

      const unsubscribeTypingStopped = chatServiceRef.current.on('typing_stopped', ({ userId: typingUserId }: { userId: string }) => {
        console.log('⌨️ ClanChat: User stopped typing:', typingUserId);
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(typingUserId);
          return newSet;
        });
      });

      const unsubscribeRecentMessages = chatServiceRef.current.on('recent_messages', (recentMessages: any[]) => {
        console.log('📚 ClanChat: Received recent messages:', recentMessages);
        // Sort recent messages by timestamp to ensure proper order and add proper status
        const sortedRecentMessages = recentMessages.map(msg => ({
          ...msg,
          isLocal: false,
          isDelivered: true, // Assume delivered if we received them
          deliveredAt: msg.deliveredAt || msg.timestamp || msg.createdAt
        })).sort((a, b) =>
          new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime()
        );
        setMessages(sortedRecentMessages);

        // Force scroll to bottom after loading recent messages
        setTimeout(() => {
          forceScrollToBottom();
        }, 200);
      });

      const unsubscribeSystemMessage = chatServiceRef.current.on('system_message', (message: any) => {
        console.log('🔔 ClanChat: System message:', message);
      });

      // Return cleanup function
      return () => {
        unsubscribeMessage();
        unsubscribeMessageSent();
        unsubscribeDeliveryConfirmed();
        unsubscribeReadReceipt();
        unsubscribeMessageDeleted();
        unsubscribeMessageStatus();
        unsubscribeTypingStarted();
        unsubscribeTypingStopped();
        unsubscribeRecentMessages();
        unsubscribeSystemMessage();
      };
    };

    // Set up event listeners
    const cleanupEventListeners = setupEventListeners();

    // Connect to chat with retry logic
    const connectWithRetry = async () => {
      try {
        console.log('🔌 ClanChat: Attempting to connect...');
        await chatServiceRef.current?.connect();
        console.log('✅ ClanChat: Successfully connected to chat service');
        setConnectionStatus('connected');
        reconnectAttempts = 0; // Reset retry counter

        // Clear any stale messages when reconnecting
        setMessages([]);

        // Load demo messages for testing (only if no real messages)
        // TODO: Implement demo messages functionality
        // if (chatServiceRef.current) {
        //   const demoMessages = chatServiceRef.current.getDemoMessages();
        //   console.log('🎭 ClanChat: Loading demo messages:', demoMessages);
        //   // Sort demo messages by timestamp to ensure proper order and add proper status
        //   const sortedDemoMessages = demoMessages.map(msg => ({
        //     ...msg,
        //     isLocal: false,
        //     isDelivered: true, // Demo messages are considered delivered
        //     deliveredAt: msg.deliveredAt || msg.timestamp || msg.createdAt
        //   })).sort((a, b) =>
        //     new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime()
        //   );
        //   setMessages(sortedDemoMessages);

        //   // Force scroll to bottom after loading demo messages
        //   setTimeout(() => {
        //     forceScrollToBottom();
        //   }, 300);
        // }
      } catch (error) {
        console.error('❌ ClanChat: Failed to connect:', error);
        setConnectionStatus('disconnected');

        // Retry connection after delay
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            console.log('🔄 ClanChat: Retrying connection...');
            connectWithRetry();
          }, 2000 * (reconnectAttempts + 1)); // Exponential backoff
        }
      }
    };

    // Initial connection
    connectWithRetry();

    // Start connection health monitoring
    startConnectionHealthCheck();

    // Set up connection status polling
    const statusInterval = setInterval(() => {
      if (chatServiceRef.current) {
        const status = chatServiceRef.current.getConnectionStatus();
        setConnectionStatus(status);
        console.log('🔍 ClanChat: Connection status check:', status);
      }
    }, 2000);

    return () => {
      console.log('🧹 ClanChat: Cleaning up chat service');

      // Clean up event listeners
      if (cleanupEventListeners) {
        cleanupEventListeners();
      }

      // Clear intervals
      clearInterval(statusInterval);
      clearInterval(connectionHealthInterval);

      // Reset read messages tracking
      readMessagesRef.current.clear();

      // Disconnect service
      chatServiceRef.current?.disconnect();
    };
  }, [userId, clanId]);

  // Auto-scroll to bottom
  useEffect(() => {
    // Always scroll to bottom when messages change
    if (messagesEndRef.current) {
      // Use a small delay to ensure DOM is fully updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // Auto-scroll when typing indicators change
  useEffect(() => {
    if (typingUsers.size > 0 && messagesEndRef.current) {
      // Scroll to bottom when someone starts typing
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [typingUsers]);

  // Auto-scroll when connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected' && messagesEndRef.current) {
      // Scroll to bottom when connection is established
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [connectionStatus]);

  // Force scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Auto-scroll to bottom with delay for better UX
  const autoScrollToBottom = useCallback(() => {
    // Longer delay to ensure DOM is updated
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      // Also scroll the messages container directly as backup
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 150);
  }, []);

  // Force scroll to bottom with multiple methods
  const forceScrollToBottom = useCallback(() => {
    // Method 1: Scroll to end ref
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Method 2: Direct container scroll
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }

    // Method 3: Window scroll as last resort
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }, []);

  // Handle scroll to detect when to load older messages
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || isLoadingOlderMessages || !hasMoreMessages) return;

    const { scrollTop } = messagesContainerRef.current;

    // If user scrolls up near the top (within 100px), load older messages
    if (scrollTop < 100) {
      loadOlderMessages();
    }

    // Save scroll position for restoration
    setScrollPosition(scrollTop);
  }, [isLoadingOlderMessages, hasMoreMessages]);

  // Load older messages
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlderMessages || !hasMoreMessages || !chatServiceRef.current) return;

    console.log('📚 ClanChat: Loading older messages, page:', currentPage + 1);
    setIsLoadingOlderMessages(true);

    try {
      // Store current scroll position
      const currentScrollTop = messagesContainerRef.current?.scrollTop || 0;
      const currentScrollHeight = messagesContainerRef.current?.scrollHeight || 0;

      // Request older messages from the service
      // TODO: Implement getOlderMessages functionality
      // const olderMessages = await chatServiceRef.current.getOlderMessages(currentPage + 1, 20);

      // if (olderMessages && olderMessages.length > 0) {
      //   console.log('📚 ClanChat: Received older messages:', olderMessages.length);

      //   // Add older messages to the beginning of the list (they should be at the top)
      //   setMessages(prev => [...olderMessages, ...prev]);
      //   setCurrentPage(prev => prev + 1);

      //   // Restore scroll position after adding older messages
      //   setTimeout(() => {
      //     if (messagesContainerRef.current) {
      //       const newScrollHeight = messagesContainerRef.current.scrollHeight;
      //       const heightDifference = newScrollHeight - currentScrollHeight;
      //       messagesContainerRef.current.scrollTop = currentScrollTop + heightDifference;
      //     }
      //   }, 100);
      // } else {
      //   console.log('📚 ClanChat: No more older messages available');
      //   setHasMoreMessages(false);
      // }
    } catch (error) {
      console.error('❌ ClanChat: Error loading older messages:', error);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  }, [currentPage, isLoadingOlderMessages, hasMoreMessages]);

  // Mark messages as read when they come into view
  useEffect(() => {
    // Create a single observer instance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId && chatServiceRef.current) {
              // Mark message as read if it's not our own message
              const message = messages.find(m => m.id === messageId);
              if (message && message.userId !== userId && !message.isLocal) {
                // Check if we've already marked this message as read to prevent duplicates
                if (!message.readBy?.includes(userId) && !readMessagesRef.current.has(messageId)) {
                  console.log('👁️ ClanChat: Marking message as read:', messageId);

                  // Add to read messages set to prevent duplicates
                  readMessagesRef.current.add(messageId);

                  chatServiceRef.current.markMessageAsRead(messageId);

                  // Update local state to prevent duplicate calls
                  setMessages(prev => prev.map(msg => {
                    if (msg.id === messageId) {
                      return {
                        ...msg,
                        readBy: [...(msg.readBy || []), userId],
                        readAt: [...(msg.readAt || []), new Date().toISOString()]
                      };
                    }
                    return msg;
                  }));
                } else {
                  console.log('👁️ ClanChat: Message already marked as read by this user:', messageId);
                }
              }
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Get all message elements and observe them
    const messageElements = messagesContainerRef.current?.querySelectorAll('.message-wrapper') || [];
    messageElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      // Clean up observer
      observer.disconnect();
    };
  }, [messages, userId]); // Only re-run when messages or userId changes

  // Handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ ClanChat: Tab became hidden, pausing real-time updates');
        // Optionally pause some real-time features when tab is hidden
      } else {
        console.log('👁️ ClanChat: Tab became visible, resuming real-time updates');
        // Refresh connection and messages when tab becomes visible
        if (chatServiceRef.current && connectionStatus === 'connected') {
          console.log('🔄 ClanChat: Refreshing connection after tab visibility change');
          // Small delay to ensure tab is fully active
          setTimeout(() => {
            chatServiceRef.current?.connect().catch(error => {
              console.error('❌ ClanChat: Failed to refresh connection after visibility change:', error);
            });
          }, 500);
        }
      }
    };

    const handlePageFocus = () => {
      console.log('🎯 ClanChat: Page gained focus, checking connection health');
      if (chatServiceRef.current && connectionStatus === 'connected') {
        // Check if connection is still healthy
        const status = chatServiceRef.current.getConnectionStatus();
        if (status === 'disconnected') {
          console.log('🔄 ClanChat: Connection lost while tab was inactive, reconnecting...');
          chatServiceRef.current.connect().catch(error => {
            console.error('❌ ClanChat: Failed to reconnect after focus:', error);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handlePageFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, [connectionStatus]);

  // Handle typing with debounce
  const handleTyping = (value: string) => {
    setInputValue(value);

    if (!isTyping) {
      setIsTyping(true);
      console.log('⌨️ ClanChat: Sending typing indicator: true');
      chatServiceRef.current?.sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      console.log('⌨️ ClanChat: Sending typing indicator: false');
      chatServiceRef.current?.sendTypingIndicator(false);
    }, 1000);
  };

  // Send message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    console.log('📤 ClanChat: Sending message:', inputValue.trim());

    // Generate unique local message ID
    const localMessageId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add message to local state immediately for optimistic UI
    const newMessage = {
      id: localMessageId,
      content: inputValue.trim(),
      userId: userId,
      timestamp: new Date().toISOString(),
      type: 'chat',
      isLocal: true // Mark as local message
    };

    setMessages(prev => {
      // Add new message and sort by timestamp to maintain proper order
      const newMessages = [...prev, newMessage];
      return newMessages.sort((a, b) =>
        new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime()
      );
    });

    // Clear input immediately
    setInputValue('');
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Force scroll to bottom after message is added
    setTimeout(() => {
      forceScrollToBottom();
    }, 50);

    // Now send the message through the service
    const success = chatServiceRef.current?.sendMessage(inputValue.trim());
    console.log('📤 ClanChat: Message send result:', success);

    if (!success) {
      // If send failed, remove the optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== localMessageId));
      console.log('❌ ClanChat: Message send failed, removed optimistic message');
    } else {
      // Set a timeout to automatically mark as delivered if no confirmation received
      setTimeout(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === localMessageId && msg.isLocal) {
            console.log('⏰ ClanChat: Auto-marking message as delivered (timeout):', localMessageId);
            return {
              ...msg,
              isLocal: false,
              isDelivered: true,
              deliveredAt: new Date().toISOString()
            };
          }
          return msg;
        }));
        // Scroll again after status update
        forceScrollToBottom();
      }, 3000); // 3 seconds timeout
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Send demo message for testing
  const handleSendDemoMessage = () => {
    console.log('🎭 ClanChat: Sending demo message');
    if (chatServiceRef.current) {
      const success = chatServiceRef.current.sendMessage('Hello clan! This is a demo message to test the chat functionality.');

      if (success) {
        // Simulate message status updates for demo purposes
        setTimeout(() => {
          console.log('🎭 ClanChat: Simulating delivery confirmation for demo message');
          setMessages(prev => prev.map(msg => {
            if (msg.content === 'Hello clan! This is a demo message to test the chat functionality.' && msg.isLocal) {
              return {
                ...msg,
                isLocal: false,
                isDelivered: true,
                deliveredAt: new Date().toISOString()
              };
            }
            return msg;
          }));
          // Auto-scroll after status update
          autoScrollToBottom();
        }, 1000);

        // Simulate read receipt after delivery
        setTimeout(() => {
          console.log('🎭 ClanChat: Simulating read receipt for demo message');
          setMessages(prev => prev.map(msg => {
            if (msg.content === 'Hello clan! This is a demo message to test the chat functionality.' && msg.isDelivered) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), 'demo-user'],
                readAt: [...(msg.readAt || []), new Date().toISOString()]
              };
            }
            return msg;
          }));
          // Auto-scroll after read receipt
          autoScrollToBottom();
        }, 2000);
      }
    }
  };

  // Simulate read receipts for existing messages (for testing status progression)
  const handleSimulateReadReceipts = () => {
    console.log('👁️ ClanChat: Simulating read receipts for existing messages');
    setMessages(prev => prev.map(msg => {
      if (msg.isDelivered && !msg.readBy?.length) {
        // Simulate that someone read the message
        return {
          ...msg,
          readBy: [...(msg.readBy || []), 'demo-reader'],
          readAt: [...(msg.readAt || []), new Date().toISOString()]
        };
      }
      return msg;
    }));
  };

  // Reset message status for testing (simulate refresh scenario)
  const handleResetMessageStatus = () => {
    console.log('🔄 ClanChat: Resetting message status for testing');
    setMessages(prev => prev.map(msg => ({
      ...msg,
      isLocal: false,
      isDelivered: true, // Reset to delivered state
      deliveredAt: msg.deliveredAt || msg.timestamp || msg.createdAt,
      readBy: msg.readBy || [], // Keep existing read receipts if any
      readAt: msg.readAt || []
    })));
  };

  // Clear read tracking for testing
  const handleClearReadTracking = () => {
    console.log('🧹 ClanChat: Clearing read messages tracking');
    readMessagesRef.current.clear();
    console.log('✅ ClanChat: Read tracking cleared. Current size:', readMessagesRef.current.size);
  };

  // Test full status progression cycle
  const handleTestStatusProgression = () => {
    console.log('🧪 ClanChat: Testing full status progression cycle');

    // Add a test message with 🔄 status
    const testMessage = {
      id: `test-${Date.now()}`,
      content: 'Testing status progression: 🔄 → ✓ → ✓✓',
      userId: userId,
      timestamp: new Date().toISOString(),
      type: 'chat',
      isLocal: true
    };

    setMessages(prev => [...prev, testMessage]);

    // Auto-scroll after adding test message
    autoScrollToBottom();

    // Simulate delivery confirmation after 1 second (🔄 → ✓)
    setTimeout(() => {
      console.log('✅ ClanChat: Simulating delivery confirmation');
      setMessages(prev => prev.map(msg => {
        if (msg.id === testMessage.id) {
          return {
            ...msg,
            isLocal: false,
            isDelivered: true,
            deliveredAt: new Date().toISOString()
          };
        }
        return msg;
      }));
      // Auto-scroll after status update
      autoScrollToBottom();
    }, 1000);

    // Simulate read receipt after 2 seconds (✓ → ✓✓)
    setTimeout(() => {
      console.log('👁️ ClanChat: Simulating read receipt');
      setMessages(prev => prev.map(msg => {
        if (msg.id === testMessage.id) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), 'test-reader'],
            readAt: [...(msg.readAt || []), new Date().toISOString()]
          };
        }
        return msg;
      }));
      // Auto-scroll after read receipt
      autoScrollToBottom();
    }, 2000);
  };

  // Request recent messages
  const requestRecentMessages = () => {
    if (chatServiceRef.current) {
      console.log('📚 ClanChat: Requesting recent messages');
      // This will be handled by the WebSocket connection automatically
    }
  };

  // Test message deletion (for demo purposes)
  const handleTestDeleteMessage = () => {
    if (messages.length > 0 && chatServiceRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.userId === userId && !lastMessage.isLocal) {
        console.log('🗑️ ClanChat: Testing message deletion:', lastMessage.id);
        chatServiceRef.current.deleteMessage(lastMessage.id);
      }
    }
  };

  // Message info handlers
  const handleMessageLongPress = (message: any, event: React.TouchEvent) => {
    event.preventDefault();

    const touch = event.touches[0];
    const rect = event.currentTarget.getBoundingClientRect();

    setMessageInfo({
      message,
      position: {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      },
      show: true
    });
  };

  const handleMessageRightClick = (message: any, event: React.MouseEvent) => {
    event.preventDefault();

    setMessageInfo({
      message,
      position: {
        x: event.clientX,
        y: event.clientY
      },
      show: true
    });
  };

  const handleMessageMouseDown = (message: any) => {
    // Start long press timer for mobile
    longPressTimerRef.current = setTimeout(() => {
      setMessageInfo({
        message,
        position: { x: 0, y: 0 },
        show: true
      });
    }, 500);
  };

  const handleMessageMouseUp = () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const closeMessageInfo = () => {
    setMessageInfo(null);
  };

  // Toggle between real WebSocket and mock server
  const toggleMockServer = () => {
    const wsManager = WebSocketManager.getInstance();
    const newUseMock = !useMockServer;
    setUseMockServer(newUseMock);

    if (newUseMock) {
      console.log('🎭 ClanChat: Switching to mock server');
      // Force disconnect and reconnect to trigger mock server fallback
      chatServiceRef.current?.disconnect();
      setTimeout(() => {
        chatServiceRef.current?.connect();
      }, 100);
    } else {
      console.log('🔌 ClanChat: Switching to real WebSocket');
      // Force disconnect and reconnect to try real WebSocket
      chatServiceRef.current?.disconnect();
      setTimeout(() => {
        chatServiceRef.current?.connect();
      }, 100);
    }
  };

  // Test WebSocket connection manually
  const testWebSocketConnection = () => {
    console.log('🧪 ClanChat: Testing WebSocket connection manually...');

    if (chatServiceRef.current) {
      console.log('🧪 ClanChat: Chat service exists, testing connection...');

      // Test sending a simple message
      const success = chatServiceRef.current.sendMessage('Test message from manual test');
      console.log('🧪 ClanChat: Manual test message result:', success);

      // Check connection status
      const status = chatServiceRef.current.getConnectionStatus();
      console.log('🧪 ClanChat: Current connection status:', status);
    } else {
      console.log('🧪 ClanChat: Chat service ref is null!');
    }
  };

  // Test direct WebSocket connection (for testing purposes)
  const testDirectWebSocketConnection = () => {
    console.log('🧪 ClanChat: Testing direct WebSocket connection...');
    const wsManager = WebSocketManager.getInstance();
    if (wsManager) {
      wsManager.connect('clan-chat', { userId, clanId });
      console.log('🧪 ClanChat: Direct WebSocket connection status:', wsManager.getConnectionStatus('clan-chat', { userId, clanId }));
    } else {
      console.log('🧪 ClanChat: WebSocketManager instance not found.');
    }
  };

  console.log('🔍 ClanChat: Current connection status:', connectionStatus);
  console.log('🔍 ClanChat: Current messages count:', messages.length);

  return (
    <div className="clan-chat">
      {/* Connection Status Header */}

      {/* Simple Chat Layout */}
      <div className="chat-container">
        {/* Connection Status Indicator */}
        <div className="connection-status-bar">
          <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              <span className="text-xs text-gray-600">
                {connectionStatus === 'connected' ? 'Connected' :
                  connectionStatus === 'connecting' ? 'Connecting' : 'Disconnected'}
              </span>
              {connectionStatus === 'connected' && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Real-time Active
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {useMockServer ? '🎭 Mock Server' : '🔌 Real WebSocket'}
              </span>
              <span className="text-xs text-gray-400">
                Port: {useMockServer ? 'Mock' : '4003'}
              </span>
              <span className="text-xs text-gray-400">
                Messages: {messages.length}
              </span>
            </div>
          </div>
        </div>

        <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
          {/* Loading indicator for older messages */}
          {isLoadingOlderMessages && (
            <div className="loading-older-messages">
              <div className="loading-spinner"></div>
              <span>Loading older messages...</span>
            </div>
          )}

          {/* No more messages indicator */}
          {!hasMoreMessages && messages.length > 0 && (
            <div className="no-more-messages">
              <span>📜 You've reached the beginning of the conversation</span>
            </div>
          )}

          {/* Connection Error Message */}
          {connectionStatus === 'disconnected' && (
            <div className="connection-error">
              <div className="error-icon">⚠️</div>
              <p className="error-title">Connection Failed</p>
              <p className="error-subtitle">
                Unable to connect to clan chat server at <code>ws://localhost:4003/ws</code>
              </p>
              <div className="error-actions">
                <button
                  onClick={() => chatServiceRef.current?.connect()}
                  className="retry-button"
                >
                  ↻ Retry Connection
                </button>
                <button
                  onClick={toggleMockServer}
                  className="mock-button"
                >
                  🎭 Use Mock Server (Testing)
                </button>
              </div>
              <div className="error-help">
                <p><strong>To fix this:</strong></p>
                <ul>
                  <li>• Make sure your backend clan service is running on port 4003</li>
                  <li>• Check if WebSocket endpoint <code>/ws</code> is available</li>
                  <li>• Verify firewall/network settings</li>
                  <li>• Use Mock Server for testing without backend</li>
                </ul>
              </div>
            </div>
          )}

          {/* Connection Troubleshooting for Real-time Issues */}
          {connectionStatus === 'connected' && (
            <div className="connection-troubleshooting">
              <div className="troubleshooting-header">
                <span className="troubleshooting-icon">🔧</span>
                <span className="troubleshooting-title">Real-time Issues?</span>
              </div>
              <div className="troubleshooting-content">
                <p className="troubleshooting-text">
                  If messages aren't appearing in real-time:
                </p>
                <div className="troubleshooting-actions">
                  <button
                    onClick={() => {
                      console.log('🔄 ClanChat: Force reconnection requested');
                      if (chatServiceRef.current) {
                        chatServiceRef.current.disconnect();
                        setTimeout(() => {
                          chatServiceRef.current?.connect();
                        }, 1000);
                      }
                    }}
                    className="troubleshooting-button"
                  >
                    🔄 Force Reconnect
                  </button>
                  <button
                    onClick={() => {
                      console.log('📡 ClanChat: Requesting recent messages');
                      if (chatServiceRef.current) {
                        // Trigger a manual refresh of recent messages
                        chatServiceRef.current.connect();
                      }
                    }}
                    className="troubleshooting-button"
                  >
                    📡 Refresh Messages
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.length === 0 && connectionStatus === 'connected' ? (
            <div className="empty-state">
              <div className="empty-icon"><ChatBubbleLeftIcon /></div>
              <p className="empty-title">No messages yet</p>
              <p className="empty-subtitle">Start the conversation with your clan!</p>
            </div>
          ) : messages.length > 0 ? (
            renderMessages()
          ) : null}

          {typingUsers.size > 0 && (
            <div className="typing-indicator">
              {Array.from(typingUsers).map(typingUserId => getDisplayName(typingUserId)).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          )}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            disabled={connectionStatus !== 'connected'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || connectionStatus !== 'connected'}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>

      {/* Demo Button */}
      {/* <div className="demo-button-container">
        <button
          onClick={handleSendDemoMessage}
          className="demo-button"
          disabled={connectionStatus !== 'connected'}
        >
          Demo Message
        </button>
      </div> */}

      {/* Test Buttons for Message Status Features */}
      <div className="test-buttons-container">
        <button
          onClick={handleSendDemoMessage}
          className="test-button"
          disabled={connectionStatus !== 'connected'}
        >
          Demo Message
        </button>
        <button
          onClick={handleSimulateReadReceipts}
          className="test-button"
          disabled={connectionStatus !== 'connected'}
        >
          Simulate Read Receipts
        </button>
        <button
          onClick={handleResetMessageStatus}
          className="test-button"
          disabled={connectionStatus !== 'connected'}
        >
          Reset Message Status
        </button>
        <button
          onClick={handleClearReadTracking}
          className="test-button"
          disabled={connectionStatus !== 'connected'}
        >
          Clear Read Tracking
        </button>
        <button
          onClick={handleTestStatusProgression}
          className="test-button"
          disabled={connectionStatus !== 'connected'}
        >
          Test Status Progression
        </button>
        <button
          onClick={() => scrollToBottom('smooth')}
          className="test-button"
          style={{ background: '#10b981', color: 'white' }}
        >
          📍 Scroll to Bottom
        </button>
        <button
          onClick={forceScrollToBottom}
          className="test-button"
          style={{ background: '#059669', color: 'white' }}
        >
          🚀 Force Scroll
        </button>
        <button
          onClick={() => {
            console.log('🔄 ClanChat: Manual refresh requested');
            if (chatServiceRef.current) {
              chatServiceRef.current.connect().then(() => {
                console.log('✅ ClanChat: Manual refresh successful');
                setConnectionStatus('connected');
              }).catch(error => {
                console.error('❌ ClanChat: Manual refresh failed:', error);
                setConnectionStatus('disconnected');
              });
            }
          }}
          className="test-button"
          style={{ background: '#3b82f6', color: 'white' }}
        >
          🔄 Manual Refresh
        </button>
        <button
          onClick={handleTestDeleteMessage}
          className="test-button delete"
          disabled={connectionStatus !== 'connected' || messages.length === 0}
        >
          Delete Last Message
        </button>
        <button
          onClick={requestRecentMessages}
          className="test-button"
          disabled={connectionStatus !== 'connected'}
        >
          Refresh Messages
        </button>
        <button
          onClick={toggleMockServer}
          className="test-button"
          style={{
            background: useMockServer ? '#dc2626' : '#059669',
            color: 'white'
          }}
        >
          {useMockServer ? 'Switch to Real WS' : 'Switch to Mock'}
        </button>
        <button
          onClick={() => {
            console.log('🔍 Debug: Current connection status:', connectionStatus);
            console.log('🔍 Debug: Chat service ref:', chatServiceRef.current);
            console.log('🔍 Debug: Current messages:', messages);
            console.log('🔍 Debug: Member details:', memberDetails);
          }}
          className="test-button debug"
        >
          Debug Info
        </button>
        <button
          onClick={testWebSocketConnection}
          className="test-button test-ws"
        >
          Test WebSocket
        </button>
        <button
          onClick={loadOlderMessages}
          className="test-button load-older"
          disabled={isLoadingOlderMessages || !hasMoreMessages}
        >
          Load Older Messages
        </button>
        <button
          onClick={testDirectWebSocketConnection}
          className="test-button"
          style={{ background: '#8b5cf6', color: 'white' }}
        >
          Test Direct WS
        </button>
        <button
          onClick={() => {
            const wsManager = WebSocketManager.getInstance();
            if (wsManager) {
              console.log('🔍 ClanChat: All active connections:', wsManager.getActiveConnections());
              console.log('🔍 ClanChat: Connection details:', {
                userId,
                clanId,
                tabId: wsManager.getTabId()
              });
            }
          }}
          className="test-button debug"
          style={{ background: '#6b7280', color: 'white' }}
        >
          Debug Connections
        </button>
        <button
          onClick={() => {
            console.log('🔍 ClanChat: Read messages tracking:', {
              totalTracked: readMessagesRef.current.size,
              trackedMessages: Array.from(readMessagesRef.current),
              currentMessages: messages.map(m => ({
                id: m.id,
                content: m.content?.substring(0, 30),
                readBy: m.readBy,
                isLocal: m.isLocal
              }))
            });
          }}
          className="test-button debug"
          style={{ background: '#8b5cf6', color: 'white' }}
        >
          Debug Read Tracking
        </button>
      </div>

      <div ref={messagesEndRef} />

      {/* Message Info Modal */}
      {messageInfo && (
        <div className="message-info-overlay" onClick={closeMessageInfo}>
          <div
            className="message-info-modal"
            style={{
              left: messageInfo.position.x,
              top: messageInfo.position.y
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="message-info-header">
              <div className="read-by-title">
                <span className="read-icon">✓✓</span>
                <span className="read-text">Read by</span>
              </div>
              <button className="close-button" onClick={closeMessageInfo}>×</button>
            </div>

            <div className="message-info-content">
              {messageInfo.message.readBy && messageInfo.message.readBy.length > 0 ? (
                messageInfo.message.readBy.map((readerId: string, index: number) => {
                  const member = memberDetails.find(m => m.id === readerId);
                  const readTime = messageInfo.message.readAt && messageInfo.message.readAt[index]
                    ? messageInfo.message.readAt[index]
                    : messageInfo.message.timestamp || messageInfo.message.createdAt;

                  return (
                    <div key={readerId} className="reader-item">
                      <div className="reader-avatar">
                        {member?.profilePicture ? (
                          <img src={member.profilePicture} alt={getDisplayName(readerId)} />
                        ) : (
                          <div className="avatar-placeholder">
                            {getDisplayName(readerId).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="reader-info">
                        <div className="reader-name">
                          {getDisplayName(readerId)}
                          {member?.roles?.includes('INFLUENCER') && <span className="influencer-badge">🤩</span>}
                        </div>
                        <div className="read-time">
                          {new Date(readTime).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}, {new Date(readTime).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-readers">
                  <span>No one has read this message yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
