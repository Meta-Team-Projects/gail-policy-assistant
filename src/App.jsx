import { useState} from 'react'
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  VerticalSplit,
  Menu as MenuIcon,
} from '@mui/icons-material'
import Sidebar from './components/Sidebar'
import { getNextSessionName } from './components/utils';
import MainContent from './components/MainContent'
import DocumentIngestion from './components/DocumentIngestion'
import AIConfiguration from './components/AIConfiguration'
import FAQs from './components/FAQs'
import SavedNotes from './components/SavedNotes'
import SavedQueries from './components/SavedQueries'
import SessionLog from './components/SessionLog'
import { MenuType } from './constants/menuTypes'
import Text from './components/Text'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#F1F8FF',
      paper: 'rgba(164, 191, 255, 0.08)',
      sidebar: '#CEE6FF'
    },
    primary: {
      main: '#FFD95C',
    },
    text: {
      primary: '#515151',
      secondary: '#FFD95C',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#515151',
            },
          },
        },
      },
    },
  },
})

function App() {
  const initial = { id: '1', name: 'Session 1' }
  const [sessions, setSessions]       = useState([ initial ])
  const [activeSessionID, setActiveSessionID] = useState(initial.id)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [showNotepad, setShowNotepad] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)

  const [sessionDrafts, setSessionDrafts] = useState({
      [ initial.id ]: ''
  })
  const [sessionDraftQueries, setSessionDraftQueries] = useState({ [ initial.id ]: '' })
  const [sessionMessages, setSessionMessages] = useState({
    [initial.id]: []
  })
    
  const [layoutMode, setLayoutMode] = useState('expand')
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [activeRightMenu, setActiveRightMenu] = useState(MenuType.FORMULATE)

  const [savedNotes, setSavedNotes] = useState([])

  const handleSaveNote = (newNote) => {
    setSavedNotes((prev) => {
      if (selectedNote?.index !== undefined){
        const updated = [...prev];
        updated[selectedNote.index] = newNote;
        return updated;
      }
      else {
        return [...prev, newNote];
      }
    });
  };

  const messages = sessionMessages[activeSessionID] || []
  const setMessages = (newMessages) => {
    setSessionMessages(prev => ({
      ...prev,
      [activeSessionID]: typeof newMessages === 'function'
        ? newMessages(prev[activeSessionID] || [])
        : newMessages
    }))
  }

  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'))

    // Sessions functionalities
  const handleRenameSession = (id, newName) => {
    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, name: newName } : s)
    )
  }

  const handleDeleteSession = (id) => {
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== id)

      // remove stored data for the deleted session
      setSessionMessages(msgs => {
        const copy = { ...msgs }
        delete copy[id]
        return copy
      })
      setSessionDrafts(drafts => {
        const copy = { ...drafts }
        delete copy[id]
        return copy
      })

      if (remaining.length > 0) {
        // just pick the first remaining session
        setActiveSessionID(remaining[0].id)
        return remaining
      } else {
        const newName = getNextSessionName([])
        const newId   = Date.now().toString()
        setSessionMessages(msgs => ({ ...msgs, [newId]: [] }))
        setSessionDrafts(drafts => ({ ...drafts,   [newId]: '' }))
        setActiveSessionID(newId)
        return [{ id: newId, name: newName }]
      }
    })
  }


  const handleResetSession = (id) => {
    setSessionMessages(prev => ({
      ...prev,
      [id]: []
    }))
    setSessionDrafts(prev => ({
      ...prev,
      [id]: ''
    }))
  }    


  const handleLeftDrawerToggle = () => {
    setLeftSidebarOpen(!leftSidebarOpen)
  }

  const handleRightDrawerToggle = () => {
    if (rightSidebarOpen) {
      setActiveRightMenu(MenuType.NONE)
    }
    setRightSidebarOpen(prev => !prev)
  }

  const handleMenuClick = (menuType) => {
      if (menuType === 'NEW_SESSION') {
      const name = getNextSessionName(sessions);
      const newId = Date.now().toString();
      const newSession = { id: newId, name };
      // add to sessions
      setSessions(s => [...s, newSession]);
      // initialize its messages + draft
      setSessionMessages(prev => ({ ...prev, [newId]: [] }));
      setSessionDrafts(prev => ({ ...prev, [newId]: '' }));
      // make it active
      setActiveSessionID(newId);
      return;
    }

    //keep this future may come up as a future FUNCTIONALITY
    if (menuType !== MenuType.FORMULATE && layoutMode === 'collapse') {
      //setLayoutMode('expand');
    }

    if (activeRightMenu === menuType && rightSidebarOpen) {
      // If clicking the same menu that's already open, close it
      setRightSidebarOpen(false)
      setActiveRightMenu(MenuType.NONE)
    } else {
      // Open the new menu
      setRightSidebarOpen(true)
      setActiveRightMenu(menuType)
    }
  }

  const renderRightMenu = () => {
    switch (activeRightMenu) {
      case MenuType.DOCUMENT_INGESTION:
        return <DocumentIngestion open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.AI_CONFIGURATION:
        return <AIConfiguration open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.FAQS:
        return <FAQs open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.SAVED_QUERIES:
        return <SavedQueries open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.SAVED_NOTES:
        return (
          <SavedNotes
          open={rightSidebarOpen}
          onToggle={handleRightDrawerToggle}
          showNotepad={showNotepad}
          onNotepadToggle={() => setShowNotepad((v) => !v)}
          savedNotes={savedNotes}
          setSelectedNote={setSelectedNote}
        />
        )
      case MenuType.SESSION_LOG:
        return <SessionLog open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.FORMULATE:
        return 
      default:
        return null
    }
  }

  const handleDraftGenerated = (draftText, draftQuery) => {
    // save into this session’s draft
    setSessionDrafts(prev => ({
      ...prev,
      [activeSessionID]: draftText || ''
    }))
    setSessionDraftQueries(prev => ({
    ...prev,
    [activeSessionID]: draftQuery || ''
  }))
    // open Formulate
    setActiveRightMenu(MenuType.FORMULATE)
    setRightSidebarOpen(true)
  }


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/*Notepad* */}
      {showNotepad && (<Text
      initialTitle={selectedNote?.title || 'Note'}
      initialContent={selectedNote?.content || 'Type content here'}
      defaultEditing = {false}
      onSave={handleSaveNote}
      onClose={() => {
        setShowNotepad(false);
        setSelectedNote(null);}} />)}

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          open={leftSidebarOpen}
          handleDrawerToggle={handleLeftDrawerToggle}
          onMenuClick={handleMenuClick}
          onNotepadToggle={() => setShowNotepad(v => !v)}
          activeMenu={activeRightMenu}
          showNotepad={showNotepad}
          sessions={sessions}
          activeSessionID={activeSessionID}
          onSessionSelect={setActiveSessionID}
          onRename={handleRenameSession}
          onDelete={handleDeleteSession}
          onReset={handleResetSession}
          layoutMode={layoutMode}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            bgcolor: 'background.default',
            position: 'relative',
          }}
        >
          {/* Left sidebar toggle button - shown only when sidebar is closed
          {!leftSidebarOpen && (
            <IconButton
              color="inherit"
              aria-label="open left drawer"
              onClick={handleLeftDrawerToggle}
              sx={{
                position: 'fixed',
                left: 0,
                top: 8,
                zIndex: 1200,
                bgcolor: 'background.paper',
                borderRadius: '0 4px 4px 0',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )} */}

          {/* Right sidebar toggle button - shown only when sidebar is closed */}
          {!rightSidebarOpen && activeRightMenu !== MenuType.NONE && (
            <IconButton
              color="inherit"
              aria-label="open right drawer"
              onClick={handleRightDrawerToggle}
              sx={{
                position: 'fixed',
                right: 0,
                top: 8,
                zIndex: 1200,
                bgcolor: 'background.paper',
                borderRadius: '4px 0 0 4px',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <VerticalSplit />
            </IconButton>
          )}

          <MainContent
            sessions={sessions}
            key={activeSessionID}
            rightSidebarOpen={rightSidebarOpen}
            leftSidebarOpen={leftSidebarOpen}
            activeRightMenu={activeRightMenu} 
            activeSessionID={activeSessionID}
            onDraftGenerated={handleDraftGenerated}
            onMenuClick={handleMenuClick}
            messages={messages}
            setMessages={setMessages}
            layoutMode={layoutMode}                
            setLayoutMode={setLayoutMode} 
            showNotepad={showNotepad}
            onNotepadToggle={() => setShowNotepad(v => !v)}    
            dimMainContent={rightSidebarOpen && activeRightMenu !== MenuType.FORMULATE }
          />

          {renderRightMenu()}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
