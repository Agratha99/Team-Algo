import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import ClubEventModal from "@/components/ClubEventModal";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number;
  registration_deadline: string;
  clubs: { name: string } | null;
}

interface Club {
  id: string;
  name: string;
  description: string;
}

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchClubs();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs (name)
      `)
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, description')
      .order('name', { ascending: true });

    if (!error && data) {
      setClubs(data);
    }
  };

  const handleClubClick = (club: Club) => {
    setSelectedClub(club);
    setModalOpen(true);
  };

  const getClubColor = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
    ];
    return colors[index % colors.length];
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
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.full_name}</h1>
          <p className="text-muted-foreground">
            Student Dashboard - Discover and register for exciting events
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary">
              {profile?.department}
            </Badge>
            {profile?.year_of_study && (
              <Badge variant="outline">
                Year {profile.year_of_study}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Clubs</h2>
            {clubs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No clubs available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new clubs.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {clubs.map((club, index) => (
                  <Card 
                    key={club.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
                    onClick={() => handleClubClick(club)}
                  >
                    <div className={`h-24 ${getClubColor(index)} flex items-center justify-center`}>
                      <h3 className="text-white text-lg font-bold text-center px-4">
                        {club.name}
                      </h3>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {club.description || "Click to learn more about this club"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground">
                    Check back later for new events from your college clubs and faculty.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {event.clubs && (
                          <Badge variant="outline" className="ml-2">
                            {event.clubs.name}
                          </Badge>
                        )}
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
                            <span>Max participants: {event.max_participants}</span>
                          </div>
                        )}
                        
                        {event.registration_deadline && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              Register by: {formatDate(event.registration_deadline)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button className="w-full">
                        Register for Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>

        <ClubEventModal 
          open={modalOpen}
          onOpenChange={setModalOpen}
          club={selectedClub}
        />
      </div>
    </div>
  );
};

export default StudentDashboard;