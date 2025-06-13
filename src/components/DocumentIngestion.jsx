import React, { useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    InputAdornment,
    Chip,
    Stack,
} from '@mui/material'
import {
    CloudUpload,
    Delete,
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
} from '@mui/icons-material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import FilePresentIcon from '@mui/icons-material/FilePresent'

const DocumentIngestion = ({ open, onToggle }) => {
    
    const [isWide, setIsWide] = useState(false);

    const documents = [
        { name: 'New Document 1', date: '03-04-2024' },
        { name: 'New Document 2', date: '03-04-2024' },
        { name: 'New Document 3', date: '03-04-2024' },
        { name: 'New Document 4', date: '03-04-2024' },
    ]

    const categories = ['HR', 'Finance', 'Group 1', 'Group 2']
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
                bgcolor: 'background.sidebar',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilePresentIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Document Management
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

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#C4C4C4' }}>
                        URL
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder=""
                        size="small"
                        sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: '#c0e1f4',
                                color: '#515151',
                                '& fieldset': {
                                    borderColor: 'transparent', 
                                },
                                '&:hover fieldset': {
                                    borderColor: 'transparent', 
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#515151', 
                                },
                            },
                        }}
                    />
                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#C4C4C4', my: 0.5, mb: -1 }}>
                        OR
                    </Typography>
                </Box>

                <Box
                    sx={{
                        border: 'none',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'center',
                        mb: 1,
                        bgcolor: '#FFD95C1A',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                    }}
                    >
                    <CloudUpload sx={{ fontSize: 40, color: '#FFD95C' }} /> 
                    
                    <Typography variant="caption" display="block" color="#515151">
                        Choose a file or enter a URL in the box above.
                        JPEG, PNG, PDF, and MP4 formats, up to 50MB
                    </Typography>

                    <Button
                        variant="contained"
                        sx={{
                        borderRadius: 2,
                        bgcolor: '#FFD95C',
                        color: '#515151',
                        textTransform: 'none',
                        px: 3,
                        py: 0.5,
                        fontWeight: 500,
                        }}
                    >
                        Browse File
                    </Button>
                </Box>


                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Button
                        variant="filled"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: '#FFD95C',
                            color: '#515151',
                            px: 2.5,         //custom horizontal padding
                            py: 1,           //custom vertical padding
                            mx: 'auto',     
                        }}
                    >
                        Upload from notes
                    </Button>
                </Box>
            </Box>

            <Box
            sx={{
                p: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, 
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search here..."
                    size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFD95C1A',
                            borderRadius: 2,
                            color: '#515151',
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)', // Default border
                                },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)', //no border color change on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#515151', // When focused or selecred border change
                            },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#515151' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small">
                                    <FilterIcon sx={{ color: '#515151' }}/>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 1}}>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            variant="outlined"
                            size="small"
                            sx={{
                                p:1,
                                cursor: 'pointer',
                                borderRadius: '999px', 
                                color: '#081A33',
                                bgcolor: '#FFD95C',
                                '&:hover': { backgroundColor: '#FEC636' },
                            }}
                        />
                    ))}
                    <Chip
                        icon={<AddIcon/>}
                        size="small"
                        variant="outlined"
                        sx={{
                            position: 'relative',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            bgcolor: '#FFD95C1A',
                            border: 'none',
                            // now style the icon slot
                            '& .MuiChip-icon': {
                                position: 'absolute',            
                                top: '50%',                      
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                margin: 0,                       
                                color: '#515151',               
                                fontSize: 16,
                            },
                        }}
                    />
                </Stack>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        px: 3.5,
                    }}
                    >
                    <Typography variant="subtitle2" sx={{ color: '#515151' }}>
                        Document Name
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#515151', mr: 4 }}>
                        Last Modified
                    </Typography>
                </Box>

                <Box
                sx={{
                    px: 1,
                    flexGrow: 1,
                    overflowY: 'auto !important', 
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: '3px',
                },
                }}
                >
                    <List sx={{ px: 0 }}>
                        {documents.map((doc, index) => {
                            const isSelected = index < 2;
                            return (
                            <ListItem
                                key={index}
                                disableGutters
                                sx={{
                                bgcolor: isSelected ? '#FFD95C' : '#FFFFFF',
                                borderRadius: 2,
                                mb: 1,
                                px: 2,
                                py: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: isSelected ? 'inset 0 0 0 2px #FFD95C' : 'inset 0 0 0 1px #FFD95C',
                                }}
                            >
                                {/* Left: Radio + Document Name */}
                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {/* Radio */}
                                <Box sx={{ mr: 1 }}>
                                    <Box
                                    sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        border: '2px solid #515151',
                                        backgroundColor: isSelected ? '#515151' : 'transparent',
                                    }}
                                    />
                                </Box>
                                {/* Document Name */}
                                <Typography
                                    sx={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    color: '#1A1A1A',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    }}
                                >
                                    {doc.name}
                                </Typography>
                                </Box>

                                {/* Center: Last Modified */}
                                <Typography
                                sx={{
                                    fontSize: '0.8rem',
                                    color: '#515151',
                                    mx: 2,
                                    whiteSpace: 'nowrap',
                                }}
                                >
                                {doc.date}
                                </Typography>

                                {/* Right: Delete Icon */}
                                <IconButton size="small">
                                <Delete sx={{ fontSize: 16, color: '#515151' }} />
                                </IconButton>
                            </ListItem>
                            );
                        })}
                    </List>
                </Box>

            </Box>
        </Paper>
    )
}

export default DocumentIngestion