import {useState, useRef, useEffect} from 'react';

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
    Tooltip,
    Divider
} from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Edit,
    Download,
    Delete,
    Note,
    Add as AddIcon,
} from '@mui/icons-material'
import PushPinIcon from '@mui/icons-material/PushPin';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const SavedNotes = ({ 
    open, onToggle,
    showNotepad,  onNotepadToggle,
    savedNotes = [],
    setSelectedNote }) => {
    const categories = ['All', 'Pinned', 'Formulated Responses']
    const [notes, setNotes] = useState(savedNotes);
    const [isWide, setIsWide] = useState(false);

    //useEffect(() => {setNotes(savedNotes);}, [savedNotes]);
    useEffect(() => {
        const withIndex = savedNotes.map((note, i) => ({
            ...note,
            originalIndex: note.originalIndex ?? i,
        }));
        setNotes(withIndex);
    }, [savedNotes]);


    const handleDelete = (index) => {
        const confirmDelete = window.confirm('Delete?');
        if (confirmDelete) {
            setNotes(prevNotes => prevNotes.filter((_, i) => i !== index));
        }
    };


    const messageRefs = useRef([]);

    const handlePinToggle = (index) => {
        setNotes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], pinned: !updated[index].pinned };

            return updated.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return a.originalIndex - b.originalIndex;
            });
        });
    };


    const handleDownload = async (index) => {
        const element = messageRefs.current[index];
        if (!element) return;

        const clone = element.cloneNode(true);
        const wrapper = document.createElement('div');
        wrapper.style.padding = '20px';
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.appendChild(clone);

        document.body.appendChild(wrapper);
        const canvas = await html2canvas(wrapper, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
        });
        document.body.removeChild(wrapper);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const pdfBlob = pdf.output('blob');

        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'note.pdf',
                    types: [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(pdfBlob);
                await writable.close();
            } catch {
                const blobUrl = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'note.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            }
        } else {
            const blobUrl = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'note.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        }
    };


    return (
        <Paper
            sx={{
                width: open ? (isWide ? 900 : 500) : 0,
                height: '93vh',
                position: 'fixed',
                right: '3.5vh',
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
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Note /> 
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Saved Notes
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
                                    {isWide ? <CloseFullscreenIcon /> : <AspectRatioIcon />}
                                </IconButton>
                                <IconButton
                                    onClick={onToggle}
                                    sx={{
                                        color: 'text.primary',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    <ChevronRight />
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
                            bgcolor: '#c0e1f4',
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
                                <IconButton size="small">
                                    <FilterIcon sx={{ color: '#b1b8bb' }}/>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Stack direction="row" spacing={1} sx={{ mb: -1, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ 
                        display: 'flex', flexWrap: 'wrap',
                         gap: 1, flexGrow: 1 }}>
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                variant="filled"
                                size="small"
                                sx={{
                                    px: 1,
                                    fontWeight: 500,
                                    color: '#fff',
                                    borderRadius: '16px',
                                    bgcolor: '#0087d6',
                                    '&:hover': {
                                        backgroundColor: '#007ac2',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                    <Tooltip title="Add Note" arrow>
                        <IconButton
                        size="small"
                        onClick={onNotepadToggle}
                        sx={{
                            backgroundColor: '#ffd24e',
                            color: '#515151',
                            width: 24,
                            height: 24,
                            p: 1,
                            borderRadius: '50%',
                            boxShadow: 1,
                            '&:hover': {
                            backgroundColor: '#ffd24e',
                            },
                        }}
                        >
                        <EditNoteIcon
                        sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>

            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
                {notes.map((note, index) => (
                    <ListItem
                        ref={(el) => messageRefs.current[index] = el}
                        key={index}
                        sx={{
                            bgcolor: '#f8eecf',
                            borderRadius: 3,
                            mb: 1,
                            px: 2,
                            pt: 1,
                            pb: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            position: 'relative',
                        }}
                    >
                        {/* Top Icons */}
                        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                            <IconButton size="small"
                            onClick={() => {handlePinToggle(index)}} >
                                <PushPinIcon 
                                sx={{ fontSize: '1rem', stroke: '#000',
                                    fill: note.pinned ? '#000' : 'none',
                                    strokeWidth: 1.5,}} />
                            </IconButton>
                        </Box>
                        <Box sx={{ position: 'absolute', top: 8, right: 16 }}>
                            <Stack direction="row" spacing={1}>
                                <IconButton size="small" 
                                onClick={() => {
                                    setSelectedNote({ ...note, index});
                                    onNotepadToggle();
                                }}
                                sx={{ height: 24, 
                                    width: 24, 
                                    bgcolor: '#0087d6', 
                                    borderRadius: 1, 
                                    '&:hover': {
                                        bgcolor: '#006bb3', 
                                    },  
                                    }}>
                                    <EditIcon sx={{ fontSize: '0.8rem', color: '#fff' }} />
                                </IconButton>
                                <IconButton size="small"
                                    sx={{ height: 24,
                                        width: 24, 
                                        bgcolor: '#0087d6', 
                                        borderRadius: 1, 
                                        '&:hover': {
                                            bgcolor: '#006bb3', 
                                        }, }}>
                                    <Download 
                                    onClick={() => handleDownload(index)}
                                    sx={{ fontSize: '0.8rem', color: '#fff' }} />
                                </IconButton>
                            </Stack>
                        </Box>
                        {/* Note title & content */}
                        <Box sx={{ 
                            display: 'flex', alignItems: 'center', 
                            mb: 0.5, mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ 
                                flexGrow: 1, fontWeight: '600', 
                                fontSize: 'large', mt: 2, cursor: 'pointer' }}>
                                    {note.title}
                            </Typography>
                        </Box>
                        <Box sx={{ml: 2, mr: 2, mb: 1, cursor: 'pointer' }}>
                            <div dangerouslySetInnerHTML={{ __html: note.content }} />
                            
                        </Box>
                        {/* Bottom Bar: Delete Icon */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <IconButton size="small" 
                                onClick={() => handleDelete(index)}
                                sx={{ py: 0.5, px: 0 }}>
                                <Delete sx={{ fontSize: '0.8rem', color: '#f08a8a' }} />
                            </IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        mx: 'auto',
                        display: 'block',
                        color: '#fff',
                        bgcolor: '#0087d6'
                    }}
                >
                    Save and update
                </Button>
            </Box>
            {/* Notepad Popup */}
        </Paper>
    )
}

export default SavedNotes 

