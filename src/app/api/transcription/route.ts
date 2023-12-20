import { NextRequest, NextResponse } from "next/server";

import { createReadStream } from "fs";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const videoId = data.get("videoId") as unknown as string;
  console.log("transcription started");

  const prompt = "Gere a transcrição exata do audio.";

  //   const bodySchema = z.object({
  //     prompt: z.string(),
  //   });

  //   const { prompt } = bodySchema.parse(req.body);

  const video = await prisma.video.findUniqueOrThrow({
    where: {
      id: videoId,
    },
  });
  if (!video) {
    return NextResponse.json({ error: "No video found" }, { status: 400 });
  }
  const videoPath = video.path;

  console.log(`PATH: ${videoPath}`);

  const audioReadStream = createReadStream(videoPath);

  if (!audioReadStream) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const response = await openai.audio.transcriptions.create({
    file: audioReadStream,
    model: "whisper-1",
    language: "pt",
    response_format: "json",
  });
  console.log(response);
  const transcription = response.text;

  await prisma.video.update({
    where: {
      id: videoId,
    },
    data: {
      transcription: transcription,
    },
  });

  return NextResponse.json({ transcription: transcription }, { status: 200 });
}
