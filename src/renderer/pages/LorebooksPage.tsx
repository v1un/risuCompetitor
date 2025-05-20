import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useKeyboardShortcut } from '../contexts/KeyboardShortcutContext';

interface Lorebook {
  id: string;
  name: string;
  description: string;
  entries: LorebookEntry[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface LorebookEntry {
  id: string;
  name: string;
  content: string;
  keywords: string[];
  priority: number;
  enabled: boolean;
}

const LorebooksPage: React.FC = () => {
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLorebook, setCurrentLorebook] = useState<Lorebook | null>(null);
  
  // Register keyboard shortcuts
  useKeyboardShortcut('lorebooks-new', 'n', () => handleNewLorebook(), {
    ctrlKey: true,
    description: 'Create new lorebook',
    category: 'lorebook',
    preventDefault: true
  });
  
  useKeyboardShortcut('lorebooks-search', 'f', () => {
    document.getElementById('lorebook-search')?.focus();
  }, {
    ctrlKey: true,
    description: 'Search lorebooks',
    category: 'lorebook',
    preventDefault: true
  });
  
  // Load lorebooks
  useEffect(() => {
    const loadLorebooks = async () => {
      try {
        // In a real implementation, this would fetch from the backend
        // For now, we'll use mock data
        const mockLorebooks: Lorebook[] = [
          {
            id: '1',
            name: 'Fantasy World',
            description: 'A high fantasy world with magic and mythical creatures',
            entries: [
              {
                id: '101',
                name: 'Kingdom of Eldoria',
                content: 'A prosperous kingdom ruled by the wise King Alaric. Known for its vast libraries and magical academies.',
                keywords: ['Eldoria', 'kingdom', 'Alaric'],
                priority: 5,
                enabled: true
              },
              {
                id: '102',
                name: 'The Enchanted Forest',
                content: 'A mysterious forest filled with magical creatures and ancient spirits. Few travelers return from its depths.',
                keywords: ['forest', 'enchanted', 'magical'],
                priority: 4,
                enabled: true
              }
            ],
            tags: ['fantasy', 'magic', 'worldbuilding'],
            createdAt: '2023-01-15T12:00:00Z',
            updatedAt: '2023-03-20T15:30:00Z'
          },
          {
            id: '2',
            name: 'Sci-Fi Universe',
            description: 'A futuristic universe with advanced technology and interstellar travel',
            entries: [
              {
                id: '201',
                name: 'The Galactic Federation',
                content: 'An alliance of planets that governs most of the known galaxy. Headquartered on Earth in the Sol system.',
                keywords: ['federation', 'galactic', 'alliance'],
                priority: 5,
                enabled: true
              }
            ],
            tags: ['sci-fi', 'space', 'future'],
            createdAt: '2023-02-10T09:15:00Z',
            updatedAt: '2023-04-05T11:45:00Z'
          }
        ];
        
        setLorebooks(mockLorebooks);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load lorebooks:', error);
        setLoading(false);
      }
    };
    
    loadLorebooks();
  }, []);
  
  // Filter lorebooks based on search query
  const filteredLorebooks = lorebooks.filter(lorebook => 
    lorebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lorebook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lorebook.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle creating a new lorebook
  const handleNewLorebook = () => {
    setCurrentLorebook(null);
    setOpenDialog(true);
  };
  
  // Handle editing a lorebook
  const handleEditLorebook = (lorebook: Lorebook) => {
    setCurrentLorebook(lorebook);
    setOpenDialog(true);
  };
  
  // Handle deleting a lorebook
  const handleDeleteLorebook = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lorebook?')) {
      try {
        // In a real implementation, this would call the backend
        setLorebooks(prevLorebooks => prevLorebooks.filter(lorebook => lorebook.id !== id));
      } catch (error) {
        console.error('Failed to delete lorebook:', error);
      }
    }
  };
  
  // Handle saving a lorebook
  const handleSaveLorebook = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // In a real implementation, this would save to the backend
    // For now, we'll just update the local state
    
    if (currentLorebook) {
      // Update existing lorebook
      setLorebooks(prevLorebooks => 
        prevLorebooks.map(lorebook => 
          lorebook.id === currentLorebook.id ? currentLorebook : lorebook
        )
      );
    } else {
      // Create new lorebook
      const newLorebook: Lorebook = {
        id: Date.now().toString(),
        name: (document.getElementById('lorebook-name') as HTMLInputElement).value,
        description: (document.getElementById('lorebook-description') as HTMLInputElement).value,
        entries: [],
        tags: (document.getElementById('lorebook-tags') as HTMLInputElement).value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLorebooks(prevLorebooks => [...prevLorebooks, newLorebook]);
    }
    
    setOpenDialog(false);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Lorebooks
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewLorebook}
        >
          New Lorebook
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          id="lorebook-search"
          fullWidth
          placeholder="Search lorebooks..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredLorebooks.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No lorebooks found
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={handleNewLorebook}
          >
            Create your first lorebook
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredLorebooks.map(lorebook => (
            <Grid item xs={12} sm={6} md={4} key={lorebook.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {lorebook.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {lorebook.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {lorebook.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    {lorebook.entries.length} entries
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Last updated: {new Date(lorebook.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => console.log('View lorebook', lorebook.id)}>
                    View
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditLorebook(lorebook)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteLorebook(lorebook.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Lorebook Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSaveLorebook}>
          <DialogTitle>
            {currentLorebook ? 'Edit Lorebook' : 'Create New Lorebook'}
          </DialogTitle>
          <DialogContent>
            <TextField
              id="lorebook-name"
              label="Name"
              fullWidth
              margin="normal"
              required
              defaultValue={currentLorebook?.name || ''}
            />
            <TextField
              id="lorebook-description"
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              defaultValue={currentLorebook?.description || ''}
            />
            <TextField
              id="lorebook-tags"
              label="Tags (comma separated)"
              fullWidth
              margin="normal"
              defaultValue={currentLorebook?.tags.join(', ') || ''}
              helperText="Example: fantasy, magic, medieval"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LorebooksPage;