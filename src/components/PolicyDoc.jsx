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


import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import FilePresentIcon from '@mui/icons-material/FilePresent'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw   from 'rehype-raw'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import allDocumentsIcon from '../assets/all.png'
import coontractIcon from '../assets/contract_icon.png'
import delegationIcon from '../assets/delegation_icon.png'
import hrIcon from '../assets/hr_icon.png'

const PolicyDoc = ({ 
    open, onToggle }) => {
    const [isWide, setIsWide] = useState(false);

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
                            Policy Documents
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

                {/* ——— Four icons with labels underneath ——— */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        px: 3,
                        mt: 2,
                        textAlign: 'center',
                    }}
                    >
                    {[
                        {
                        icon: (
                            <img
                            src={allDocumentsIcon}
                            alt="All Documents"
                            style={{ width: 32, height: 32 }}
                            />
                        ),
                        label: 'All Documents'
                    },
                        {
                        icon: (
                            <img
                            src={hrIcon}
                            alt="Human Resources"
                            style={{ width: 32, height: 32 }}
                            />
                        ),
                        label: 'Human Resources'
                        },
                        {
                        icon: (
                            <img
                            src={coontractIcon}
                            alt="Contract & Procurement"
                            style={{ width: 32, height: 32 }}
                            />
                        ),
                        label: 'Contract & Procurement'
                        },
                        {
                        icon: (
                            <img
                            src={delegationIcon}
                            alt="Delegation of Powers"
                            style={{ width: 32, height: 32 }}
                            />
                        ),
                        label: 'Delegation of Powers'
                    },
                ].map(({ icon, label }) => (
                        <Box
                        key={label}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                        >
                            <IconButton
                                sx={{
                                p: 1,
                                '&:hover': { bgcolor: '#FFD95C1A' }
                                }}
                            >
                                {icon}
                            </IconButton>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 0.5, fontWeight: 600 }}
                            >
                                {label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

            </Box>
        </Paper>
    )
}

export default PolicyDoc

