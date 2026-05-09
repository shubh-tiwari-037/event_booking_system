/*
  Warnings:

  - Added the required column `reason` to the `admin_transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionReason" AS ENUM ('TICKET_PURCHASE', 'ADMIN_SHARE', 'MANAGER_SHARE');

-- AlterTable
ALTER TABLE "admin_transaction" DROP COLUMN "reason",
ADD COLUMN     "reason" "TransactionReason" NOT NULL;

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "reason",
ADD COLUMN     "reason" "TransactionReason" NOT NULL;
