import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ClassChat = ({ classId, className }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join class room
    newSocket.emit('join-class', classId);

    // Listen for messages
    newSocket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('user-joined', (data) => {
      setOnlineCount(prev => prev + 1);
      // Optional: Show system message
      setMessages(prev => [...prev, {
        system: true,
        text: data.message,
        timestamp: new Date().toISOString()
      }]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.emit('leave-class', classId);
      newSocket.disconnect();
    };
  }, [classId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      sender: {
        id: user._id,
        name: user.name,
        role: user.role
      },
      classId,
      timestamp: new Date().toISOString()
    };

    // Add to local messages
    setMessages(prev => [...prev, { ...messageData, isOwn: true }]);
    
    // Send via socket
    socket.emit('send-message', messageData);
    
    setNewMessage('');
    scrollToBottom();
  };

  return (
    <Paper sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: '4px 4px 0 0' }}>
        <Typography variant="h6">
          💬 Class Chat - {className}
        </Typography>
        <Typography variant="caption">
          {onlineCount} online
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem 
              key={index}
              sx={{ 
                flexDirection: 'column',
                alignItems: msg.isOwn ? 'flex-end' : 'flex-start',
                p: 1
              }}
            >
              {msg.system ? (
                <Paper sx={{ p: 1, bgcolor: '#e0e0e0', width: '100%', textAlign: 'center' }}>
                  <Typography variant="caption">{msg.text}</Typography>
                </Paper>
              ) : (
                <Box sx={{ maxWidth: '70%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                      {msg.sender?.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="caption" fontWeight="bold">
                      {msg.sender?.name} ({msg.sender?.role})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </Typography>
                  </Box>
                  <Paper 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: msg.isOwn ? '#e3f2fd' : 'white',
                      ml: msg.isOwn ? 0 : 3.5,
                      mr: msg.isOwn ? 3.5 : 0
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Paper>
                </Box>
              )}
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Message Input */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ClassChat;