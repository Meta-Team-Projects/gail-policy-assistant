import { useState, useEffect, useRef } from 'react'
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    ButtonGroup,
    Button,
    Avatar,
    AppBar,
    Toolbar,
    InputAdornment,
    SvgIcon,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
} from '@mui/material'
import {
    Send,
    Mic,
    AutoFixHigh,
    ContentCopy,
    Share,
    Summarize,
    FormatColorText,
    AutoGraph,
    Search,
    Add,
    Flag,
    VolumeUp,
    Source,
    IosShare,
    Person,
    PersonAdd,
    AttachFile,
    Download,
} from '@mui/icons-material'

import NavigateBefore from '@mui/icons-material/NavigateBefore'
import NavigateNext from '@mui/icons-material/NavigateNext'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilePresentIcon from '@mui/icons-material/FilePresent'
import { drawerWidth, collapsedWidth } from './Sidebar'

import Linkify from 'react-linkify'

import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'



const MainContent = ({ 
    sessions, 
    rightSidebarOpen, 
    leftSidebarOpen, activeRightMenu, 
    activeSessionID, onDraftGenerated, 
    onMenuClick, 
    messages, setMessages, 
    layoutMode, setLayoutMode,
    showNotepad,  onNotepadToggle,
    dimMainContent 
    }) => {
    const messageRefs = useRef({})
    const [message, setMessage] = useState('')
    const [cutoff,  setCutoff]  = useState(0.80)
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const [maxWidthPx, setMaxWidthPx] = useState(0)
    const [showFilterOptions, setShowFilterOptions] = useState(false)
    const filterButtonRef = useRef(null)
    const [activeFilterPanel, setActiveFilterPanel] = useState(null);

    const [fromDay, setFromDay] = useState(1);
    const [fromMonth, setFromMonth] = useState(6);
    const [fromYear, setFromYear] = useState(2024);
    const [toDay, setToDay] = useState(2);
    const [toMonth, setToMonth] = useState(6);
    const [toYear, setToYear] = useState(2025);

    const BASE_URL = import.meta.env.VITE_CHAT_API_URL;

    const [showLayoutIcons, setShowLayoutIcons] = useState(false)
    
    const toggleLayoutIcons = () => {
        setShowLayoutIcons(prev => !prev)
    }

    const categoryOptions = [
        'All Documents',
        'Human Resources',
        'Contract & Procurement',
        'Delegation of Powers'
    ];
    const [categoryFilter, setCategoryFilter] = useState('All Documents');
    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
    };

    const handleSend = async () => {
    const query = message.trim()
    setMessage('')
    if (!query) return

    // push user’s message
    const userMessage = {
        type: 'user',
        content: query,
        timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
        // 2) call API
        const resp = await axios.post(`${BASE_URL}/query`, { query })
        
        const answerText = resp.data?.answer     || ''
        const references = resp.data?.references || []

        const aiMessage = {
            type: 'ai',
            answer: answerText,
            pages: references,       // array of reference‐objects
            currentPage: 0,
            timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, aiMessage])


    } catch (error) {
        console.error('Error sending message:', error)

        // error-status logic
        let errorMessage = "I couldn't process that request at the moment. Please try again later."
        if (error.response) {
        if (error.response.status === 404) {
            errorMessage = "I couldn't find any relevant information for your query. Please try rephrasing your question."
        } else if (error.response.status === 400) {
            errorMessage = "I couldn't understand your query. Please try rephrasing your question."
        } else if (error.response.status === 500) {
            errorMessage = "There was an error processing your request. Please try again later."
        }
        } else if (error.request) {
        errorMessage = "I'm having trouble connecting to the server. Please check your internet connection and try again."
        }

        const errorResponse = {
        type: 'ai',
        answer: `**ERROR:** ${errorMessage}`,
        pages: [],                // no pages in an error
        currentPage: 0,
        timestamp: new Date().toISOString(),
        isError: true,
        };
        setMessages(prev => [...prev, errorResponse])

    } finally {
        setLoading(false)
    }
    }


    const formatResponse = (response) => {
        if (typeof response === 'string') return response
        if (!response) return ''

        // Handle error responses
        if (response.error) {
            return `**ERROR:** ${response.message}`
        }

        // Known fields 
        const knownFields = [
            'page_num',
            'source_file',
            'page_content',
            'doc_link',
        ]

        // markdown for known fields
        let markdown = knownFields
            .filter(field => response[field] !== undefined)
            .map(field => {
                if (field === 'has_answer') {
                    return `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field] ? 'Yes' : 'No'}`
                }
                if (field === 'source_file') {
                    return `**FILE:** ${response.source_file}\n\n\n`
                }
                if (field === 'page_content') {
                    // the snippet you want to display per page
                    //return `${response.page_content}\n\n\n`
                    return '';//skip rendering page_content
                }
                if (field === 'doc_link') {
                    // strip off any query params, then append #page=
                    const url = response.doc_link.split('?')[0] + `#page=${response.page_num}`
                    return `**DOCUMENT:** [View Document](${url})\n\n\n`
                }
                if (field === 'page_num') {
                    return `**PAGE:** ${response.page_num}\n\n\n`;
                }
                return `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field]}\n\n\n`
            })
            .join('')

        // additional fields 
        const additionalFields = Object.keys(response)
            .filter(field => !knownFields.includes(field) && field !== 'error')
            .map(field => `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field]}\n\n`)
            .join('')

        if (additionalFields) {
            markdown += '\n**Additional Information:**\n\n' + additionalFields
        }

        return markdown
    }

    const actionButtons = [
        { icon: <Summarize />, label: 'Summarize' },
        // { icon: <FormatColorText />, label: 'Highlight' },
        { icon: <AutoFixHigh />, label: 'Simplify' },
        // { icon: <AutoGraph />, label: 'Graph' },
    ]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }, [messages])

    const goToPage = (msgIndex, delta) => {
        setMessages(prev =>
        prev.map((m, i) => {
            if (i === msgIndex && m.type === 'ai' && Array.isArray(m.pages)) {
            const next = m.currentPage + delta
            return {
                ...m,
                currentPage: Math.min(Math.max(next, 0), m.pages.length - 1)
            }
            }
            return m
        })
        )
    }

      const handleDownload = async (msgIndex) => {
        const element = messageRefs.current[msgIndex]
        if (!element) return

    // 1) Convert the DOM node to canvas (white background)
    const clone = element.cloneNode(true)
    const wrapper = document.createElement('div')
    wrapper.style.padding = '20px'
    wrapper.style.backgroundColor = '#ffffff'
    wrapper.appendChild(clone)

    document.body.appendChild(wrapper)
    const canvas = await html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
    })
    document.body.removeChild(wrapper)

    // 2) Generate a PDF blob
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    const pdfBlob = pdf.output('blob')

    // 3) If File System Access API is available, show a native “Save As…” dialog
    if (window.showSaveFilePicker) {
        try {
        // Let user pick a location + filename (MIME is application/pdf)
        const handle = await window.showSaveFilePicker({
            suggestedName: 'response.pdf',
            types: [
                {
                description: 'PDF Document',
                accept: { 'application/pdf': ['.pdf'] },
                },
            ],
        })

        // Create a writable stream, write the blob, and close
        const writable = await handle.createWritable()
        await writable.write(pdfBlob)
        await writable.close()
        } catch (fsError) {
        // If user cancels or an error occurs, silently fall back to the <a> fallback
        console.warn('File System Access API save canceled or failed:', fsError)
        const blobUrl = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'response.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
    }
    } else {
      // 4) Fallback for browsers that do not support showSaveFilePicker:
        const blobUrl = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'response.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
    }
    }

    const handleCopy = (answerText, referencePage) => {
    let textToCopy = `ANSWER: ${answerText}`;

    if (referencePage) {
    const sourceMarkdown = formatResponse(referencePage);
    textToCopy += `\n\nSOURCE:\n${sourceMarkdown.replace(/\*\*/g, '')}`;
    }

    navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
    })
    .catch((err) => {
        console.error('Failed to copy: ', err);
    });
    };

    useEffect(() => {
        let widest = 0
        Object.values(messageRefs.current).forEach(el => {
            if (!el || !el.offsetWidth) return
            widest = Math.max(widest, el.offsetWidth)
        })
        if (widest > maxWidthPx) setMaxWidthPx(widest)
    }, [messages])

    const handleActionClick = (action) => {
        const actionTexts = {
            "Summarize": "Please summarize this text",
            "Highlight": "Highlight the key points",
            "Simplify": "Explain this in simple terms"
        };
        setMessage(actionTexts[action] || "");
    };

    return (
        <Box
            sx={{
                marginTop: '2.5vh',
                height: '95vh',
                marginLeft: '1.5vh',
                boxShadow: '2px 0px 8px #50505040',
                borderRadius: '15px',
                overflow: 'hidden', 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                ml: 3,
                maxWidth: {
                    xs: '90%',  
                    sm: '94.5%',  
                    md: '97%', // Desktop
                },
                transition: 'max-width 0.3s ease',
                bgcolor:'#FFFFFF',
                //bgcolor: 'linear-gradient(180deg, #1F2A44 0%, #000B25 100%)',
                position: 'relative',
                filter: dimMainContent ? 'grayscale(0.5) brightness(0.5)' : 'none',
            }}
        >
            {/* Top Bar */}
            <Toolbar sx={{ minHeight: '64px !important' }}>
                <Box
                    sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    px: 3,
                    }}
                >
                {/* Left title */}
                <Box>
                    <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, fontSize:16, color: '#081A33', ml: -2 }}
                    >
                    Policy Documents
                    </Typography>
                </Box>

               {/* Right icons + category dropdown */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl
                        size="small"
                        variant="outlined"
                        sx={{
                            minWidth: 280,
                            maxWidth: 280,
                            '& .MuiInputLabel-root': {
                            color: '#081A33',
                            fontWeight: 500,
                            '&.Mui-focused': {
                                    color: '#081A33',
                                },
                            },
                            '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#081A33',
                            },
                            '&:hover fieldset': {
                                borderColor: '#081A33',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#081A33',
                            },
                            '& .MuiSelect-icon': {
                                color: '#081A33',
                            },
                            },
                            '& .MuiSelect-root': {
                            color: '#081A33',
                            fontWeight: 600,
                            },
                        }}
                        >
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={handleCategoryChange}
                            label="Category"
                            IconComponent={ExpandMoreIcon} 
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: '#FFFFFF', // Solid white background
                                        boxShadow: 3,       // Add a slight shadow for better visibility
                                    }
                                }
                            }}                >
                            {categoryOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <IconButton
                    sx={{
                        border: '1px solid #081A33',
                        borderRadius: '8px',
                        py: 1,
                        px: 1,
                        color: '#081A33',
                        display: 'none'
                    }}
                    >
                    <PersonAdd sx={{ width: '18px', height: 'auto' }} />
                    </IconButton>
                </Box>
            </Box>
            </Toolbar>


            {/* Chat Messages */}
            {messages.length === 0
                ? (
                <Box
                    sx={{
                    color: 'grey',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    justifyItems: 'center',
                    height: '100%',
                    textAlign: 'center',
                    ml: 2,
                    mr: 2,
                    }}
                >
                    Select a document category to begin exploring policies. You can ask questions, retrieve specific clauses, or get summaries instantly.
                </Box>
                )
                : (
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    px: { xs: 2, sm: 2, md: 2, lg: 2 },
                    py: 1,
                    maxWidth: '1400px',
                    ml: 2,
                    width: '95%',
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                    },
                }}
            >
                {messages.map((msg, index) => {
                    const isPagedAI = msg.type === 'ai' && Array.isArray(msg.pages) && !msg.isError
                    // extract the static answer text
                    const answerText = msg.answer ?? msg.content
                    // extract the current reference (only if pages exists)
                    const referencePage = isPagedAI
                    ? msg.pages[msg.currentPage]
                    : null
                    const isLast = index === messages.length - 1
                    return (
                        <Box
                            key={index}
                            ref={isLast ? messagesEndRef : null}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                mb: 3,
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                maxWidth: '1400px',
                                mx: 'auto',
                                width: '100%',
                            }}
                        >
                            <Avatar
                                sx={{
                                    background: msg.type === 'user'
                                    ? '#FFD95C'                                                   // user: yellow
                                    : 'conic-gradient(from 180deg at 50% 50%, #FFD95C 0deg, #FF715E 360deg)',  
                                    width: 40,
                                    height: 40,
                                    mt: 0.5,
                                    flexShrink: 0,
                                }}
                                >
                                {msg.type === 'user' 
                                    ? <Person sx={{ color: '#081A33', fontSize: 20 }} />       // user icon
                                    : <></>      // AI icon
                                }
                            </Avatar>
                            <Box sx={{
                                flex: 1,
                                minWidth: 0,
                            }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        border: msg.type === 'user' 
                                            ? 'none'
                                            : msg.isError
                                                ? 'none'
                                                : '1px solid #003699',
                                        background: msg.type === 'user'
                                            ? '#FFD95C1A'
                                            : msg.isError
                                                ? 'rgba(252, 72, 72, 0.30)'
                                                : 'linear-gradient(to right,rgba(230, 240, 250, 1), rgba(204, 229, 255, 1))',
                                        color: msg.type === 'user' || msg.isError ? '#303308' : '#003366',
                                        borderRadius: '12px',
                                        borderTopLeftRadius: '2px',
                                        width: 'fit-content',
                                        maxWidth: '100%',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                        '&:hover': {
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                        },
                                    }}
                                >
                                    {msg.type === 'ai' ? (
                                        msg.isError ? (
                                                <Typography sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                                <strong>ERROR:</strong> {answerText.replace(/^\*\*ERROR:\*\*\s*/, '')}
                                                </Typography>
                                        ) : (
                                            <>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                                ),
                                                p: ({ node, ...props }) => (
                                                    <Typography
                                                        {...props}
                                                        sx={{
                                                            fontSize: '1rem',
                                                            lineHeight: 1.6,
                                                            letterSpacing: '0.01em',
                                                            mb: 2,
                                                            color: 'inherit',
                                                        }}
                                                    />
                                                ),
                                                h1: ({ node, ...props }) => (
                                                    <Typography
                                                        {...props}
                                                        variant="h5"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 2,
                                                            color: 'inherit',
                                                        }}
                                                    />
                                                ),
                                                h2: ({ node, ...props }) => (
                                                    <Typography
                                                        {...props}
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 2,
                                                            color: 'inherit',
                                                        }}
                                                    />
                                                ),
                                                h3: ({ node, ...props }) => (
                                                    <Typography
                                                        {...props}
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 2,
                                                            color: 'inherit',
                                                        }}
                                                    />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <Box
                                                        component="ul"
                                                        sx={{
                                                            pl: 3,
                                                            mb: 2,
                                                            '& li': {
                                                                mb: 1,
                                                            },
                                                        }}
                                                        {...props}
                                                    />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <Box
                                                        component="ol"
                                                        sx={{
                                                            pl: 3,
                                                            mb: 2,
                                                            '& li': {
                                                                mb: 1,
                                                            },
                                                        }}
                                                        {...props}
                                                    />
                                                ),
                                                li: ({ node, ...props }) => (
                                                    <Typography
                                                        component="li"
                                                        sx={{
                                                            fontSize: '1rem',
                                                            lineHeight: 1.6,
                                                            color: 'inherit',
                                                        }}
                                                        {...props}
                                                    />
                                                ),
                                                table: ({ node, ...props }) => (
                                                    <Box sx={{ overflowX: 'auto', mb: 2 }}>
                                                        <table
                                                            {...props}
                                                            style={{
                                                                borderCollapse: 'collapse',
                                                                width: '100%',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            }}
                                                        />
                                                    </Box>
                                                ),
                                                th: ({ node, ...props }) => (
                                                    <th
                                                        {...props}
                                                        style={{
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            padding: '12px',
                                                            textAlign: 'left',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        }}
                                                    />
                                                ),
                                                td: ({ node, ...props }) => (
                                                    <td
                                                        {...props}
                                                        style={{
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            padding: '12px',
                                                        }}
                                                    />
                                                ),
                                                code: ({ node, ...props }) => (
                                                    <Box
                                                        component="code"
                                                        sx={{
                                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                            p: '2px 4px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.9em',
                                                            fontFamily: 'monospace',
                                                        }}
                                                        {...props}
                                                    />
                                                ),
                                                pre: ({ node, ...props }) => (
                                                    <Box
                                                        component="pre"
                                                        sx={{
                                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                            p: 2,
                                                            borderRadius: '8px',
                                                            overflowX: 'auto',
                                                            mb: 2,
                                                        }}
                                                        {...props}
                                                    />
                                                ),
                                                blockquote: ({ node, ...props }) => (
                                                    <Box
                                                        component="blockquote"
                                                        sx={{
                                                            borderLeft: '4px solid rgba(255, 255, 255, 0.2)',
                                                            pl: 2,
                                                            py: 1,
                                                            my: 2,
                                                            color: 'inherit',
                                                        }}
                                                        {...props}
                                                    />
                                                ),
                                            
                                            }}
                                        >
                                            {/* 1) Answer */}
     {`**Answer:**  ${answerText} \n\n
**References:**`}
                                        </ReactMarkdown>
                                          {/* 2) All pages in one list */}
                                        {Array.isArray(msg.pages) && msg.pages.map((ref, idx) => {
                                            const url = ref.doc_link.split('?')[0] + `#page=${ref.page_num}`;
                                            return (
                                                <Box key={idx} sx={{ mb:1 }}>
                                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                                    File: {ref.source_file} (Page Number: {ref.page_num})
                                                </Typography>
                                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                                    Document Link: <a href={url} target="_blank" rel="noopener noreferrer">View Document</a>
                                                </Typography>
                                            </Box>
                                            );
                                        })}</>
                                        )  
                                    ) : (
                                        
                                        <Linkify
                                            componentDecorator={(decoratedHref, decoratedText, key) => (
                                                <a
                                                href={decoratedHref}
                                                key={key}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                >
                                                {decoratedText}
                                                </a>
                                            )}
                                            >
                                            <Typography
                                                sx={{
                                                fontSize: '1rem',
                                                lineHeight: 1.6,
                                                letterSpacing: '0.01em',
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-word',
                                                color: 'inherit',
                                                }}
                                            >
                                                {msg.content}
                                            </Typography>
                                        </Linkify>
                                    )}
                                    {msg.type === 'ai' && !msg.isError && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    {/* Left: Flag & Volume */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton size="small" sx={{ p: '2px', color: '#003366' }}>
                                            <Source sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopy(answerText, referencePage)}
                                            sx={{ p: '2px', color: '#003366' }}
                                        >
                                            <ContentCopy sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size="small" sx={{ p: '2px', color: '#003366' }}>
                                            <IosShare sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Box>
                                    {/* Right: Source, Copy, Share, Download */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                            size="small"
                                            sx={{ p: '2px', color: '#003366' }}
                                        >
                                            <BookmarkBorderIcon sx={{ fontSize: 16 }} />
                                        </IconButton>                                                    
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                    // 1) Grab the question that preceded this AI message:
                                                const userMsg    = messages[index - 1] || {};
                                                const title      = userMsg.content || 'Saved Query';

                                                // 2) Pull in both the static answer text and the current reference page:
                                                const answer     = answerText;   // already in scope
                                                const sourceMd   = referencePage
                                                ? formatResponse(referencePage)
                                                : '';

                                                // 3) Build one markdown blob containing both:
                                                const content = [
                                                `**ANSWER:** ${answer}`,
                                                ``,
                                                sourceMd
                                                ].join('\n\n');

                                                // 4) Persist to localStorage
                                                const note = {
                                                title,
                                                content,
                                                date: new Date().toLocaleDateString('en-GB')
                                                };
                                                const key = `savedQuery_${Date.now()}`;
                                                localStorage.setItem(key, JSON.stringify(note));

                                                // 5) Tell your SavedQueries panel to reload
                                                window.dispatchEvent(new Event('saved-query'));
                                            }}
                                            sx={{ p: '2px', color: '#003366' }}
                                        >
                                            <Download sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size="small" sx={{ p: '2px', color: '#003366' }}>
                                            <VolumeUp sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Box>
                                </Box>)}
                                </Paper>
                            </Box>
                        </Box>
                    )
                })}
                <div ref={messagesEndRef} />
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography
                            sx={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.813rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <span className="typing-dot">•</span>
                            <span className="typing-dot">•</span>
                            <span className="typing-dot">•</span>
                        </Typography>
                    </Box>
                )}
            </Box>
        )}

            {/* Bottom Bar */}
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    mt: 'auto',
                    ml: '2.5vh',
                    mr: '2.5vh',
                    mb: '1.5vh',
                    transition: 'left 0.3s ease, right 0.3s ease',
                    bgcolor: 'transparent',
                    zIndex: 3,
                }}
            >
                {/* Action Buttons */}
                <ButtonGroup
                    variant="text"
                    sx={{
                        gap: 0.5,
                        '& .MuiButton-root': {
                            color: '#515151',
                            bgcolor: '#FFD95C33',
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            border: 'none',
                            minWidth: 'auto',
                            fontWeight: 500,
                            mb: 1,
                            '&:hover': {
                                bgcolor: '#ffd95c',
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.125rem',
                                marginRight: '6px',
                            },
                        }
                    }}
                >
                    {actionButtons.map((button) => (
                        <Button
                            key={button.label}
                            startIcon={button.icon}
                            onClick={() => handleActionClick(button.label)}
                            sx={{
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                }
                            }}
                        >
                            {button.label}
                        </Button>
                    ))}
                    <Button
                        startIcon={<Add />}
                        sx={{
                            ml: 0.5,
                            borderLeft: '1px solid rgba(255, 255, 255, 0.08) !important',
                            paddingLeft: '12px !important',
                        }}
                    >
                        More
                    </Button>
                </ButtonGroup>
                <Box
                    sx={{
                        maxWidth: 'auto',
                        mx: 'auto',
                        my: 'auto',
                        width: '100%',
                        px: { xs: 2, sm: 2, md: 2, lg: 2 },
                        py: 1.5,
                        bgcolor: '#1846870D',
                    border: '1px solid #081A33',
                    borderRadius: '15px',
                    }}
                >
                    
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: '1px',
                        }}
                    >
                    {/* Wrapper for Input + Below Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        {/* Top Row: Mic + Input + Send */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                sx={{
                                    bgcolor: '#FFD95C',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    color: '#515151',
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                onClick={() => {/* Handle Mic */}}
                            >
                                <Mic sx={{ fontSize: 18 }} />
                            </IconButton>

                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Ask or search anything..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        height: '36px',
                                        color:'#878787',
                                        backgroundColor: '#FFD95C1A',
                                        '& fieldset': {
                                            borderColor: '#51515133',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#51515133',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#515151',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        padding: '8px 14px',
                                        fontSize: '0.875rem',
                                    },
                                }}
                            />

                            <IconButton
                                sx={{
                                    bgcolor: '#FFD95C',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    color: '#515151',
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                onClick={handleSend}
                            >
                                <Send sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>

                        {/* Bottom Row: 2 Left buttons + 1 Right button */}
                        <Box
                            sx={{
                                display: 'none',//switch to flex
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                sx={{
                                bgcolor: '#FFD95C',
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                color: '#515151',
                                '&:hover': { bgcolor: '#FFCB42' },
                                }}
                                onClick={() => { /* handle file attach */ }}
                            >
                                <AttachFile sx={{ fontSize: 18 }} />
                            </IconButton>

                                <IconButton
                                    sx={{
                                        bgcolor: '#FFD95C',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        color: '#515151',
                                        '&:hover': {
                                            bgcolor: '#FFCB42',
                                        },
                                    }}
                                >
                                    <img src="./star-icon.svg" alt="Star" style={{ width: 24, height: 24 }} />
                                </IconButton>
                            </Box>

                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#FFD95C',
                                    color: '#515151',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    px: 2,
                                    py: 0.8,
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                startIcon={<AutoFixHigh />}
                            >
                                Enhance
                            </Button>
                        </Box>
                    </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    )
}

export default MainContent 