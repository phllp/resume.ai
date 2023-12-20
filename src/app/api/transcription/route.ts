import { NextRequest, NextResponse } from "next/server";

import { ReadStream, createReadStream } from "fs";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const generateTranscription = async (audioReadStream: ReadStream) => {
  const response = await openai.audio.transcriptions.create({
    file: audioReadStream,
    model: "whisper-1",
    language: "pt",
    response_format: "json",
  });
  console.log(response);
  const transcription = response.text;
  return transcription;
};

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const videoId = data.get("videoId") as unknown as string;
  const theme = data.get("theme") as unknown as string;

  console.log("transcription started");

  const prompt = "Gere a transcrição exata do audio.";

  const video = await prisma.video.findUniqueOrThrow({
    where: {
      id: videoId,
    },
  });
  if (!video) {
    return NextResponse.json({ error: "No video found" }, { status: 400 });
  }

  const audioReadStream = createReadStream(video.path);

  if (!audioReadStream) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const transcription = await generateTranscription(audioReadStream);

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
