'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';

import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface ConversationResponse {
  id: string;
  senderId: string;
  senderType: 'gig_owner' | 'applicant';
  message: string;
  createdAt: string;
  isRead: boolean;
  responseNumber: number;
  fromType: string;
  timestamp: string;
}

interface ConversationData {
  id: string;
  gigId: string;
  applicationId: string;
  status: 'open' | 'closed';
  userRole: 'gig_owner' | 'applicant';
  subject: string;
  participants: {
    gigOwner: {
      id: string;
      name: string;
      type: string;
    };
    applicant: {
      id: string;
      type: string;
      name: string;
    };
  };
  stats: {
    totalResponses: number;
    lastActivity: string;
    createdAt: string;
  };
}

interface ApplicationConversationProps {
  applicationId: string;
  gigTitle: string;
  isVisible: boolean;
  applicantName?: string;
  brandProfile?: Record<string, any>;
  onClose: () => void;
}

export function GigChat({
  applicationId,
  gigTitle,
  isVisible,
  applicantName,
  brandProfile,
  onClose,
}: ApplicationConversationProps) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationData | null>(
    null
  );
  const [responses, setResponses] = useState<ConversationResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const responsesEndRef = useRef<HTMLDivElement>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [lastUserAction, setLastUserAction] = useState<number>(0);
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const userType = getUserTypeForRole(currentRole);

  // Auto-refresh conversation every 30 seconds (reduced frequency to prevent issues)
  const AUTO_REFRESH_INTERVAL = 30000;

  // Scroll to bottom when new responses arrive
  const scrollToBottom = () => {
    responsesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  console.log('Brand Profile:', brandProfile);

  useEffect(() => {
    console.log('📊 Responses updated, count:', responses.length);
    console.log('📊 Full responses array:', responses);
    scrollToBottom();
  }, [responses]);

  // Load conversation data
  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `/api/chat/application/${applicationId}`
      );

      if (response.success) {
        const data = response.data as any;
        setConversation(data.conversation);

        // Handle responses array
        const responsesArray = data.responses || [];
        console.log('🔍 [LOAD] Raw responses from server:', responsesArray.length, responsesArray);
        
        const loadedResponses = responsesArray.map((response: any) => ({
          ...response,
          createdAt:
            response.timestamp ||
            response.createdAt ||
            new Date().toISOString(),
          message: String(response.message || ''),
          senderId: String(response.senderId || ''),
          id: String(response.id || ''),
        }));
        
        console.log('🔍 [LOAD] Processed responses:', loadedResponses.length, loadedResponses);
        
        // For initial load, just set the responses directly
        setResponses(loadedResponses);

        console.log('📄 Conversation loaded:', {
          id: data.conversation?.id,
          status: data.conversation?.status,
          totalResponses: data.conversation?.stats?.totalResponses,
          responsesLoaded: loadedResponses.length,
        });
      } else {
        setError('Failed to load conversation');
      }
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  // Refresh conversation data
  const refreshConversation = async (isManual = false) => {
    if (!conversation || (!isVisible && !isManual)) return;

    // Only allow manual refresh for now to prevent message disappearing issues
    if (!isManual) {
      console.log('🔄 Auto-refresh temporarily disabled');
      return;
    }

    try {
      if (isManual) {
        setManualRefreshing(true);
      }

     const response = await apiClient.get(
        `/api/chat/application/${applicationId}`
      );
      console.log('Application Id', applicationId, 'refresh response:', response);
      if (response.success) {
        const data = response.data as any;
        setConversation(data.conversation);

        // Handle responses array
        const responsesArray = data.responses || [];
        console.log('🔍 Raw responses from server:', responsesArray.length, responsesArray);
        
        const loadedResponses = responsesArray.map((response: any) => ({
          ...response,
          createdAt:
            response.timestamp ||
            response.createdAt ||
            new Date().toISOString(),
          message: String(response.message || ''),
          senderId: String(response.senderId || ''),
          id: String(response.id || ''),
        }));
        
        console.log('🔍 [REFRESH] Processed responses:', loadedResponses.length, loadedResponses);
        
        // Smart state update: preserve any pending optimistic responses
        setResponses(prev => {
          console.log('🔄 [REFRESH] Previous responses:', prev.length, prev);
          console.log('🔄 [REFRESH] New responses:', loadedResponses.length, loadedResponses);
          
          // Filter out any optimistic responses that are confirmed by server
          const optimisticResponses = prev.filter(p => p.id.startsWith('temp-'));
          const confirmedOptimistic = optimisticResponses.filter(opt => 
            loadedResponses.some((real: any) => 
              real.message === opt.message && 
              real.senderId === opt.senderId &&
              Math.abs(new Date(real.createdAt).getTime() - new Date(opt.createdAt).getTime()) < 10000
            )
          );
          
          // Keep unconfirmed optimistic responses
          const pendingOptimistic = optimisticResponses.filter(opt => 
            !confirmedOptimistic.includes(opt)
          );
          
          // Combine server responses with pending optimistic responses
          const combined = [...loadedResponses, ...pendingOptimistic];
          
          // Sort by timestamp to maintain chronological order
          const sorted = combined.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          console.log('🔄 [REFRESH] Final combined responses:', sorted.length, sorted);
          
          return sorted;
        });
        console.log('🔄 Conversation refreshed:', {
          id: data.conversation?.id,
          status: data.conversation?.status,
          totalResponses: data.conversation?.stats?.totalResponses,
          responsesLoaded: loadedResponses.length,
          responses: loadedResponses,
        });
          // Remove optimistic responses that have been confirmed by server
        //   const remainingOptimistic = optimisticResponses.filter(
        //     (opt) =>
        //       !realResponses.some(
        //         (real: any) =>
        //           real.message === opt.message &&
        //           real.senderId === opt.senderId &&
        //           Math.abs(
        //             new Date(real.createdAt).getTime() -
        //               new Date(opt.createdAt).getTime()
        //           ) < 60000 // Increased tolerance to 60 seconds
        //       )
        //   );

        //   // Sort by timestamp to maintain chronological order
        //   const combined = [...realResponses, ...remainingOptimistic].sort(
        //     (a, b) => {
        //       // Always sort by timestamp for consistent chronological order
        //       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        //     }
        //   );

        //   // Assign sequential response numbers based on chronological order
        //   const orderedResponses = combined.map((response, index) => ({
        //     ...response,
        //     responseNumber: index + 1, // Sequential numbering based on chronological order
        //   }));

        //   // Create a Set of current response IDs for faster lookup
        //   const currentIds = new Set(prev.map(r => r.id));
        //   const newIds = new Set(orderedResponses.map(r => r.id));
          
        //   // Check if there are new responses or different responses
        //   const hasNewResponses = orderedResponses.some(r => !currentIds.has(r.id));
        //   const hasRemovedResponses = prev.some(r => !newIds.has(r.id));
        //   const lengthChanged = orderedResponses.length !== prev.length;
          
        //   if (hasNewResponses || hasRemovedResponses || lengthChanged || isManual) {
        //     console.log(
        //       isManual
        //         ? '🔄 Manual refresh completed'
        //         : `🔄 Auto-refresh found changes: ${orderedResponses.length} responses (was ${prev.length}), new: ${hasNewResponses}, removed: ${hasRemovedResponses}`
        //     );
        //     setLastRefreshTime(Date.now());
        //     return orderedResponses;
        //   }
          
        //   // No changes detected, keep current responses unchanged
        //   console.log('🔄 Auto-refresh: No changes detected, keeping current responses');
        //   return prev;
        // });
      }
    } catch (error) {
      console.error('Refresh error:', error);
      if (isManual) {
        setError('Failed to refresh conversation');
      }
    } finally {
      if (isManual) {
        setManualRefreshing(false);
      }
    }
  };

  // Auto-refresh conversation for new responses
  const startAutoRefresh = () => {
    if (refreshInterval) return; // Already refreshing

    // TEMPORARILY DISABLED: Auto-refresh causing messages to disappear
    // const interval = setInterval(() => refreshConversation(false), AUTO_REFRESH_INTERVAL);
    // setRefreshInterval(interval);
    console.log('🔄 Auto-refresh temporarily disabled to prevent message issues');
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      console.log('⏹️ Stopped auto-refresh');
    }
  };

  // Add response to conversation
  const addResponse = async () => {
    if (!newResponse.trim() || !conversation || sending) return;

    // Check if conversation is closed
    if (conversation.status === 'closed') {
      setError('This conversation is closed and read-only');
      return;
    }

    const messageText = newResponse.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    try {
      setSending(true);
      setError(null);
      setLastUserAction(Date.now()); // Track user action to prevent auto-refresh interference

      // Create optimistic response for immediate UI feedback
      const optimisticResponse: ConversationResponse = {
        id: tempId,
        senderId: user?.id || '',
        senderType: conversation.userRole,
        fromType: conversation.userRole,
        message: messageText,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        responseNumber: responses.length + 1, // Temporary number, will be recalculated based on chronology
      };

      // Add optimistic response immediately
      setResponses((prev: ConversationResponse[]) => [
        ...prev,
        optimisticResponse,
      ]);
      setNewResponse(''); // Clear input immediately

      const response = await apiClient.post(
        `/api/chat/${conversation.id}/responses`,
        {
          message: messageText,
          messageType: 'text',
        }
      );

      if (response.success) {
        const data = response.data as any;
        const newResponseData = data.response;

        // Replace optimistic response with real response
        const formattedResponse: ConversationResponse = {
          ...newResponseData,
          responseNumber: newResponseData.responseNumber || optimisticResponse.responseNumber,
          fromType: newResponseData.senderType,
          timestamp: newResponseData.createdAt,
          createdAt: newResponseData.createdAt,
          message: String(newResponseData.message),
          senderId: String(newResponseData.senderId),
          id: String(newResponseData.id),
        };

        setResponses((prev: ConversationResponse[]) =>
          prev.map((resp: ConversationResponse) =>
            resp.id === tempId ? formattedResponse : resp
          )
        );

        // Update conversation stats
        if (conversation && data.conversationStats) {
          setConversation({
            ...conversation,
            stats: {
              ...conversation.stats,
              totalResponses: data.conversationStats.totalResponses,
              lastActivity: data.conversationStats.lastActivity,
            },
          });
        }

        console.log('✅ Response added successfully:', {
          responseNumber: formattedResponse.responseNumber,
          totalResponses: data.conversationStats?.totalResponses,
          optimisticId: tempId,
          realId: formattedResponse.id,
        });
      } else {
        // Remove optimistic response on failure
        setResponses((prev: ConversationResponse[]) =>
          prev.filter((resp: ConversationResponse) => resp.id !== tempId)
        );
        setNewResponse(messageText); // Restore message
        setError('Failed to add response');
      }
    } catch (err: any) {
      console.error('Failed to add response:', err);
      // Remove optimistic response on error
      setResponses((prev: ConversationResponse[]) =>
        prev.filter((resp: ConversationResponse) => resp.id !== tempId)
      );
      setNewResponse(messageText); // Restore message
      setError(err.message || 'Failed to add response');
    } finally {
      setSending(false);
    }
  };

  // Setup auto-refresh when conversation is loaded
  useEffect(() => {
    if (conversation && isVisible) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [conversation, isVisible]);

  // Load conversation when component becomes visible
  useEffect(() => {
    if (isVisible) {
      loadConversation();
    } else {
      // Cleanup when conversation becomes invisible
      stopAutoRefresh();
    }

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [isVisible, applicationId]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addResponse();
    }
  };

  if (!isVisible) return null;

  const formatTime = (dateInput: string | Date) => {
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="flex h-[90vh] w-full max-w-sm flex-col rounded-lg bg-white shadow-xl sm:h-[600px] sm:max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-3 sm:p-4">
          <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
            <ChatBubbleLeftRightIcon className="h-5 w-5 flex-shrink-0 text-blue-600 sm:h-6 sm:w-6" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                {conversation?.status === 'closed'
                  ? 'Discussion (Closed)'
                  : `Discussion with ${userType === 'brand' ? applicantName || 'Applicant' : brandProfile?.name || 'Brand'}`}
              </h3>
              <p className="truncate text-xs text-gray-600 sm:text-sm">
                {conversation?.subject || gigTitle}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-shrink-0 items-center space-x-1 sm:space-x-2">
            {/* Refresh Status */}
            <div className="hidden hidden items-center space-x-1 text-xs sm:flex">
              {/* Auto-refresh temporarily disabled */}
              <>
                <div className="h-2 w-2 rounded-full hidden bg-orange-500"></div>
                <span className="text-orange-600 hidden">Disabled</span>
              </>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => refreshConversation(true)}
              disabled={manualRefreshing}
              className="p-1.5 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
              title="Refresh conversation"
            >
              <svg
                className={`h-4 w-4 ${manualRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {conversation?.status === 'closed' && (
              <div className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800">
                Closed
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 transition-colors hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Chat content */}
        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading conversation...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={loadConversation}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Responses */}
              <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:space-y-4 sm:p-4">
                {responses.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                    <p>
                      {conversation?.status === 'closed'
                        ? 'This conversation has been closed.'
                        : 'No responses yet. Start the conversation!'}
                    </p>
                  </div>
                ) : (
                  (() => {
                    console.log('🎨 About to render responses:', responses.length, responses);
                    const renderedComponents = responses
                      .map((response: ConversationResponse, index: number) => {
                        // Debug: Log each response being processed
                        console.log(`🔍 Processing response ${index + 1}:`, {
                          id: response?.id,
                          message: response?.message,
                          hasId: !!response?.id,
                          hasMessage: !!response?.message,
                          isValid: !(!response || !response.id || !response.message)
                        });

                        // Ensure response has required fields
                        if (!response || !response.id || !response.message) {
                          console.warn('❌ Invalid response object filtered out:', response);
                          return null;
                        }

                        const isCurrentUser = response.senderId === user?.id;
                      const showDate =
                        index === 0 ||
                        formatDate(response.createdAt) !==
                          formatDate(responses[index - 1]?.createdAt);

                      return (
                        <div key={`${response.id}-${response.responseNumber}-${index}`}>
                          {showDate && (
                            <div className="mb-2 text-center text-xs text-gray-500">
                              {formatDate(response.createdAt)}
                            </div>
                          )}
                          <div
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg px-3 py-2 sm:max-w-xs lg:max-w-md ${
                                isCurrentUser
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {/* Response number */}
                              <div className="mb-1 text-xs opacity-75">
                                #{response.responseNumber}
                                {response.id.startsWith('temp-') && (
                                  <span className="ml-1 text-yellow-600">
                                    (Sending...)
                                  </span>
                                )}
                              </div>
                              <p className="break-words text-sm">
                                {String(response.message)}
                              </p>
                              <p
                                className={`mt-1 text-xs ${
                                  isCurrentUser
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatTime(response.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean);
                    
                    console.log('🎨 Final rendered components count:', renderedComponents.filter(Boolean).length);
                    return renderedComponents;
                  })()
                )}
                <div ref={responsesEndRef} />
              </div>

              {/* Response input */}
              {conversation?.status === 'open' ? (
                <div className="border-t border-gray-200 p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Response #{(conversation?.stats?.totalResponses || 0) + 1}
                    </div>
                    {lastRefreshTime > 0 && (
                      <div className="text-xs text-gray-500">
                        Updated{' '}
                        {Math.floor((Date.now() - lastRefreshTime) / 1000)}s ago
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="mb-2 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                      {error}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      onClick={addResponse}
                      disabled={!newResponse.trim() || sending}
                      className="flex flex-shrink-0 items-center space-x-1 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                      <span className="hidden text-sm sm:inline">
                        {sending ? 'Sending...' : 'Send'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <p className="text-center text-xs text-gray-600 sm:text-sm">
                    This conversation is closed and read-only. No new responses
                    can be added.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
