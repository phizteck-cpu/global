-- Add durationWeeks field to Tier table
ALTER TABLE Tier ADD COLUMN durationWeeks INTEGER DEFAULT 45;

-- Update existing tiers to have 45 weeks duration
UPDATE Tier SET durationWeeks = 45 WHERE durationWeeks IS NULL;
