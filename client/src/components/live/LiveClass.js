import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  Button,
  Avatar,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Zoom,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  CallEnd as CallEndIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  PanTool as HandIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const LiveClass = ({ classId, className, isTeacher, onEnd }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [raisedHands, setRaisedHands] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reactionCounts, setReactionCounts] = useState({
    like: 0,
    dislike: 0,
    hand: 0
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState({
    video: '',
    audio: ''
  });
  const [devices, setDevices] = useState({
    video: [],
    audio: []
  });
  const [teacherStream, setTeacherStream] = useState(null);
  const [isTeacherOnline, setIsTeacherOnline] = useState(false);

  const myVideo = useRef();
  const teacherVideo = useRef();
  const videoContainer = useRef();
  const peersRef = useRef([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnectionStatus('connected');
      
      if (isTeacher) {
        // Teacher starts the class and shares their stream
        initializeMedia();
        newSocket.emit('teacher-started', { 
          classId, 
          userId: user._id, 
          name: user.name 
        });
      } else {
        // Students join and wait for teacher's stream
        newSocket.emit('join-live-class', { 
          classId, 
          userId: user._id, 
          name: user.name 
        });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setConnectionStatus('error');
      setError('Failed to connect to server. Please check your internet connection.');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setConnectionStatus('disconnected');
    });

    // Listen for teacher status
    newSocket.on('teacher-started', () => {
      setIsTeacherOnline(true);
    });

    // Listen for reactions
    newSocket.on('new-reaction', (reaction) => {
      setReactions(prev => [...prev, { ...reaction, id: Date.now() + Math.random() }]);
      setReactionCounts(prev => ({
        ...prev,
        [reaction.type]: prev[reaction.type] + 1
      }));
      
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    // Listen for raised hands
    newSocket.on('hand-raised', (data) => {
      setRaisedHands(prev => [...prev, data]);
      setReactionCounts(prev => ({
        ...prev,
        hand: prev.hand + 1
      }));
    });

    newSocket.on('hand-lowered', (data) => {
      setRaisedHands(prev => prev.filter(h => h.userId !== data.userId));
      setReactionCounts(prev => ({
        ...prev,
        hand: Math.max(0, prev.hand - 1)
      }));
    });

    // Listen for chat messages
    newSocket.on('new-chat-message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    // Listen for student list updates
    newSocket.on('student-list', (studentList) => {
      setStudents(studentList);
      setParticipantCount(studentList.length + (isTeacher ? 1 : 0));
    });

    // Listen for teacher's stream signal
    newSocket.on('teacher-signal', ({ signal }) => {
      if (!isTeacher) {
        // Student receives teacher's signal and creates peer connection
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream
        });

        peer.on('signal', (signal) => {
          newSocket.emit('student-signal', { 
            classId, 
            userId: user._id, 
            signal 
          });
        });

        peer.on('stream', (teacherStream) => {
          // Student receives teacher's video stream
          setTeacherStream(teacherStream);
          if (teacherVideo.current) {
            teacherVideo.current.srcObject = teacherStream;
          }
        });

        peer.signal(signal);
        peersRef.current.push({ peer, userId: 'teacher' });
      }
    });

    newSocket.on('student-signal', ({ userId, signal }) => {
      if (isTeacher) {
        // Teacher receives signal from student and connects
        const peer = peersRef.current.find(p => p.userId === userId);
        if (peer) {
          peer.peer.signal(signal);
        }
      }
    });

    // Listen for teacher's media toggles
    newSocket.on('teacher-audio-toggle', ({ muted }) => {
      console.log('Teacher audio toggled:', muted);
    });

    newSocket.on('teacher-video-toggle', ({ off }) => {
      console.log('Teacher video toggled:', off);
    });

    newSocket.on('teacher-screen-share', ({ sharing }) => {
      console.log('Teacher screen share:', sharing);
    });

    // Listen for class ended
    newSocket.on('class-ended', () => {
      alert('Class has ended by the teacher.');
      if (onEnd) onEnd();
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(({ peer }) => peer.destroy());
      newSocket.disconnect();
    };
  }, [classId, user, isTeacher]);

  // Initialize media devices for teacher
  const initializeMedia = async (deviceId = null) => {
    try {
      const constraints = {
        video: deviceId?.video ? { deviceId: { exact: deviceId.video } } : true,
        audio: deviceId?.audio ? { deviceId: { exact: deviceId.audio } } : true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }

      // Create peer connections for each student
      students.forEach(student => {
        createPeer(student.userId, mediaStream);
      });

      setError(null);
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      setDevices({
        video: videoDevices,
        audio: audioDevices
      });
      
      if (videoDevices.length > 0) {
        setSelectedDevice(prev => ({ ...prev, video: videoDevices[0].deviceId }));
      }
      if (audioDevices.length > 0) {
        setSelectedDevice(prev => ({ ...prev, audio: audioDevices[0].deviceId }));
      }

    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError('Unable to access camera/microphone. Please check permissions.');
    }
  };

  // Create peer connection for a student
  const createPeer = (userId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (signal) => {
      socket.emit('teacher-signal', { classId, userId, signal });
    });

    peersRef.current.push({ peer, userId });
    return peer;
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isAudioMuted;
      });
      setIsAudioMuted(!isAudioMuted);
      
      socket?.emit('teacher-audio-toggle', { 
        classId, 
        muted: !isAudioMuted 
      });
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
      
      socket?.emit('teacher-video-toggle', { 
        classId, 
        off: !isVideoOff 
      });
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true
        });
        
        setScreenStream(screenStream);
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        peersRef.current.forEach(({ peer }) => {
          const sender = peer.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Update local video
        if (myVideo.current) {
          myVideo.current.srcObject = screenStream;
        }
        
        videoTrack.onended = () => {
          stopScreenShare();
        };
        
        setIsScreenSharing(true);
        
        socket?.emit('teacher-screen-share', { 
          classId, 
          sharing: true 
        });
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      
      // Restore camera video track
      const videoTrack = stream.getVideoTracks()[0];
      peersRef.current.forEach(({ peer }) => {
        const sender = peer.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Restore local video
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      
      setIsScreenSharing(false);
      
      socket?.emit('teacher-screen-share', { 
        classId, 
        sharing: false 
      });
    }
  };

  const sendReaction = (type) => {
    socket?.emit('send-reaction', {
      classId,
      userId: user._id,
      name: user.name,
      type
    });
  };

  const raiseHand = () => {
    const isHandRaised = raisedHands.some(h => h.userId === user._id);
    
    if (!isHandRaised) {
      socket?.emit('raise-hand', {
        classId,
        userId: user._id,
        name: user.name
      });
    } else {
      // Lower hand if already raised
      socket?.emit('lower-hand', {
        classId,
        userId: user._id
      });
    }
  };

  const lowerHand = (userId) => {
    socket?.emit('lower-hand', {
      classId,
      userId
    });
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket?.emit('send-chat-message', {
        classId,
        userId: user._id,
        name: user.name,
        message: message.trim()
      });
      setMessage('');
    }
  };

  const endClass = () => {
    if (window.confirm('Are you sure you want to end the live class?')) {
      socket?.emit('end-live-class', { classId });
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (onEnd) onEnd();
    }
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      videoContainer.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  const changeDevice = (type, deviceId) => {
    setSelectedDevice(prev => ({ ...prev, [type]: deviceId }));
    initializeMedia({ ...selectedDevice, [type]: deviceId });
  };

  if (connectionStatus === 'connecting') {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Connecting to live class...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <WarningIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error">
            Connection Error
          </Typography>
          <Typography variant="body1" paragraph>
            {error || 'Failed to connect to the live class. Please try again.'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a1a' }}>
      {/* Header */}
      <Paper sx={{ p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">🎥 {className} - Live Class</Typography>
            <Chip 
              size="small"
              label={`${participantCount} participant${participantCount !== 1 ? 's' : ''}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            {connectionStatus === 'connected' && (
              <Chip 
                size="small"
                icon={<CheckCircleIcon />}
                label="Live"
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
            )}
          </Box>
          {isTeacher && (
            <IconButton color="inherit" onClick={endClass}>
              <CallEndIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Area */}
        <Box 
          ref={videoContainer}
          sx={{ 
            flex: chatOpen ? 3 : 4,
            position: 'relative',
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isTeacher ? (
            <video
              ref={myVideo}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: isVideoOff ? 'none' : 'scaleX(-1)'
              }}
            />
          ) : (
            <>
              {teacherStream ? (
                <video
                  ref={teacherVideo}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'white'
                  }}
                >
                  <VideocamOffIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6">Waiting for teacher to start video...</Typography>
                </Box>
              )}
            </>
          )}

          {/* Reactions Overlay */}
          <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
            {reactions.map((reaction) => (
              <Zoom in key={reaction.id}>
                <Paper 
                  sx={{ 
                    p: 1, 
                    mb: 1,
                    bgcolor: 'rgba(0,0,0,0.8)', 
                    color: 'white',
                    animation: 'float 3s ease-in-out'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                      {reaction.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {reaction.name} 
                      {reaction.type === 'like' && ' 👍'}
                      {reaction.type === 'dislike' && ' 👎'}
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            ))}
          </Box>

          {/* Reaction Counts */}
          <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
            <Paper sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.7)' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title="Likes">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUpIcon sx={{ color: '#4caf50' }} />
                    <Typography variant="body2" color="white">
                      {reactionCounts.like}
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Dislikes">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbDownIcon sx={{ color: '#f44336' }} />
                    <Typography variant="body2" color="white">
                      {reactionCounts.dislike}
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Raised Hands">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HandIcon sx={{ color: '#ff9800' }} />
                    <Typography variant="body2" color="white">
                      {reactionCounts.hand}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Paper>
          </Box>

          {/* Raised Hands (Teacher View) */}
          {isTeacher && raisedHands.length > 0 && (
            <Box sx={{ position: 'absolute', bottom: 20, left: 20, width: 300 }}>
              <Paper sx={{ p: 2, bgcolor: 'warning.main', color: 'white' }}>
                <Typography variant="subtitle2" gutterBottom>
                  ✋ Raised Hands ({raisedHands.length})
                </Typography>
                {raisedHands.map((hand) => (
                  <Box key={hand.userId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.dark' }}>
                        {hand.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{hand.name}</Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => lowerHand(hand.userId)}
                    >
                      Acknowledge
                    </Button>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {/* Controls */}
          <Box sx={{ position: 'absolute', bottom: 20, right: 20 }}>
            <Paper sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.8)' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {isTeacher ? (
                  <>
                    <Tooltip title={isAudioMuted ? 'Unmute' : 'Mute'}>
                      <IconButton onClick={toggleAudio} sx={{ color: isAudioMuted ? '#f44336' : 'white' }}>
                        {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isVideoOff ? 'Start Video' : 'Stop Video'}>
                      <IconButton onClick={toggleVideo} sx={{ color: isVideoOff ? '#f44336' : 'white' }}>
                        {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
                      <IconButton onClick={toggleScreenShare} sx={{ color: isScreenSharing ? '#4caf50' : 'white' }}>
                        {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Settings">
                      <IconButton onClick={() => setShowSettings(true)} sx={{ color: 'white' }}>
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Like">
                      <IconButton onClick={() => sendReaction('like')} sx={{ color: 'white' }}>
                        <ThumbUpIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Dislike">
                      <IconButton onClick={() => sendReaction('dislike')} sx={{ color: 'white' }}>
                        <ThumbDownIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={raisedHands.some(h => h.userId === user._id) ? 'Lower Hand' : 'Raise Hand'}>
                      <IconButton 
                        onClick={raiseHand} 
                        sx={{ 
                          color: raisedHands.some(h => h.userId === user._id) ? '#ff9800' : 'white',
                          animation: raisedHands.some(h => h.userId === user._id) ? 'pulse 1s infinite' : 'none'
                        }}
                      >
                        <HandIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                <Tooltip title="Toggle Full Screen">
                  <IconButton onClick={toggleFullScreen} sx={{ color: 'white' }}>
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={chatOpen ? 'Hide Chat' : 'Show Chat'}>
                  <IconButton onClick={() => setChatOpen(!chatOpen)} sx={{ color: chatOpen ? '#4caf50' : 'white' }}>
                    <ChatIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Chat Sidebar */}
        {chatOpen && (
          <Paper sx={{ width: 300, display: 'flex', flexDirection: 'column', bgcolor: '#2a2a2a' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Live Chat</Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {chatMessages.map((msg, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                      {msg.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      {msg.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ ml: 4, color: '#e0e0e0' }}>
                    {msg.message}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: '#333' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      bgcolor: '#444'
                    }
                  }}
                />
                <IconButton onClick={sendMessage} color="primary" sx={{ bgcolor: 'primary.main' }}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Settings</Typography>
            <IconButton onClick={() => setShowSettings(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Camera
          </Typography>
          <select 
            value={selectedDevice.video}
            onChange={(e) => changeDevice('video', e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
          >
            {devices.video.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>

          <Typography variant="subtitle2" gutterBottom>
            Microphone
          </Typography>
          <select 
            value={selectedDevice.audio}
            onChange={(e) => changeDevice('audio', e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
          >
            {devices.audio.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default LiveClass;