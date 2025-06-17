import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack,
    Button,
    Divider,
    Collapse,
    Tooltip
} from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download,
    Edit,
    Delete,
    Add as AddIcon,
    ContentCopy,
} from '@mui/icons-material'

import FilterListIcon from '@mui/icons-material/FilterList';
import PushPinIcon from '@mui/icons-material/PushPin';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
import jsPDF from 'jspdf'

const SavedQueries = ({ open, onToggle }) => {
    const categories = ['All', 'HR', 'Finance', 'Procurement']
    const [notes, setNotes] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [isWide, setIsWide] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const handleToggle = (key) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const loadNotes = () => {
        const all = Object.keys(localStorage)
            .filter(k => k.startsWith('savedQuery_'))
            .map(k => {
                const note = JSON.parse(localStorage.getItem(k));
                return { key: k, ...note };
            })
            // pinned notes first
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        setNotes(all);
    };
    useEffect(() => {
        loadNotes();
        window.addEventListener('saved-query', loadNotes);
        return () => window.removeEventListener('saved-query', loadNotes);
    }, []);


    const handleDelete = (key) => {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event('saved-query'));
    };
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
    const handleDownload = async (note) => {
        const pdf = new jsPDF();
        const lines = pdf.splitTextToSize(note.content, 180);
        pdf.text(lines, 10, 10);
        const pdfBlob = pdf.output('blob');
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${note.title}.pdf`,
                    types: [{
                        description: 'PDF Document',
                        accept: { 'application/pdf': ['.pdf'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(pdfBlob);
                await writable.close();
                return;
            } catch (fsError) {
                console.warn('Save canceled or failed:', fsError);
            }
        }
        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${note.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    };
    const handlePin = (key) => {
        const note = JSON.parse(localStorage.getItem(key));
        note.pinned = !note.pinned;
        localStorage.setItem(key, JSON.stringify(note));
        window.dispatchEvent(new Event('saved-query'));
    };

    return (
        <Paper
            sx={{
                width: open ? (isWide ? 900 : 500) : 0,
                height: '93vh',
                position: 'fixed',
                right: '2.5vh',
                top: '3.5vh',
                bgcolor: 'background.sidebar',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                borderLeft: '0.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0px 4px 8px rgba(18, 18, 18, 0.25)',
                borderRadius: '15px',
                zIndex: 1100,
            }}
        >
            <Box sx={{
                p: 3,
                position: 'relative',
                bgcolor: 'background.sidebar',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Download sx={{color: '#081A33'}}/> 
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#081A33' }}>
                            Saved Queries
                        </Typography>
                    </Box>
                    {open && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                onClick={() => setIsWide(prev => !prev)}
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                {isWide ?
                                <Tooltip title="Collapse" placement="left" arrow> 
                                <CloseFullscreenIcon sx={{color: '#081A33'}}/> 
                                </Tooltip>: 
                                <Tooltip title="Expand" placement="left" arrow>
                                <AspectRatioIcon sx={{color: '#081A33'}}/>
                                </Tooltip>}
                            </IconButton>
                            <IconButton
                                onClick={onToggle}
                                sx={{
                                    color: '#081A33',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <Tooltip title="Close" placement="bottom" arrow>
                                <ChevronRight />
                                </Tooltip>
                            </IconButton>
                        </Box>
                    )}

                </Box>

                <Divider sx={{ my: 1, mx: -3, borderColor: '#e0e0e0' }} />
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search here..."
                    size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#0088D614',
                            borderRadius: 10,
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#b1b8bb' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <FilterListIcon sx={{ color: '#b1b8bb' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Stack direction="row" spacing={1} sx={{ mb: -1, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{
                        display: 'flex', flexWrap: 'wrap',
                        gap: 1, flexGrow: 1}}>
                        {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            onClick={() => setSelectedCategory(category)}
                            variant="filled"
                            size="small"
                            sx={{
                                px: 1,
                                fontWeight: 500,
                                color: '#081A33',
                                borderRadius: '16px',
                                bgcolor: selectedCategory === category ? '#edcc09' : '#FFD95C',
                                '&:hover': {
                                backgroundColor: '#FEC636',
                                }
                            }}
                        />
                    ))}
                    </Box>
                </Stack>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
                {notes.map((note) => (
                    <ListItem key={note.key}
                        onClick={() => handleToggle(note.key)}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: '#FFFFFFCC',
                            '&:hover': { bgcolor: '#FFFFFFE6' },
                            boxShadow: '2px 8px 16px #DDEFFF',
                            borderRadius: 3,
                            mb: 1,
                            px: 2,
                            pt: 1,
                            pb: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            position: 'relative',
                        }}>
                    `   <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                        e.stopPropagation();
                                        handlePin(note.key)}}
                            >
                                <Tooltip title="Pin" placement='right' arrow>
                                <PushPinIcon
                                    sx={{
                                        fontSize: '1rem',
                                        fill: note.pinned ? 'black' : 'none',
                                        stroke: 'black',
                                        strokeWidth: 1.5,
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                                </Tooltip>
                            </IconButton>
                        </Box> 
                        <Box sx={{ position: 'absolute', top: 8, right: 20 }}>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Copy" placement='top' arrow>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(note.content)}}
                                    sx={{ 
                                        height: 24, width: 24, bgcolor: '#FFD95C', borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: '#FEC636', 
                                        }, 
                                    }}>
                                    <ContentCopy sx={{ fontSize: '0.8rem', color: '#000000' }} />
                                </IconButton>
                                </Tooltip>
                                <Tooltip title="Download" placement='top' arrow>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(note)}}
                                    sx={{ height: 24, width: 24, bgcolor: '#FFD95C', borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: '#FEC636', 
                                        }, 
                                    }}>
                                    <Download sx={{ fontSize: '0.8rem', color: '#000000' }} />
                                </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                            mt: 0.5
                        }}>
                            <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 600, fontSize: 'large' }}>
                                {note.title}
                            </Typography>
                            <IconButton size="small" >
                                <ChevronRight sx={{
                                    transform: expanded[note.key] ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                    color: '#000',
                                }} />
                            </IconButton>
                        </Box>
                        {/* Bottom Bar: Date + Delete */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 0,
                        }}>
                            <Typography variant="caption" sx={{ color: '#aaa' }}>
                                {note.date}
                            </Typography>
                            <IconButton
                                size="small"
                                sx={{ p: 0.5 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(note.key);
                                }}
                            >
                                <Tooltip title="Delete" placement='bottom' arrow>
                                <Delete sx={{ fontSize: '1rem', color: '#f08a8a' }} />
                                </Tooltip>
                            </IconButton>
                        </Box>
                        <Collapse in={expanded[note.key]} timeout="auto" unmountOnExit>
                            <Box sx={{ ml: 2, mr: 2, mb: 1 }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                    {note.content}
                                </ReactMarkdown>
                            </Box>
                        </Collapse>

                    </ListItem>
                ))}
            </List>

        </Paper>
    )
}

export default SavedQueries 