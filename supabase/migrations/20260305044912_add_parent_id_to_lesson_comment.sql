ALTER TABLE platform_lesson_comment ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES platform_lesson_comment(id) ON DELETE CASCADE;;
