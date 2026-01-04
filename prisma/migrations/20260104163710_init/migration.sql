-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "aspectRatio" TEXT NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);
