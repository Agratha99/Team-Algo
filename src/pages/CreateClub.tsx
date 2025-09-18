import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateClub = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const clubName = formData.get('clubName') as string;
    const clubEmail = formData.get('clubEmail') as string;
    const clubInfo = formData.get('clubInfo') as string;

    // Validate CMRIT email domain
    if (!clubEmail.toLowerCase().endsWith('@cmrit.ac.in')) {
      toast({
        title: "Invalid Email",
        description: "Please use a CMRIT email address (@cmrit.ac.in)",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // For now, we'll store the club data without the logo
      // In a full implementation, you'd upload the logo to Supabase Storage first
      const { error } = await supabase
        .from('clubs')
        .insert([{
          name: clubName,
          contact_email: clubEmail,
          description: clubInfo,
          created_by: null // Since this is public registration
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Club creation request submitted successfully! It will be reviewed by administration.",
      });

      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file for the logo",
          variant: "destructive"
        });
        return;
      }
      setLogoFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/auth')}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">Create New Club</CardTitle>
              <p className="text-muted-foreground">Submit your club for review</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clubName">Club Name</Label>
              <Input
                id="clubName"
                name="clubName"
                type="text"
                placeholder="Enter club name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clubEmail">Club Email</Label>
              <Input
                id="clubEmail"
                name="clubEmail"
                type="email"
                placeholder="club@cmrit.ac.in"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clubInfo">Club Information</Label>
              <Textarea
                id="clubInfo"
                name="clubInfo"
                placeholder="Describe your club's purpose, activities, and goals..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clubLogo">Club Logo</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  id="clubLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label htmlFor="clubLogo" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {logoFile ? logoFile.name : "Click to upload logo (optional)"}
                  </p>
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Club for Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClub;