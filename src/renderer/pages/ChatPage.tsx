import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  CircularProgress,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import NarratorChat from '../components/chat/NarratorChat';
import ToolsPanel from '../components/tools/ToolsPanel';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [protagonist, setProtagonist] = useState<any | null>(null);
  const [lorebook, setLorebook] = useState<any | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  
  // Load session data
  useEffect(() => {
    const loadSessionData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        // In a real implementation, this would fetch from the database
        // For now, we'll use mock data
        
        // Mock session data
        const mockSession = {
          id: id,
          title: 'Adventure in the Forgotten Realm',
          series: 'Forgotten Realms',
          protagonist_id: 'char-123',
          lorebook_id: 'lore-456',
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          is_favorite: false,
          folder: null,
          settings: {
            model: 'gemini-pro',
            temperature: 0.8,
            max_tokens: 2048,
            narrator_prompt: 'You are a skilled Dungeon Master narrating an adventure.',
            system_prompt: 'Create an immersive fantasy RPG experience.',
            theme_id: null
          }
        };
        
        // Mock protagonist data
        const mockProtagonist = {
          metadata: {
            id: 'char-123',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            series: 'Forgotten Realms'
          },
          character: {
            name: 'Elyndra Moonshadow',
            role: 'protagonist',
            avatar: '',
            description: 'An elven ranger with a mysterious past.',
            background: 'Raised in the forests of Neverwinter, Elyndra learned the ways of the ranger from her father.',
            personality: {
              traits: ['Cautious', 'Observant', 'Loyal'],
              quirks: ['Speaks to animals as if they understand her', 'Collects unusual stones'],
              motivations: ['Discover the truth about her missing family', 'Protect the natural world']
            },
            appearance: 'Tall and slender with silver hair and violet eyes. Wears leather armor adorned with leaf motifs.',
            speech_patterns: 'Formal and precise, occasionally using elvish phrases.',
            relationships: []
          },
          rpg_attributes: {
            stats: {
              strength: 12,
              dexterity: 18,
              constitution: 14,
              intelligence: 13,
              wisdom: 16,
              charisma: 14,
              hp: 45,
              max_hp: 45,
              ac: 15,
              dexterity_mod: 4
            },
            skills: [
              { name: 'Archery', description: 'Expert with bow and arrow', level: 5 },
              { name: 'Tracking', description: 'Can follow trails days old', level: 4 },
              { name: 'Survival', description: 'Adept at surviving in the wilderness', level: 3 }
            ],
            abilities: [
              { name: 'Hunter\'s Mark', description: 'Mark a target for increased damage', effects: '+1d6 damage', limitations: 'Requires concentration' }
            ],
            inventory: [
              { name: 'Longbow', description: 'Finely crafted elven bow', effects: '1d8 piercing damage' },
              { name: 'Dagger', description: 'Silver dagger with moon motif', effects: '1d4 piercing damage' }
            ]
          },
          narrator_guidance: {
            character_voice: 'Speaks formally with occasional elvish phrases. Values nature and balance.',
            narrative_role: 'Protagonist seeking answers about her past while protecting the natural world.',
            development_arc: 'Discovering her family\'s connection to an ancient elven prophecy.',
            interaction_notes: 'Responds well to nature themes and respects those who show reverence for the natural world.'
          }
        };
        
        // Mock lorebook data
        const mockLorebook = {
          metadata: {
            id: 'lore-456',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            series: 'Forgotten Realms',
            title: 'The Forgotten Realms'
          },
          world: {
            overview: 'A high fantasy world with diverse civilizations, ancient magic, and legendary heroes.',
            history: 'Thousands of years of rich history, from the dawn of the elves to the rise and fall of human empires.',
            geography: {
              regions: [
                {
                  name: 'Sword Coast',
                  description: 'A rugged coastline dotted with city-states and ancient ruins.',
                  notable_locations: [
                    { name: 'Neverwinter', description: 'City of Skilled Hands', significance: 'Major trade hub' }
                  ],
                  climate: 'Temperate with mild winters and warm summers.',
                  culture: 'Diverse mix of humans, elves, dwarves, and other races.'
                }
              ],
              maps: []
            },
            factions: [
              {
                name: 'Emerald Enclave',
                description: 'Druids and rangers who protect the natural world.',
                goals: 'Maintain the balance of nature and fight against unnatural threats.',
                notable_members: ['Eravien Haund', 'Delaan Winterhound'],
                relationships: [
                  { faction: 'Lords\' Alliance', status: 'neutral', details: 'Occasional cooperation on mutual threats.' }
                ]
              }
            ]
          },
          narrator_guidance: {
            starting_point: 'The party has arrived in Neverwinter after hearing rumors of strange occurrences in the nearby forest.',
            key_npcs: ['Eravien Haund', 'Lord Neverember', 'The Blackstaff'],
            narrative_hooks: [
              { description: 'Reports of unnatural creatures emerging from the forest at night.', potential_developments: ['Investigation reveals a portal to the Feywild', 'A druid circle has lost control of their summoning ritual'] }
            ],
            secrets: [
              { description: 'An ancient elven artifact is hidden in the forest, causing the disturbances.', revelation_timing: 'After the party investigates the forest', impact: 'Reveals connection to protagonist\'s family' }
            ],
            challenge_balance: 'Moderate combat difficulty with emphasis on exploration and social interaction.',
            world_consistency: 'Maintain the established lore of the Forgotten Realms while allowing for creative additions.'
          }
        };
        
        // Mock tools data
        const mockTools = [
          {
            metadata: {
              id: 'tool-789',
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              series: 'Forgotten Realms',
              title: 'Combat Tracker'
            },
            tool: {
              name: 'Combat Tracker',
              description: 'Track initiative, health, and status effects in combat.',
              type: 'tracker',
              visibility: 'both',
              update_triggers: ['combat start', 'damage taken', 'healing received'],
              ui_position: 'sidebar'
            },
            components: [
              {
                id: 'init-tracker',
                type: 'list',
                name: 'Initiative Order',
                description: 'Current combat initiative order',
                default_value: '[]',
                current_value: '[]'
              },
              {
                id: 'current-round',
                type: 'numeric',
                name: 'Current Round',
                description: 'The current combat round',
                default_value: '1',
                current_value: '1'
              }
            ]
          }
        ];
        
        // Set state
        setSession(mockSession);
        setProtagonist(mockProtagonist);
        setLorebook(mockLorebook);
        setTools(mockTools);
        
      } catch (err) {
        setError('Failed to load session data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSessionData();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  // If no ID is provided, show session creation UI
  if (!id) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          New Chat Session
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            To start a new chat session, please select a character and lorebook.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/characters')}
            sx={{ mr: 2 }}
          >
            Select Character
          </Button>
          <Button 
            variant="outlined"
            onClick={() => navigate('/lorebooks')}
          >
            Browse Lorebooks
          </Button>
        </Paper>
      </Box>
    );
  }
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (error || !session || !protagonist || !lorebook) {
    return (
      <Box>
        <Typography variant="h4" component="h1" color="error" gutterBottom>
          Error Loading Session
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            {error || 'Failed to load session data. Please try again.'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/chats')}
            sx={{ mt: 2 }}
          >
            Return to Chat List
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {session.title}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Chat" />
            <Tab label="Tools" />
            <Tab label="Character" />
            <Tab label="World" />
          </Tabs>
        </Grid>
        
        {/* Chat Tab */}
        {tabIndex === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 200px)' }}>
              <NarratorChat 
                sessionId={session.id}
                protagonist={protagonist}
                lorebook={lorebook}
                tools={tools}
              />
            </Paper>
          </Grid>
        )}
        
        {/* Tools Tab */}
        {tabIndex === 1 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, minHeight: '500px' }}>
              <ToolsPanel 
                sessionId={session.id}
                characters={[protagonist]}
              />
            </Paper>
          </Grid>
        )}
        
        {/* Character Tab */}
        {tabIndex === 2 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h5">{protagonist.character.name}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {protagonist.character.role.charAt(0).toUpperCase() + protagonist.character.role.slice(1)}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" fontWeight="medium">Appearance</Typography>
                    <Typography variant="body2">{protagonist.character.appearance}</Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" fontWeight="medium">Personality</Typography>
                    <Typography variant="body2" gutterBottom>Traits: {protagonist.character.personality.traits.join(', ')}</Typography>
                    <Typography variant="body2" gutterBottom>Quirks: {protagonist.character.personality.quirks.join(', ')}</Typography>
                    <Typography variant="body2">Motivations: {protagonist.character.personality.motivations.join(', ')}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h6">Background</Typography>
                  <Typography variant="body2" paragraph>{protagonist.character.background}</Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6">Attributes</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {Object.entries(protagonist.rpg_attributes.stats).map(([key, value]) => (
                      <Grid item xs={4} sm={2} key={key}>
                        <Paper sx={{ p: 1, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {key.toUpperCase()}
                          </Typography>
                          <Typography variant="h6">{value}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Skills</Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {protagonist.rpg_attributes.skills.map((skill: any) => (
                        <Grid item xs={12} sm={6} md={4} key={skill.name}>
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body1">{skill.name} (Lv. {skill.level})</Typography>
                            <Typography variant="body2" color="text.secondary">{skill.description}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Abilities</Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {protagonist.rpg_attributes.abilities.map((ability: any) => (
                        <Grid item xs={12} sm={6} key={ability.name}>
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body1">{ability.name}</Typography>
                            <Typography variant="body2">{ability.description}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Effects: {ability.effects}
                              {ability.limitations && `, Limitations: ${ability.limitations}`}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {/* World Tab */}
        {tabIndex === 3 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">{lorebook.metadata.title}</Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">World Overview</Typography>
                <Typography variant="body2" paragraph>{lorebook.world.overview}</Typography>
                
                <Typography variant="h6">History</Typography>
                <Typography variant="body2" paragraph>{lorebook.world.history}</Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6">Regions</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {lorebook.world.geography.regions.map((region: any) => (
                  <Grid item xs={12} md={6} key={region.name}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{region.name}</Typography>
                      <Typography variant="body2" paragraph>{region.description}</Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Climate: {region.climate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Culture: {region.culture}
                      </Typography>
                      
                      {region.notable_locations.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="medium">Notable Locations:</Typography>
                          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                            {region.notable_locations.map((location: any) => (
                              <li key={location.name}>
                                <Typography variant="body2">
                                  <strong>{location.name}</strong> - {location.description}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Factions</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {lorebook.world.factions.map((faction: any) => (
                    <Grid item xs={12} md={6} key={faction.name}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">{faction.name}</Typography>
                        <Typography variant="body2" paragraph>{faction.description}</Typography>
                        
                        <Typography variant="body2" fontWeight="medium">Goals:</Typography>
                        <Typography variant="body2" paragraph>{faction.goals}</Typography>
                        
                        {faction.notable_members.length > 0 && (
                          <Typography variant="body2">
                            <strong>Notable Members:</strong> {faction.notable_members.join(', ')}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ChatPage;