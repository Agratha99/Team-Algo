import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Edit, Mail, User } from "lucide-react";

interface ClubMember {
  id: string;
  position: string;
  joined_at: string;
  user_id: string;
  profiles: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    department: string;
    avatar_url?: string;
    bio?: string;
  };
}

interface Club {
  id: string;
  name: string;
  description: string;
}

const ClubMembers = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const positions = [
    { value: 'president', label: 'President' },
    { value: 'vice_president', label: 'Vice President' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'member', label: 'Member' }
  ];

  useEffect(() => {
    if (clubId) {
      fetchClubAndMembers();
    }
  }, [clubId]);

  const fetchClubAndMembers = async () => {
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

      // Fetch club members with proper join
      const { data: membersData, error: membersError } = await supabase
        .from('club_members')
        .select(`
          id,
          position,
          joined_at,
          user_id,
          profiles!inner (
            id,
            user_id,
            full_name,
            email,
            department,
            avatar_url,
            bio
          )
        `)
        .eq('club_id', clubId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionLabel = (position: string) => {
    return positions.find(p => p.value === position)?.label || position;
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'president':
        return 'bg-purple-500';
      case 'vice_president':
        return 'bg-blue-500';
      case 'secretary':
        return 'bg-green-500';
      case 'treasurer':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleEditProfile = (member: ClubMember) => {
    if (profile?.user_id === member.profiles.user_id) {
      setEditingProfile({
        ...member.profiles,
        bio: member.profiles.bio || ''
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProfile) return;

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const bio = formData.get('bio') as string;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio
        })
        .eq('user_id', editingProfile.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setIsEditDialogOpen(false);
      fetchClubAndMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
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
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Club Members</h1>
          </div>
          {club && (
            <div>
              <Badge variant="outline" className="text-sm mb-2">
                {club.name}
              </Badge>
              <p className="text-muted-foreground">{club.description}</p>
            </div>
          )}
        </div>

        {members.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No members found</h3>
              <p className="text-muted-foreground">
                This club doesn't have any registered members yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={member.profiles.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {member.profiles.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.profiles.full_name}</CardTitle>
                  <div className="flex justify-center">
                    <Badge 
                      className={`text-white ${getPositionColor(member.position)}`}
                    >
                      {getPositionLabel(member.position)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{member.profiles.email}</span>
                  </div>
                  
                  {member.profiles.department && (
                    <div className="text-sm">
                      <span className="font-medium">Department: </span>
                      <span className="text-muted-foreground">{member.profiles.department}</span>
                    </div>
                  )}

                  {member.profiles.bio && (
                    <div className="text-sm">
                      <span className="font-medium">Bio: </span>
                      <p className="text-muted-foreground mt-1 line-clamp-3">{member.profiles.bio}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Joined: {new Date(member.joined_at).toLocaleDateString()}
                  </div>

                  {profile?.user_id === member.profiles.user_id && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEditProfile(member)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            {editingProfile && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={editingProfile.full_name}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={editingProfile.bio}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClubMembers;