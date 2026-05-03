-- DropForeignKey
ALTER TABLE `activity` DROP FOREIGN KEY `Activity_dayId_fkey`;

-- DropIndex
DROP INDEX `Activity_dayId_fkey` ON `activity`;

-- AlterTable
ALTER TABLE `activity` ADD COLUMN `fictional` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `type` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `Day`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
