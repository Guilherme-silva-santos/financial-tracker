/*
  Warnings:

  - You are about to drop the column `usersId` on the `categorie` table. All the data in the column will be lost.
  - You are about to drop the column `usersId` on the `expense` table. All the data in the column will be lost.
  - Added the required column `userId` to the `categorie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `expense` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "categorie" DROP CONSTRAINT "categorie_usersId_fkey";

-- DropForeignKey
ALTER TABLE "expense" DROP CONSTRAINT "expense_usersId_fkey";

-- AlterTable
ALTER TABLE "categorie" DROP COLUMN "usersId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "expense" DROP COLUMN "usersId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "categorie" ADD CONSTRAINT "categorie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
