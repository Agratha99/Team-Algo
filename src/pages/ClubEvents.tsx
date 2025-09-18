import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";

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

const ClubEvents = () => {
  const { clubId, eventType } = useParams<{ clubId: string; eventType: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const eventTypeConfig = {
    ongoing: {
      title: "Ongoing Events",
      description: "Currently happening events",
      color: "bg-green-500",
      filter: (event: Event) => {
        const now = new Date();
        const eventDate = new Date(event.event_date);
        const eventEndDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000); // Assume 1 day duration
        return eventDate <= now && now <= eventEndDate;
      }
    },
    upcoming: {
      title: "Upcoming Events",
      description: "Future events to look forward to",
      color: "bg-blue-500",
      filter: (event: Event) => new Date(event.event_date) > new Date()
    },
    completed: {
      title: "Completed Events",
      description: "Past events organized by this club",
      color: "bg-gray-500",
      filter: (event: Event) => {
        const eventDate = new Date(event.event_date);
        const eventEndDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);
        return eventEndDate < new Date();
      }
    }
  };

  const currentConfig = eventTypeConfig[eventType as keyof typeof eventTypeConfig];

  useEffect(() => {
    if (clubId && eventType && currentConfig) {
      fetchClubAndEvents();
    }
  }, [clubId, eventType]);

  const fetchClubAndEvents = async () => {
    if (!clubId) return;

    try {
      // Fetch club details
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id, name, description')
        .eq('id', clubId)
        .single();

      if (clubError) throw clubError;
      setClub(clubData);

      // Fetch all events for this club
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          clubs (name)
        `)
        .eq('club_id', clubId)
        .eq('is_active', true)
        .order('event_date', { ascending: false });

      if (eventsError) throw eventsError;

      // Filter events based on event type
      const filteredEvents = eventsData?.filter(currentConfig.filter) || [];
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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

  if (!currentConfig) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Invalid Event Type</h1>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-6 h-6 rounded-full ${currentConfig.color}`} />
            <h1 className="text-3xl font-bold">{currentConfig.title}</h1>
          </div>
          <p className="text-muted-foreground mb-2">{currentConfig.description}</p>
          {club && (
            <Badge variant="outline" className="text-sm">
              {club.name}
            </Badge>
          )}
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No {currentConfig.title.toLowerCase()}</h3>
              <p className="text-muted-foreground">
                There are no {currentConfig.title.toLowerCase()} for this club at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
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
                  
                  {eventType === 'upcoming' && (
                    <Button className="w-full">
                      Register for Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubEvents;