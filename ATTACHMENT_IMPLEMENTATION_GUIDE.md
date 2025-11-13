# Dispute Attachments - Garage Client Implementation

## Files to Update

### 1. ResolutionDisputeChatPage.jsx

Add file upload functionality similar to admin client:

```jsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Add to state
const [selectedFile, setSelectedFile] = useState(null);
const [uploadingFile, setUploadingFile] = useState(false);
const fileInputRef = useRef(null);

// Update sendMessage function
const sendMessage = async () => {
  if (!message.trim() && !selectedFile) return;
  try {
    setSending(true);
    
    let attachmentUrl = null;
    let attachmentType = null;
    let attachmentName = null;

    if (selectedFile) {
      setUploadingFile(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dispute-attachments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('dispute-attachments')
        .getPublicUrl(filePath);

      attachmentUrl = publicUrl;
      attachmentType = selectedFile.type;
      attachmentName = selectedFile.name;
      setUploadingFile(false);
    }
    
    const newMsg = await postDisputeMessage(id, message.trim() || 'Attachment', attachmentUrl, attachmentType, attachmentName);
    if (newMsg) setDispute(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
    setMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  } catch (e) {
    setError('Failed to send message');
  } finally {
    setSending(false);
    setUploadingFile(false);
  }
};
```

### 2. Update Message Display in JSX

```jsx
{dispute.messages.map(m => {
  const isEvidenceRequest = m.isEvidenceRequest;
  return (
    <div key={m.id} className={`rcfx-msg rcfx-msg-${m.from} ${isEvidenceRequest ? 'rcfx-evidence-request' : ''}`}>
      {isEvidenceRequest && (
        <div className="rcfx-evidence-badge">
          📎 Evidence Request - Please upload supporting documents
        </div>
      )}
      <div className="rcfx-msg-meta">{m.from} • {new Date(m.ts).toLocaleString()}</div>
      <div className="rcfx-msg-text">{m.text}</div>
      {m.attachmentUrl && (
        <div className="rcfx-attachment">
          {m.attachmentType?.startsWith('image/') ? (
            <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer">
              <img src={m.attachmentUrl} alt={m.attachmentName} style={{maxWidth: '100%', maxHeight: '200px', borderRadius: '4px'}} />
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
          style={{marginTop: '8px', padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
        >
          Upload Document
        </button>
      )}
    </div>
  );
})}
```

### 3. Add File Input in Chat Input Area

```jsx
<div className="rcfx-chat-footer">
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
    onChange={(e) => setSelectedFile(e.target.files[0])}
    style={{display: 'none'}}
    id="file-upload-dispute"
  />
  <label htmlFor="file-upload-dispute" className="rcfx-attach-btn" style={{cursor: 'pointer'}}>
    📎 Attach
  </label>
  {selectedFile && <span style={{fontSize: '12px', color: '#666'}}>{selectedFile.name}</span>}
  <input
    className="rcfx-chat-input"
    placeholder="Type your message..."
    value={message}
    onChange={e => setMessage(e.target.value)}
    onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
  />
  <button
    className="rcfx-btn rcfx-btn-primary"
    onClick={sendMessage}
    disabled={sending || uploadingFile}
  >
    {uploadingFile ? 'Uploading...' : sending ? 'Sending...' : 'Send'}
  </button>
</div>
```

### 4. Update resolutionCenter.service.js

```javascript
export async function postDisputeMessage(id, text, attachmentUrl = null, attachmentType = null, attachmentName = null) {
  const payload = { text };
  if (attachmentUrl) {
    payload.attachmentUrl = attachmentUrl;
    payload.attachmentType = attachmentType;
    payload.attachmentName = attachmentName;
  }
  const res = await axios.post(url(`/resolution-center/${id}/messages`), payload, { headers: headers() });
  return res?.data?.data ?? res?.data;
}

export function mapDisputeDetail(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    code: raw.code || raw.disputeId || raw.id,
    orderId: raw.orderId || '—',
    customer: raw.customerName || raw.customerEmail || '—',
    phone: raw.customerPhone || '—',
    reason: raw.subject || '—',
    raisedAt: raw.raisedAt,
    status: raw.status,
    resolution: raw.resolution || null,
    resolvedBy: raw.resolvedBy || null,
    resolvedAt: raw.resolvedAt || null,
    messages: (raw.messages || []).map(m => ({
      id: m.id,
      from: m.from,
      text: m.text,
      ts: m.ts,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      attachmentName: m.attachmentName,
      isEvidenceRequest: m.isEvidenceRequest
    })),
  };
}
```

### 5. Add CSS for Evidence Request Styling

Add to `resolution-center.css`:

```css
.rcfx-evidence-request {
  background-color: #eff6ff !important;
  border-left: 4px solid #3b82f6 !important;
}

.rcfx-evidence-badge {
  font-size: 11px;
  font-weight: 600;
  color: #1e40af;
  background: #bfdbfe;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  display: inline-block;
}

.rcfx-attachment {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.rcfx-file-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
}

.rcfx-file-link:hover {
  text-decoration: underline;
}

.rcfx-upload-btn:hover {
  background: #2563eb !important;
}
```

## Installation

1. Install Supabase client in garage project:
```bash
npm install @supabase/supabase-js
```

2. Add environment variables to `.env`:
```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

1. Run the SQL migration in Supabase Dashboard (see DISPUTE_ATTACHMENTS_README.md)
2. Test file upload from admin
3. Test file upload from garage
4. Test evidence request highlighting
5. Test "Upload Document" button on evidence requests
6. Verify file size limits (10MB)
7. Verify supported file types
