import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Club {
  id: string;
  name: string;
  description: string;
}

interface ClubEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: Club | null;
}

const ClubEventModal = ({ open, onOpenChange, club }: ClubEventModalProps) => {
  const navigate = useNavigate();
  
  if (!club) return null;

  const handleEventCategoryClick = (categoryId: string) => {
    navigate(`/club/${club.id}/events/${categoryId}`);
  };

  const handleClubMembersClick = () => {
    navigate(`/club/${club.id}/members`);
  };

  const eventCategories = [
    {
      id: 'ongoing',
      title: 'Ongoing Events',
      description: 'Currently happening events',
      color: 'bg-green-500',
      events: []
    },
    {
      id: 'upcoming',
      title: 'Upcoming Events',
      description: 'Future events to look forward to',
      color: 'bg-blue-500',
      events: []
    },
    {
      id: 'completed',
      title: 'Completed Events',
      description: 'Past events organized by this club',
      color: 'bg-gray-500',
      events: []
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{club.name}</DialogTitle>
              <p className="text-muted-foreground">{club.description}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClubMembersClick}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Club Members
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 mt-6">
          {eventCategories.map((category) => (
            <div 
              key={category.id} 
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              onClick={() => handleEventCategoryClick(category.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClubEventModal;