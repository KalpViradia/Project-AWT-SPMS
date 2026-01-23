-- First, clean up old project types that are no longer needed
-- This updates any project_groups using IDP/UDP to use Major instead
UPDATE "project_group" SET "project_type_id" = (
  SELECT "project_type_id" FROM "project_type" WHERE "project_type_name" = 'Major' LIMIT 1
) WHERE "project_type_id" IN (
  SELECT "project_type_id" FROM "project_type" WHERE "project_type_name" IN ('IDP', 'UDP')
);

-- Delete old project types
DELETE FROM "project_type" WHERE "project_type_name" IN ('IDP', 'UDP');

-- Insert the correct project types
INSERT INTO "project_type" ("project_type_name", "description", "created_at", "modified_at") 
VALUES 
('Major', 'Major Project', NOW(), NOW()),
('Minor', 'Minor Project', NOW(), NOW()),
('Research', 'Research Project', NOW(), NOW())
ON CONFLICT ("project_type_name") DO NOTHING;
