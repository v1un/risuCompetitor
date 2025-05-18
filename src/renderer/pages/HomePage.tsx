import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Series, ChatSession } from '@shared/types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    seriesId: '',
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch series
        const seriesResult = await window.api.series.getAll();
        if (!seriesResult.success) {
          throw new Error(seriesResult.error || 'Failed to fetch series');
        }
        
        // TODO: Fetch recent sessions
        // This would require an API endpoint to get recent sessions
        
        setSeries(seriesResult.series);
        setRecentSessions([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleNewSession = () => {
    setNewSessionDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setNewSessionDialogOpen(false);
  };
  
  const handleCreateSession = async () => {
    // This is a placeholder - in a real implementation, you would:
    // 1. Create a protagonist character if needed
    // 2. Create or select a lorebook
    // 3. Generate support tools
    // 4. Create the chat session
    // 5. Navigate to the chat page
    
    navigate('/chat');
    setNewSessionDialogOpen(false);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Welcome to the Immersive RPG Storytelling Platform
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewSession}
        >
          New Session
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      
      <Typography variant="h5" component="h2" gutterBottom>
        Recent Sessions
      </Typography>
      
      {recentSessions.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          You don't have any recent sessions. Create a new session to get started.
        </Alert>
      ) : (
        <Grid container spacing={3} mb={4}>
          {recentSessions.map((session) => (
            <Grid item xs={12} sm={6} md={4} key={session.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {session.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Series: {session.series}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last modified: {new Date(session.modified_at).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/chat/${session.id}`)}>
                    Continue
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" component="h2" gutterBottom>
        Available Series
      </Typography>
      
      {series.length === 0 ? (
        <Alert severity="info">
          No series available. You can create a new series in the settings.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {series.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {s.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.description || 'No description available'}
                  </Typography>
                  {s.tags && (
                    <Box mt={1}>
                      {s.tags.map((tag) => (
                        <Typography
                          key={tag}
                          variant="caption"
                          component="span"
                          sx={{
                            mr: 1,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                          }}
                        >
                          {tag}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      setNewSessionData({
                        ...newSessionData,
                        seriesId: s.id,
                      });
                      setNewSessionDialogOpen(true);
                    }}
                  >
                    Start Session
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* New Session Dialog */}
      <Dialog open={newSessionDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Title"
            fullWidth
            variant="outlined"
            value={newSessionData.title}
            onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Series</InputLabel>
            <Select
              value={newSessionData.seriesId}
              label="Series"
              onChange={(e) => setNewSessionData({ ...newSessionData, seriesId: e.target.value })}
            >
              {series.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={!newSessionData.title || !newSessionData.seriesId}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;