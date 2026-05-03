-- AlterTable
ALTER TABLE `activity` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `time` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `day` ADD COLUMN `summary` VARCHAR(191) NULL;
