import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Plus, Calendar, MapPin, Users, Edit, Trash2, UserPlus } from "lucide-react";
import CreateEventModal from "@/components/CreateEventModal";
import CreateClubModal from "@/components/CreateClubModal";
import ManageClubModal from "@/components/ManageClubModal";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number;
  registration_deadline: string;
  is_active: boolean;
  clubs: { name: string } | null;
}

interface Club {
  id: string;
  name: string;
  description: string;
  department: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  club_members: Array<{
    id: string;
    position: string;
    profiles: {
      full_name: string;
      email: string;
    };
  }>;
}

const ClubMemberDashboard = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showManageClubModal, setShowManageClubModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile?.user_id) return;
    
    // Fetch clubs
    const { data: clubsData } = await supabase
      .from('clubs')
      .select(`
        *,
        club_members (
          id,
          position,
          profiles (
            full_name,
            email
          )
        )
      `)
      .eq('created_by', profile.user_id);

    if (clubsData) {
      setClubs(clubsData as any);
    }

    // Fetch events
    const { data: eventsData } = await supabase
      .from('events')
      .select(`
        *,
        clubs (name)
      `)
      .eq('created_by', profile.user_id)
      .order('created_at', { ascending: false });

    if (eventsData) {
      setEvents(eventsData);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .update({ is_active: false })
      .eq('id', eventId);

    if (!error) {
      fetchData();
    }
  };

  const handleManageClub = (club: Club) => {
    setSelectedClub(club);
    setShowManageClubModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Club Member Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {profile?.full_name} - Manage your clubs and events
              </p>
              <Badge variant="secondary" className="mt-2">
                {profile?.department}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateClubModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Club
              </Button>
              <Button onClick={() => setShowCreateEventModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="clubs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clubs">My Clubs</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="clubs">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Clubs</h2>
              {clubs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No clubs created yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first club to start organizing events and managing members.
                    </p>
                    <Button onClick={() => setShowCreateClubModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Club
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {clubs.map((club) => (
                    <Card key={club.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{club.name}</CardTitle>
                        <Badge variant="outline">{club.department}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {club.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Members: </strong>
                            {club.club_members.length} total
                          </div>
                          <div>
                            <strong>Contact: </strong>
                            {club.contact_email}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleManageClub(club)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Manage Members
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Club
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Events</h2>
              {events.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No events created yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating events for your club members and other students.
                    </p>
                    <Button onClick={() => setShowCreateEventModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge variant={event.is_active ? "default" : "secondary"}>
                            {event.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {event.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {event.max_participants && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span>Max: {event.max_participants}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventModal
        open={showCreateEventModal}
        onOpenChange={setShowCreateEventModal}
        onEventCreated={fetchData}
        clubs={clubs}
      />

      <CreateClubModal
        open={showCreateClubModal}
        onOpenChange={setShowCreateClubModal}
        onClubCreated={fetchData}
      />

      {selectedClub && (
        <ManageClubModal
          open={showManageClubModal}
          onOpenChange={setShowManageClubModal}
          club={selectedClub}
          onMembersUpdated={fetchData}
        />
      )}
    </div>
  );
};

export default ClubMemberDashboard;