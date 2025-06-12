import React, { useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Chip,
    Divider,
    Stack,
    Collapse,
} from '@mui/material'
import {
    QuestionAnswer,
    ChevronRight,
    Search as SearchIcon,
    KeyboardArrowRight,
} from '@mui/icons-material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

const FAQs = ({ open, onToggle }) => {
    const categories = ['All', 'HR', 'Finance', 'Procurement']
    const initialFaqs = [
        {
            question: "What is GAIL's role in India's energy sector?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            isExpanded: false,
        },
        {
            question: "What initiatives has GAIL undertaken for expanding the natural gas pipeline network?",
            answer: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            isExpanded: false,
        },
        {
            question: "How does GAIL support government initiatives like 'Make in India' and 'Aatmanirbhar Bharat'?",
            answer: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            isExpanded: false,
        },
    ]

    const [faqs, setFaqs] = useState(initialFaqs)
    const [isWide, setIsWide] = useState(false);

    const handleToggle = (index) => {
        setFaqs(prev => prev.map((faq, i) =>
            i === index ? { ...faq, isExpanded: !faq.isExpanded } : faq
        ))
    }

    return (
        <Paper
            sx={{
                width: open ? (isWide ? 900 : 500) : 0,
                marginTop: '2.5vh',
                height: '95vh',
                position: 'fixed',
                right: '1.5vh',
                top: 0,
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
                        <QuestionAnswer />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            FAQs
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
                        },
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

                <Stack direction="row" spacing={0.5} sx={{ mb: -2 }}>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            variant={category === 'All' ? 'filled' : 'outlined'}
                            sx={{
                                px: 0.5,
                                fontSize: '10px',
                                bgcolor: '#0087d6',
                                color: '#fff',
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
                {faqs.map((faq, index) => (
                    <Box key={index} sx={{ mb: 1, borderRadius: 3, overflow: 'hidden' }}>
                        <ListItemButton
                            onClick={() => handleToggle(index)}
                            sx={{
                                bgcolor: '#f8eecf',
                                '&:hover': { bgcolor: '#ffd350' },
                            }}
                        >
                            <ListItemText
                                primary={faq.question}
                                primaryTypographyProps={{
                                    variant: 'body2',
                                    sx: { color: 'text.primary', fontWeight: 600 },
                                }}
                            />
                            <KeyboardArrowRight
                                sx={{
                                    color: '#000',
                                    transform: faq.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                }}
                            />
                        </ListItemButton>
                        <Collapse in={faq.isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {faq.answer}
                                </Typography>
                            </Box>
                        </Collapse>
                    </Box>
                ))}
            </List>
        </Paper>
    )
}

export default FAQs


