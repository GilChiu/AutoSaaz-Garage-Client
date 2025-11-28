import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, updateSupabaseAuth } from '../config/supabase';
import Sidebar from '../components/Dashboard/Sidebar';
import { getDisputeById, mapDisputeDetail, postDisputeMessage } from '../services/resolutionCenter.service';
import '../components/Dashboard/Dashboard.css';
import '../styles/resolution-center.css';

const DisputeChatPage = () => {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const raw = await getDisputeById(id, controller.signal);
        setDispute(mapDisputeDetail(raw));
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load dispute');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  // Real-time subscription for dispute updates and new messages
  useEffect(() => {
    if (!id) return;

    console.log('[Real-time] Setting up subscriptions for dispute:', id);
    let isActive = true;
    
    // Wait a moment for auth to be set, then subscribe
    const setupSubscriptions = async () => {
      // Ensure auth is set before subscribing
      await updateSupabaseAuth();
      
      // Small delay to ensure auth propagates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isActive) return;
    
      // Subscribe to dispute_messages for new messages
      const messagesChannel = supabase
        .channel(`dispute-messages-${id}`)
        .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispute_messages',
          filter: `ticket_id=eq.${id}`
        },
        async (payload) => {
          if (!isActive) return;
          console.log('[Real-time] New message received:', payload.new);
          // Invalidate cache immediately
          import('../utils/cache').then(cacheModule => {
            cacheModule.default.invalidate(`/resolution-center/${id}`);
          });
          
          // Fetch fresh dispute data to get the new message properly formatted
          try {
            const raw = await getDisputeById(id);
            const updated = mapDisputeDetail(raw);
            if (updated && isActive) {
              setDispute(updated);
              console.log('[Real-time] Dispute updated with new message');
              
              // If it's a resolution notice, invalidate cache for dispute lists
              if (payload.new.is_resolution_notice) {
                console.log('[Real-time] Resolution notice detected, invalidating lists');
                import('../utils/cache').then(cacheModule => {
                  cacheModule.default.invalidatePattern('resolution-center');
                });
              }
            }
          } catch (e) {
            console.error('Failed to refresh dispute after new message:', e);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Real-time] Messages channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[Real-time] Successfully subscribed to messages');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Real-time] Subscription failed:', status);
        }
      });

    // Subscribe to disputes table for status changes
    const disputeChannel = supabase
      .channel(`dispute-status-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'disputes',
          filter: `id=eq.${id}`
        },
        async (payload) => {
          if (!isActive) return;
          console.log('[Real-time] Dispute status changed:', payload.new);
          // Refresh dispute data when status changes
          try {
            const raw = await getDisputeById(id);
            const updated = mapDisputeDetail(raw);
            if (updated && isActive) {
              setDispute(updated);
              console.log('[Real-time] Dispute updated after status change');
              
              // Invalidate cache when status changes
              import('../utils/cache').then(cacheModule => {
                cacheModule.default.invalidatePattern('resolution-center');
              });
            }
          } catch (e) {
            console.error('Failed to refresh dispute after status change:', e);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Real-time] Dispute channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[Real-time] Successfully subscribed to dispute updates');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Real-time] Dispute subscription failed:', status);
        }
      });

      // Fallback polling if real-time fails (runs every 5 seconds)
      let lastMessageCount = 0;
      const pollInterval = setInterval(async () => {
        if (!isActive) return;
        try {
          const raw = await getDisputeById(id);
          const updated = mapDisputeDetail(raw);
          if (updated && updated.messages?.length > lastMessageCount) {
            console.log('[Fallback] New messages detected via polling');
            lastMessageCount = updated.messages.length;
            if (isActive) setDispute(updated);
          } else if (updated) {
            lastMessageCount = updated.messages?.length || 0;
          }
        } catch (e) {
          // Silent fail for polling
        }
      }, 5000);

      return () => {
        isActive = false;
        console.log('[Real-time] Cleaning up subscriptions');
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(disputeChannel);
        clearInterval(pollInterval);
      };
    };

    // Start the subscription setup
    const cleanup = setupSubscriptions();
    
    // Return cleanup function
    return () => {
      isActive = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [id]);

  const sendMessage = async () => {
    if (!message.trim() && !selectedFile) return;
    try {
      setSending(true);
      console.log('[Upload] Starting message send:', { hasMessage: !!message.trim(), hasFile: !!selectedFile });
      
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      // Upload file to Supabase Storage if selected
      if (selectedFile) {
        setUploadingFile(true);
        console.log('[Upload] Uploading file:', selectedFile.name);
        // Ensure auth token is set before upload
        updateSupabaseAuth();
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dispute-attachments')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('[Upload] File upload failed:', uploadError);
          throw new Error('Failed to upload file: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('dispute-attachments')
          .getPublicUrl(filePath);

        console.log('[Upload] File uploaded successfully:', publicUrl);
        attachmentUrl = publicUrl;
        attachmentType = selectedFile.type;
        attachmentName = selectedFile.name;
        setUploadingFile(false);
      }
      
      // Send message with optional attachment
      console.log('[Upload] Posting message to API');
      const newMsg = await postDisputeMessage(id, message.trim() || 'Attachment', attachmentUrl, attachmentType, attachmentName);
      console.log('[Upload] Message posted successfully:', newMsg);
      if (newMsg) setDispute(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      console.error('[Upload] Failed to send message:', e);
      setError('Failed to send message: ' + (e.message || 'Unknown error'));
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };


  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content rcfx-page">
          {/* Removed duplicate header (UpperNavbar provides title/subtitle) */}
          {loading && <div className="rcfx-loading">Loading dispute...</div>}
          {!loading && !dispute && <div className="rcfx-error">Dispute not found.</div>}
          {!loading && dispute && (
            <div className="rcfx-chat-wrapper">
              <div className="rcfx-section-heading" style={{ margin: 0 }}>Dispute Chat</div>
              <div className="rcfx-chat-box">
                <div className="rcfx-messages" role="log" aria-live="polite">
                  {dispute.messages.map(m => {
                    const isEvidenceRequest = m.isEvidenceRequest;
                    const isEscalationNotice = m.isEscalationNotice;
                    const isResolutionNotice = m.isResolutionNotice;
                    return (
                      <div 
                        key={m.id} 
                        className={`rcfx-msg rcfx-msg-${m.from} ${
                          isEvidenceRequest ? 'rcfx-evidence-request' : ''
                        } ${
                          isEscalationNotice ? 'rcfx-escalation-notice' : ''
                        } ${
                          isResolutionNotice ? 'rcfx-resolution-notice' : ''
                        }`}
                      > 
                        {isEvidenceRequest && (
                          <div className="rcfx-evidence-badge">
                            Evidence Request - Please upload supporting documents
                          </div>
                        )}
                        {isEscalationNotice && (
                          <div className="rcfx-escalation-header">
                            <div className="rcfx-escalation-badge">
                              ⚠️ Admin Escalated this case
                            </div>
                          </div>
                        )}
                        {isResolutionNotice && (
                          <div className="rcfx-resolution-header">
                            <div className="rcfx-resolution-badge">
                              ✓ Case Resolved
                            </div>
                          </div>
                        )}
                        <div className="rcfx-msg-text">{m.text}</div>
                        {m.attachmentUrl && (
                          <div className="rcfx-attachment">
                            {m.attachmentType?.startsWith('image/') ? (
                              <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={m.attachmentUrl} 
                                  alt={m.attachmentName || 'Attachment'} 
                                  style={{maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', marginTop: '8px'}} 
                                />
                              </a>
                            ) : (
                              <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className="rcfx-file-link">
                                📎 {m.attachmentName || 'Download Attachment'}
                              </a>
                            )}
                          </div>
                        )}
                        {isEvidenceRequest && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="rcfx-upload-btn"
                            style={{
                              marginTop: '8px', 
                              padding: '6px 12px', 
                              background: '#3b82f6', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            📎 Upload Document
                          </button>
                        )}
                        <div className="rcfx-msg-time">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="rcfx-chat-input-row">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    style={{display: 'none'}}
                    id="file-upload-dispute"
                  />
                  <label 
                    htmlFor="file-upload-dispute" 
                    className="rcfx-attach-btn" 
                    style={{
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      marginRight: '8px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    📎 Attach
                  </label>
                  {selectedFile && (
                    <span style={{fontSize: '12px', color: '#666', marginRight: '8px'}}>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                  <input
                    className="rcfx-chat-input"
                    placeholder="Type your message to admin..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                  />
                  <button 
                    className="rcfx-btn rcfx-btn-primary" 
                    disabled={sending || uploadingFile} 
                    onClick={sendMessage}
                  >
                    {uploadingFile ? 'Uploading...' : sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {error && <div className="rcfx-error" role="alert">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default DisputeChatPage;
