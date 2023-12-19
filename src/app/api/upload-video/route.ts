import { prisma } from "@/lib/prisma";
import path from "node:path";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

import process from "process";

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.formData();

  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = path.extname(file.name);
  const timestampAtual = new Date().getTime().toString();
  const fileBasename = path.basename(file.name, extension);
  const fileUploadName = `${fileBasename}-${timestampAtual}${extension}`;

  const rootDir = process.cwd();

  const uploadDestination = path.resolve(rootDir, "temp", fileUploadName);

  if (extension != ".mp3") {
    return NextResponse.json(
      { error: "Invalid input type, please upload a MP3" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(uploadDestination, buffer);
  console.log(`open ${uploadDestination} to see the uploaded file`);

  const video = await prisma.video.create({
    data: {
      name: fileUploadName,
      path: uploadDestination,
    },
  });

  return NextResponse.json(
    { success: true, path: video.path },
    { status: 200 }
  );
}
