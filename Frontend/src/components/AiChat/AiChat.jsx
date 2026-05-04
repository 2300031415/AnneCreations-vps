'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, IconButton, Avatar, CircularProgress } from '@mui/material';
import { MdChat, MdClose, MdSend, MdSmartToy, MdVerified, MdError } from 'react-icons/md';
import axiosClient from '@/lib/axiosClient';
import { API_URL } from '@/Store/authStore';
import useCategory from '@/hook/useCategory';

const AiChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: 'Hi! I am the Anne Creations AI Assistant. How can I help you today?',
            type: 'initial_options'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [awaitingCategory, setAwaitingCategory] = useState(false);
    const { categories } = useCategory();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (forcedText = null) => {
        const textToSend = forcedText || input;
        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const lowerMsg = textToSend.toLowerCase();

        // Logic-only Intent Detection for Downloads/Payments
        if (lowerMsg.includes('download') || lowerMsg.includes('payment') || lowerMsg.includes('transaction') || lowerMsg.includes('order')) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: 'I can help you resolve download issues. Please provide your Transaction ID (from your email/bank) and the Product Name.',
                    type: 'request_info'
                }]);
                setLoading(false);
            }, 600);
            return;
        }

        if (lowerMsg.includes('browse') || lowerMsg.includes('design')) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: 'You can explore our full collection on our Brochure Portal! Is there a specific category you are looking for? (e.g., Floral, Festive, Animal)',
                    link: 'https://brochure.lowcostfreedom.com/',
                    linkText: 'Open Brochure Portal'
                }]);
                setAwaitingCategory(true);
                setLoading(false);
            }, 600);
            return;
        }

        if (awaitingCategory) {
            setLoading(true);
            const matchedCategory = categories.find(c => 
                c.name.toLowerCase().includes(lowerMsg) || 
                lowerMsg.includes(c.name.toLowerCase())
            );

            setTimeout(() => {
                if (matchedCategory) {
                    const brochureUrl = `https://brochure.lowcostfreedom.com/category/${matchedCategory._id}?name=${encodeURIComponent(matchedCategory.name)}`;
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: `I found the ${matchedCategory.name} category for you in our Brochure! Click below to view all designs in this category.`,
                        link: brochureUrl,
                        linkText: `View ${matchedCategory.name} Designs`
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: "I couldn't find a specific category for that, but you can see everything in our brochure portal.",
                        link: 'https://brochure.lowcostfreedom.com/',
                        linkText: 'Open Brochure Portal'
                    }]);
                }
                setAwaitingCategory(false);
                setLoading(false);
            }, 800);
            return;
        }

        try {
            const res = await axiosClient.post('/api/ai/chat', { message: userMsg.text });
            const botReply = res.data;

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: botReply.reply || 'How else can I help you?',
                type: botReply.type || 'initial_options',
                data: botReply.data,
                fields: botReply.fields
            }]);

        } catch (error) {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                sender: 'bot', 
                text: 'I am here to help. Choose an option below:',
                type: 'initial_options'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySubmit = async (e, orderId, productId) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosClient.post('/api/ai/verify', { orderId, productId });
            if (res.data.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'bot',
                    text: res.data.message,
                    link: res.data.link
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'bot',
                    text: `Verification Failed: ${res.data.message}`
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Error verifying details.' }]);
        } finally {
            setLoading(false);
        }
    };

    // Render Custom Bot components inside chat
    const renderBotContent = (msg) => {
        if (msg.type === 'initial_options') {
            return (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSend("Browse the designs")}
                        sx={{ textTransform: 'none', justifyContent: 'flex-start', color: '#311807', borderColor: 'var(--primary)' }}
                    >
                        Browse the designs
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSend("I cannot download my purchase")}
                        sx={{ textTransform: 'none', justifyContent: 'flex-start', color: '#311807', borderColor: 'var(--primary)' }}
                    >
                        I cannot download my purchase
                    </Button>
                </Box>
            );
        }

        if (msg.type === 'products' && msg.data) {
            return (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                    {msg.data.map(p => (
                        <Paper key={p._id} sx={{ minWidth: 120, p: 1, cursor: 'pointer' }} onClick={() => window.location.href = `/product/${p.productModel}`}>
                            <img src={p.image ? `/image/${p.image}` : '/placeholder.png'} alt={p.productModel} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mt: 0.5 }}>{p.productModel}</Typography>
                        </Paper>
                    ))}
                </Box>
            );
        }

        if (msg.type === 'request_info') {
            return (
                <Box component="form" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleVerifySubmit(e, formData.get('orderId'), formData.get('productId'));
                }} sx={{ mt: 1, bgcolor: 'background.paper', p: 1.5, borderRadius: 2, border: '1px solid #eee' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Resolution Assistant</Typography>
                    <TextField name="orderId" size="small" placeholder="Transaction ID (e.g. order_xxx)" fullWidth sx={{ my: 1 }} required />
                    <TextField name="productId" size="small" placeholder="Product Model / Name" fullWidth sx={{ mb: 1 }} required />
                    <Button type="submit" variant="contained" size="small" fullWidth disabled={loading}>Get Download Link</Button>
                </Box>
            );
        }

        if (msg.link) {
            let href = msg.link;
            const isAbsolute = href.startsWith('http');
            const isInternal = href.startsWith('/');
            
            if (!isAbsolute && !isInternal) {
                href = `${API_URL}${href}`;
            }

            return (
                <Button
                    variant="contained"
                    color="primary"
                    href={href}
                    target={isAbsolute ? "_blank" : "_self"}
                    sx={{ mt: 1, textTransform: 'none', bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--secondary)' } }}
                >
                    {msg.linkText || 'Download Securely'}
                </Button>
            );
        }

        return null;
    };

    // State for drag
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        isDragging.current = false;
        dragStart.current = { x: e.clientX, y: e.clientY };

        const handleMouseMove = (mmEvent) => {
            const dx = dragStart.current.x - mmEvent.clientX;
            const dy = dragStart.current.y - mmEvent.clientY;

            // If moved significantly, it is a drag
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                isDragging.current = true;
                setPosition((prev) => ({
                    x: prev.x + dx,
                    y: prev.y + dy,
                }));
                dragStart.current = { x: mmEvent.clientX, y: mmEvent.clientY };
            }
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleClick = () => {
        if (!isDragging.current) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <>
            {/* Floating Toggle - Movable */}
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    position: 'fixed',
                    bottom: position.y,
                    right: position.x,
                    zIndex: 9999,
                    cursor: 'grab',
                    touchAction: 'none'
                }}
            >
                <IconButton
                    onClick={handleClick}
                    sx={{
                        bgcolor: 'white',
                        color: 'var(--primary)',
                        width: 70,
                        height: 70,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        '&:hover': { bgcolor: '#f8f9fa' },
                        p: 0,
                        overflow: 'hidden'
                    }}
                >
                    {isOpen ? <MdClose size={30} /> : (
                        <img
                            src="/assets/chatbot.png"
                            alt="Chat"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>'; }} // Fallback if image missing
                        />
                    )}
                </IconButton>
            </Box>

            {/* Chat Window - Follows Button */}
            {isOpen && (
                <Paper sx={{
                    position: 'fixed',
                    bottom: position.y + 80, // Open above the button
                    right: position.x,
                    width: 350,
                    height: 500,
                    maxWidth: 'calc(100vw - 40px)',
                    maxHeight: 'calc(100vh - 120px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                }}>
                    {/* Header */}
                    <Box sx={{ p: 2, bgcolor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src="/assets/chatbot.png" sx={{ bgcolor: 'white' }} />
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Anne Assistant</Typography>
                            <Typography variant="caption">Product & Download Support</Typography>
                        </Box>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f8f9fa' }}>
                        {messages.map((msg) => (
                            <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                                <Box sx={{ maxWidth: '85%' }}>
                                    <Paper sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: msg.sender === 'user' ? 'var(--primary)' : 'white',
                                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                                        border: msg.sender === 'user' ? 'none' : '1px solid #e0e0e0'
                                    }}>
                                        <Typography variant="body2">{msg.text}</Typography>
                                        {msg.sender === 'bot' && renderBotContent(msg)}
                                    </Paper>
                                </Box>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input Area */}
                    <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <IconButton 
                            onClick={() => handleSend()} 
                            disabled={loading || !input.trim()}
                            sx={{ bgcolor: 'var(--primary)', color: 'white', '&:hover': { bgcolor: 'var(--secondary)' } }}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : <MdSend />}
                        </IconButton>
                    </Box>
                </Paper>
            )}
        </>
    );
};

export default AiChat;

