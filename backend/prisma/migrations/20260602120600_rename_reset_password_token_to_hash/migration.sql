DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'resetPasswordToken'
  ) THEN
    ALTER TABLE "users"
      RENAME COLUMN "resetPasswordToken" TO "resetPasswordTokenHash";
  END IF;
END $$;
