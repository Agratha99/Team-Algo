-- Update user role enum to change club_head to club_member
ALTER TYPE public.user_role RENAME VALUE 'club_head' TO 'club_member';

-- Update RLS policies to use club_member instead of club_head
DROP POLICY "Club heads can create clubs" ON public.clubs;
CREATE POLICY "Club members can create clubs" 
ON public.clubs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'club_member'
  )
);

DROP POLICY "Club heads and faculty can create events" ON public.events;
CREATE POLICY "Club members and faculty can create events" 
ON public.events FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('club_member', 'faculty')
  )
);

DROP POLICY "Club heads can manage club members" ON public.club_members;
CREATE POLICY "Club members can manage their club members" 
ON public.club_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.club_members cm
    JOIN public.clubs c ON c.id = cm.club_id
    WHERE cm.club_id = club_members.club_id 
    AND cm.user_id = auth.uid()
    AND cm.position IN ('president', 'vice_president')
  )
);