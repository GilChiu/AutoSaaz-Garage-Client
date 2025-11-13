import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import Sidebar from '../components/Dashboard/Sidebar';
import { getDisputeById, mapDisputeDetail, postDisputeMessage } from '../services/resolutionCenter.service';
import '../components/Dashboard/Dashboard.css';
import '../styles/resolution-center.css';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!id || !dispute) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const raw = await getDisputeById(id);
        const updated = mapDisputeDetail(raw);
        // Only update messages if new messages are available
        if (updated?.messages && dispute?.messages) {
          if (updated.messages.length > dispute.messages.length) {
            setDispute(prev => ({
              ...prev,
              messages: updated.messages
            }));
          }
        }
      } catch (e) {
        // Silent fail for polling - don't show errors
        console.error('Error polling messages:', e);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispute?.messages?.length]);

  const sendMessage = async () => {
    if (!message.trim() && !selectedFile) return;
    try {
      setSending(true);
      
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      // Upload file to Supabase Storage if selected
      if (selectedFile) {
        setUploadingFile(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dispute-attachments')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload file');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('dispute-attachments')
          .getPublicUrl(filePath);

        attachmentUrl = publicUrl;
        attachmentType = selectedFile.type;
        attachmentName = selectedFile.name;
        setUploadingFile(false);
      }
      
      // Send message with optional attachment
      const newMsg = await postDisputeMessage(id, message.trim() || 'Attachment', attachmentUrl, attachmentType, attachmentName);
      if (newMsg) setDispute(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
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
                    return (
                      <div key={m.id} className={`rcfx-msg rcfx-msg-${m.from} ${isEvidenceRequest ? 'rcfx-evidence-request' : ''}`}> 
                        {isEvidenceRequest && (
                          <div className="rcfx-evidence-badge">
                            Evidence Request - Please upload supporting documents
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
