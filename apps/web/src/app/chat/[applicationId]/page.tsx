'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';

import {
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
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

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const userType = getUserTypeForRole(currentRole);

  const applicationId = params?.applicationId as string;
  const gigTitle = searchParams?.get('gigTitle') || 'Gig Discussion';
  const applicantName = searchParams?.get('applicantName');
  const brandName = searchParams?.get('brandName');

  const [conversation, setConversation] = useState<ConversationData | null>(
    null
  );
  const [responses, setResponses] = useState<ConversationResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const responsesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new responses arrive
  const scrollToBottom = () => {
    responsesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

      console.log('🔍 Loading conversation for applicationId:', applicationId);

      const response = await apiClient.get(
        `/api/chat/application/${applicationId}?t=${Date.now()}&refresh=true`
      );

      if (response.success) {
        const data = response.data as any;
        setConversation(data.conversation);

        // Handle responses array
        const responsesArray = data.responses || [];
        console.log(
          '🔍 [LOAD] Raw responses from server:',
          responsesArray.length,
          responsesArray
        );

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

        console.log(
          '🔍 [LOAD] Processed responses:',
          loadedResponses.length,
          loadedResponses
        );

        // Direct state replacement to prevent filtering issues
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

  // Manual refresh conversation
  const refreshConversation = async () => {
    if (!conversation) return;

    try {
      setManualRefreshing(true);
      setError(null);

      console.log(
        '🔄 [REFRESH] Starting manual refresh for applicationId:',
        applicationId
      );

      const response = await apiClient.get(
        `/api/chat/application/${applicationId}?t=${Date.now()}&refresh=true`
      );

      if (response.success) {
        const data = response.data as any;
        setConversation(data.conversation);

        // Handle responses array
        const responsesArray = data.responses || [];
        console.log(
          '🔍 [REFRESH] Raw responses from server:',
          responsesArray.length,
          responsesArray
        );

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

        console.log(
          '🔍 [REFRESH] Processed responses:',
          loadedResponses.length,
          loadedResponses
        );

        // Simple direct replacement - no complex merging logic that can cause issues
        setResponses(loadedResponses);

        console.log('🔄 Conversation refreshed successfully:', {
          id: data.conversation?.id,
          status: data.conversation?.status,
          totalResponses: data.conversation?.stats?.totalResponses,
          responsesLoaded: loadedResponses.length,
        });
      } else {
        setError('Failed to refresh conversation');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setError('Failed to refresh conversation');
    } finally {
      setManualRefreshing(false);
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
        responseNumber: responses.length + 1,
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
          responseNumber:
            newResponseData.responseNumber || optimisticResponse.responseNumber,
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

  // Load conversation on component mount
  useEffect(() => {
    if (applicationId) {
      loadConversation();
    }
  }, [applicationId]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addResponse();
    }
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={loadConversation}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Fixed Header - positioned below global header */}
      <div className="fixed left-0 right-0 top-16 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-1 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {conversation?.status === 'closed'
                      ? 'Discussion (Closed)'
                      : `Discussion with ${userType === 'brand' ? applicantName || 'Applicant' : brandName || 'Brand'}`}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {conversation?.subject || gigTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Manual Refresh Button */}
              <button
                onClick={refreshConversation}
                disabled={manualRefreshing}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                title="Refresh conversation"
              >
                <svg
                  className={`h-5 w-5 ${manualRefreshing ? 'animate-spin' : ''}`}
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
                <div className="rounded bg-red-100 px-3 py-1 text-sm text-red-800">
                  Closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content - Account for fixed header and bottom input */}
      <div className="flex flex-1 flex-col pb-24 pt-28">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden">
          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {responses.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="text-lg">
                    {conversation?.status === 'closed'
                      ? 'This conversation has been closed.'
                      : 'No responses yet. Start the conversation!'}
                  </p>
                </div>
              ) : (
                (() => {
                  console.log(
                    '🎨 About to render responses:',
                    responses.length,
                    responses
                  );
                  const renderedComponents = responses
                    .map((response: ConversationResponse, index: number) => {
                      // Debug: Log each response being processed
                      console.log(`🔍 Processing response ${index + 1}:`, {
                        id: response?.id,
                        message: response?.message,
                        hasId: !!response?.id,
                        hasMessage: !!response?.message,
                        isValid: !(
                          !response ||
                          !response.id ||
                          !response.message
                        ),
                      });

                      // Ensure response has required fields
                      if (!response || !response.id || !response.message) {
                        console.warn(
                          '❌ Invalid response object filtered out:',
                          response
                        );
                        return null;
                      }

                      const isCurrentUser = response.senderId === user?.id;
                      const showDate =
                        index === 0 ||
                        formatDate(response.createdAt) !==
                          formatDate(responses[index - 1]?.createdAt);

                      return (
                        <div
                          key={`${response.id}-${response.responseNumber}-${index}`}
                        >
                          {showDate && (
                            <div className="mb-4 text-center text-sm text-gray-500">
                              {formatDate(response.createdAt)}
                            </div>
                          )}
                          <div
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-md rounded-lg px-4 py-3 lg:max-w-lg ${
                                isCurrentUser
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-200 bg-white text-gray-900 shadow-sm'
                              }`}
                            >
                              {/* Response number */}
                              <div className="mb-2 text-xs opacity-75">
                                #{response.responseNumber}
                                {response.id.startsWith('temp-') && (
                                  <span className="ml-2 text-yellow-500">
                                    (Sending...)
                                  </span>
                                )}
                              </div>
                              <p className="break-words text-sm">
                                {String(response.message)}
                              </p>
                              <p
                                className={`mt-2 text-xs ${
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

                  console.log(
                    '🎨 Final rendered components count:',
                    renderedComponents.filter(Boolean).length
                  );
                  return renderedComponents;
                })()
              )}
              <div ref={responsesEndRef} />
            </div>
          </div>

          {/* Message Input - Fixed at bottom above navigation */}
          {conversation?.status === 'open' ? (
            <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white p-1">
              <div className="mx-auto max-w-4xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Response #{(conversation?.stats?.totalResponses || 0) + 1}
                  </div>
                </div>

                {error && (
                  <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={addResponse}
                    disabled={!newResponse.trim() || sending}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-gray-50 p-4">
              <div className="mx-auto max-w-4xl text-center">
                <p className="text-gray-600">
                  This conversation is closed and read-only. No new responses
                  can be added.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
