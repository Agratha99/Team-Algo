import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus } from "lucide-react";

interface Club {
  id: string;
  name: string;
  club_members: Array<{
    id: string;
    position: string;
    profiles: {
      full_name: string;
      email: string;
    };
  }>;
}

interface ManageClubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: Club;
  onMembersUpdated: () => void;
}

const positions = [
  { value: 'president', label: 'President' },
  { value: 'vice_president', label: 'Vice President' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'event_manager', label: 'Event Manager' },
  { value: 'pr_team', label: 'PR Team' },
  { value: 'other', label: 'Other' }
];

const ManageClubModal = ({ open, onOpenChange, club, onMembersUpdated }: ManageClubModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddingMember(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const position = formData.get('position') as string;

    // First, find the user by email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (profileError || !profiles) {
      toast({
        title: "Error",
        description: "User not found with this email address",
        variant: "destructive"
      });
      setAddingMember(false);
      return;
    }

    // Add the member to the club
    const { error } = await supabase
      .from('club_members')
      .insert([{
        club_id: club.id,
        user_id: profiles.user_id,
        position: position as 'president' | 'vice_president' | 'secretary' | 'event_manager' | 'pr_team' | 'other'
      }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Member added successfully!"
      });
      onMembersUpdated();
      (e.target as HTMLFormElement).reset();
    }
    setAddingMember(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Member removed successfully!"
      });
      onMembersUpdated();
    }
  };

  const getPositionLabel = (position: string) => {
    const pos = positions.find(p => p.value === position);
    return pos ? pos.label : position;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Club Members - {club.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Member Form */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add New Member
              </h3>
              
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Member Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="member@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select name="position" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button type="submit" disabled={addingMember}>
                  {addingMember ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Members */}
          <div>
            <h3 className="font-semibold mb-4">Current Members ({club.club_members.length})</h3>
            
            {club.club_members.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No members added yet. Add your first member above.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {club.club_members.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{member.profiles.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                          </div>
                          <Badge variant="secondary">
                            {getPositionLabel(member.position)}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageClubModal;