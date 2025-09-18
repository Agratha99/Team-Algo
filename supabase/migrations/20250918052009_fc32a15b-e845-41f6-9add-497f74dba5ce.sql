-- Drop the existing restrictive policy for club creation
DROP POLICY IF EXISTS "Club members can create clubs" ON public.clubs;

-- Create a new policy that allows public club registration
CREATE POLICY "Anyone can submit club registration" 
ON public.clubs 
FOR INSERT 
WITH CHECK (true);

-- Also update the clubs table to make created_by nullable since public registrations won't have a user
ALTER TABLE public.clubs ALTER COLUMN created_by DROP NOT NULL;