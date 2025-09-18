-- Add logo_url column to clubs table
ALTER TABLE public.clubs ADD COLUMN logo_url TEXT;

-- Add bio and avatar_url columns to profiles table for member details
ALTER TABLE public.profiles ADD COLUMN bio TEXT;
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;

-- Add foreign key constraint from club_members to profiles
ALTER TABLE public.club_members 
ADD CONSTRAINT fk_club_members_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);