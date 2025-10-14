import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketManager } from '../services/websocket/WebSocketManager';

export type GigEventType =
  | 'gig_created'
  | 'gig_updated'
  | 'gig_deleted'
  | 'gig_status_changed'
  | 'application_submitted'
  | 'application_accepted'
  | 'application_rejected'
  | 'application_withdrawn'
  | 'work_submitted'
  | 'work_approved'
  | 'work_rejected'
  | 'submission_reviewed'
  | 'gig_completed'
  | 'gig_cancelled'
  | 'milestone_created'
  | 'milestone_updated'
  | 'milestone_completed'
  | 'payment_released'
  | 'dispute_created'
  | 'dispute_resolved'
  // Brand notification events
  | 'new_application_received'
  | 'work_submitted_notification'
  | 'application_withdrawn_notification'
  // Applicant notification events
  | 'application_confirmed'
  | 'application_approved_notification'
  | 'submission_reviewed_notification'
  // Confirmation events
  | 'work_submission_confirmed'
  | 'application_withdrawal_confirmed';
export interface GigEventData {
  gigId: string;
  gigTitle: string;
  timestamp: string;
  userId?: string;
  [key: string]: any;
}

interface UseGigWebSocketOptions {
  userId: string;
  gigId?: string;
  autoConnect?: boolean;
}

interface BrandEventHandlers {
  onNewApplication?: (data: any) => void;
  onWorkSubmitted?: (data: any) => void;
  onApplicationWithdrawn?: (data: any) => void;
}

interface ApplicantEventHandlers {
  onApplicationConfirmed?: (data: any) => void;
  onApplicationApproved?: (data: any) => void;
  onSubmissionReviewed?: (data: any) => void;
  onWorkSubmissionConfirmed?: (data: any) => void;
  onApplicationWithdrawalConfirmed?: (data: any) => void;
}
export function useGigWebSocket({
  userId,
  gigId,
  autoConnect = true,
}: UseGigWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsManager = WebSocketManager.getInstance();
  // Always include userId, optionally include gigId for gig-specific events
  const connectionParams = {
    userId,
    ...(gigId && { gigId }),
    // Add user role context for proper event filtering
    subscribeToAll: true,
  };
  const eventHandlersRef = useRef<Map<GigEventType, Set<(data: any) => void>>>(
    new Map()
  );

  // Connect to gig service
  const connect = useCallback(async () => {
    try {
      setError(null);
      await wsManager.connect('gig', connectionParams);
      setIsConnected(true);
      console.log('🎯 useGigWebSocket: Connected to gig service');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect to gig service';
      setError(errorMessage);
      console.error('❌ useGigWebSocket: Failed to connect:', err);
    }
  }, [wsManager, connectionParams]);

  // Disconnect from gig service
  const disconnect = useCallback(() => {
    wsManager.disconnect('gig', connectionParams);
    setIsConnected(false);
    console.log('🎯 useGigWebSocket: Disconnected from gig service');
  }, [wsManager, connectionParams]);

  // Auto-connect when component mounts
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Listen to specific gig events
  const on = useCallback(
    (eventType: GigEventType, handler: (data: any) => void) => {
      // Store handler reference for cleanup
      if (!eventHandlersRef.current.has(eventType)) {
        eventHandlersRef.current.set(eventType, new Set());
      }
      eventHandlersRef.current.get(eventType)!.add(handler);

      // Enhanced handler with debugging
      const enhancedHandler = (data: any) => {
        console.log(`🎯 GigWebSocket: Received ${eventType} event:`, data);
        handler(data);
      };

      // Subscribe to the event using WebSocketManager
      const unsubscribe = wsManager.on(`gig.${eventType}`, enhancedHandler);

      console.log(
        `🔌 GigWebSocket: Subscribed to gig.${eventType} for user ${userId}`
      );

      // Return cleanup function
      return () => {
        console.log(`🔌 GigWebSocket: Unsubscribed from gig.${eventType}`);
        unsubscribe();
        const handlers = eventHandlersRef.current.get(eventType);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            eventHandlersRef.current.delete(eventType);
          }
        }
      };
    },
    [wsManager, userId]
  );

  // Listen to all gig events
  const onAny = useCallback(
    (handler: (eventType: GigEventType, data: any) => void) => {
      const unsubscribeFunctions: (() => void)[] = [];

      // Subscribe to all known event types
      const allEventTypes: GigEventType[] = [
        'gig_created',
        'gig_updated',
        'gig_deleted',
        'gig_status_changed',
        'application_submitted',
        'application_accepted',
        'application_rejected',
        'application_withdrawn',
        'work_submitted',
        'work_approved',
        'work_rejected',
        'submission_reviewed',
        // Brand notification events
        'new_application_received',
        'work_submitted_notification',
        'application_withdrawn_notification',
        // Applicant notification events
        'application_confirmed',
        'application_approved_notification',
        'submission_reviewed_notification',
        // Confirmation events
        'work_submission_confirmed',
        'application_withdrawal_confirmed',
        'gig_completed',
        'gig_cancelled',
        'milestone_created',
        'milestone_updated',
        'milestone_completed',
        'payment_released',
        'dispute_created',
        'dispute_resolved',
      ];

      allEventTypes.forEach((eventType) => {
        const unsubscribe = on(eventType, (data) => handler(eventType, data));
        unsubscribeFunctions.push(unsubscribe);
      });

      // Return unsubscribe function for all
      return () => {
        unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      };
    },
    [on]
  );

  // Send message to gig service
  const send = useCallback(
    (message: any) => {
      return wsManager.send('gig', connectionParams, message);
    },
    [wsManager, connectionParams]
  );

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return wsManager.getConnectionStatus('gig', connectionParams);
  }, [wsManager, connectionParams]);

  // Helper functions for role-based subscriptions
  const subscribeAsBrand = useCallback(
    (handlers: {
      onNewApplication?: (data: any) => void;
      onWorkSubmitted?: (data: any) => void;
      onApplicationWithdrawn?: (data: any) => void;
    }) => {
      const unsubscribeFunctions: (() => void)[] = [];

      if (handlers.onNewApplication) {
        console.log('🏢 Brand subscribing to new_application_received events');
        unsubscribeFunctions.push(
          on('new_application_received', handlers.onNewApplication)
        );
      }

      if (handlers.onWorkSubmitted) {
        console.log(
          '🏢 Brand subscribing to work_submitted_notification events'
        );
        unsubscribeFunctions.push(
          on('work_submitted_notification', handlers.onWorkSubmitted)
        );
      }

      if (handlers.onApplicationWithdrawn) {
        console.log(
          '🏢 Brand subscribing to application_withdrawn_notification events'
        );
        unsubscribeFunctions.push(
          on(
            'application_withdrawn_notification',
            handlers.onApplicationWithdrawn
          )
        );
      }

      return () => unsubscribeFunctions.forEach((unsub) => unsub());
    },
    [on]
  );

  const subscribeAsApplicant = useCallback(
    (handlers: {
      onApplicationConfirmed?: (data: any) => void;
      onApplicationApproved?: (data: any) => void;
      onSubmissionReviewed?: (data: any) => void;
      onWorkSubmissionConfirmed?: (data: any) => void;
      onApplicationWithdrawalConfirmed?: (data: any) => void;
    }) => {
      const unsubscribeFunctions: (() => void)[] = [];

      if (handlers.onApplicationConfirmed) {
        console.log('👤 Applicant subscribing to application_confirmed events');
        unsubscribeFunctions.push(
          on('application_confirmed', handlers.onApplicationConfirmed)
        );
      }

      if (handlers.onApplicationApproved) {
        console.log(
          '👤 Applicant subscribing to application_approved_notification events'
        );
        unsubscribeFunctions.push(
          on(
            'application_approved_notification',
            handlers.onApplicationApproved
          )
        );
      }

      if (handlers.onSubmissionReviewed) {
        console.log(
          '👤 Applicant subscribing to submission_reviewed_notification events'
        );
        unsubscribeFunctions.push(
          on('submission_reviewed_notification', handlers.onSubmissionReviewed)
        );
      }

      if (handlers.onWorkSubmissionConfirmed) {
        console.log(
          '👤 Applicant subscribing to work_submission_confirmed events'
        );
        unsubscribeFunctions.push(
          on('work_submission_confirmed', handlers.onWorkSubmissionConfirmed)
        );
      }

      if (handlers.onApplicationWithdrawalConfirmed) {
        console.log(
          '👤 Applicant subscribing to application_withdrawal_confirmed events'
        );
        unsubscribeFunctions.push(
          on(
            'application_withdrawal_confirmed',
            handlers.onApplicationWithdrawalConfirmed
          )
        );
      }

      return () => unsubscribeFunctions.forEach((unsub) => unsub());
    },
    [on]
  );

  return {
    // State
    isConnected,
    error,

    // Actions
    connect,
    disconnect,
    send,

    // Event listeners
    on,
    onAny,

    // Role-based subscriptions
    subscribeAsBrand,
    subscribeAsApplicant,

    // Connection status
    getConnectionStatus,

    // Utility
    reconnect: connect,
  };
}

// Export event type constants for easy usage
export const GigEventTypes = {
  // Gig lifecycle events
  GIG_CREATED: 'gig_created' as const,
  GIG_UPDATED: 'gig_updated' as const,
  GIG_DELETED: 'gig_deleted' as const,
  GIG_STATUS_CHANGED: 'gig_status_changed' as const,

  // Application events
  APPLICATION_SUBMITTED: 'application_submitted' as const,
  APPLICATION_ACCEPTED: 'application_accepted' as const,
  APPLICATION_REJECTED: 'application_rejected' as const,
  APPLICATION_WITHDRAWN: 'application_withdrawn' as const,

  // Work events
  WORK_SUBMITTED: 'work_submitted' as const,
  WORK_APPROVED: 'work_approved' as const,
  WORK_REJECTED: 'work_rejected' as const,
  SUBMISSION_REVIEWED: 'submission_reviewed' as const,

  // Brand notification events
  NEW_APPLICATION_RECEIVED: 'new_application_received' as const,
  WORK_SUBMITTED_NOTIFICATION: 'work_submitted_notification' as const,
  APPLICATION_WITHDRAWN_NOTIFICATION:
    'application_withdrawn_notification' as const,

  // Applicant notification events
  APPLICATION_CONFIRMED: 'application_confirmed' as const,
  APPLICATION_APPROVED_NOTIFICATION:
    'application_approved_notification' as const,
  SUBMISSION_REVIEWED_NOTIFICATION: 'submission_reviewed_notification' as const,

  // Confirmation events
  WORK_SUBMISSION_CONFIRMED: 'work_submission_confirmed' as const,
  APPLICATION_WITHDRAWAL_CONFIRMED: 'application_withdrawal_confirmed' as const,

  // Completion events
  GIG_COMPLETED: 'gig_completed' as const,
  GIG_CANCELLED: 'gig_cancelled' as const,

  // Milestone events
  MILESTONE_CREATED: 'milestone_created' as const,
  MILESTONE_UPDATED: 'milestone_updated' as const,
  MILESTONE_COMPLETED: 'milestone_completed' as const,

  // Payment and dispute events
  PAYMENT_RELEASED: 'payment_released' as const,
  DISPUTE_CREATED: 'dispute_created' as const,
  DISPUTE_RESOLVED: 'dispute_resolved' as const,
} as const;
