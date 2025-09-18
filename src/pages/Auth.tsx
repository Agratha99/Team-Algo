import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, UserCheck } from "lucide-react";

interface Club {
  id: string;
  name: string;
}

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'faculty' | 'club_member'>('student');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const { data } = await supabase
      .from('clubs')
      .select('id, name')
      .order('name');
    
    if (data) {
      setClubs(data);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('@cmrit.ac.in');
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use your CMRIT email address (@cmrit.ac.in)",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Logged in successfully!"
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const studentId = formData.get('studentId') as string;
    const department = formData.get('department') as string;
    const yearOfStudy = formData.get('yearOfStudy') as string;

    // Validate CMRIT email
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use your CMRIT email address (@cmrit.ac.in)",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // For club members, validate club and position selection
    if (userType === 'club_member' && (!selectedClub || !selectedPosition)) {
      toast({
        title: "Error",
        description: "Please select a club and your position",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const userData = {
      full_name: fullName,
      role: userType,
      student_id: studentId,
      department,
      year_of_study: yearOfStudy ? parseInt(yearOfStudy) : null,
      club_id: userType === 'club_member' ? selectedClub : null,
      position: userType === 'club_member' ? selectedPosition : null
    };

    const { error } = await signUp(email, password, userData);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account."
      });
    }
    setLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-5 w-5" />;
      case 'faculty': return <UserCheck className="h-5 w-5" />;
      case 'club_member': return <Users className="h-5 w-5" />;
      default: return <GraduationCap className="h-5 w-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Student';
      case 'faculty': return 'Faculty';
      case 'club_member': return 'Club Member';
      default: return 'Student';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">EventHub</CardTitle>
          <p className="text-muted-foreground">CMRIT College Events Platform</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your CMRIT email (@cmrit.ac.in)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Want to create a new club?</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/create-club'}
                >
                  Create New Club
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select User Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['student', 'faculty', 'club_member'] as const).map((role) => (
                      <Button
                        key={role}
                        type="button"
                        variant={userType === role ? "default" : "outline"}
                        className="flex flex-col h-auto p-3 gap-1"
                        onClick={() => setUserType(role)}
                      >
                        {getRoleIcon(role)}
                        <span className="text-xs">{getRoleLabel(role)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your CMRIT email (@cmrit.ac.in)"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  {userType === 'club_member' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="club">Select Club</Label>
                        <Select value={selectedClub} onValueChange={setSelectedClub} required>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Choose your club" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            {clubs.map((club) => (
                              <SelectItem key={club.id} value={club.id}>
                                {club.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Your Position</Label>
                        <Select value={selectedPosition} onValueChange={setSelectedPosition} required>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select your position" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            <SelectItem value="president">President</SelectItem>
                            <SelectItem value="vice_president">Vice President</SelectItem>
                            <SelectItem value="secretary">Secretary</SelectItem>
                            <SelectItem value="event_manager">Event Manager</SelectItem>
                            <SelectItem value="pr_team">PR Team</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {userType === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          name="studentId"
                          type="text"
                          placeholder="Enter your student ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearOfStudy">Year of Study</Label>
                        <Select name="yearOfStudy">
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      placeholder="Enter your department"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;