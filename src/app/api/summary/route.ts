import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const videoId = data.get("videoId") as unknown as string;
  const theme = data.get("theme") as unknown as string;

  const video = await prisma.video.findUniqueOrThrow({
    where: {
      id: videoId,
    },
  });
  if (!video) {
    return NextResponse.json({ error: "No video found" }, { status: 400 });
  }
  console.log(theme);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Você está encarregado de analisar a transcrição de um vídeo, e extrair as informações solicitadas a partir disso.",
      },
      {
        role: "user",
        content: `A partir da seguinte transcrição, elabore um resumo do conteúdo do vídeo, abordando os pontos mais importantes:  
          "${video.transcription}"
        
        ${
          theme
            ? `Ao mesmo tempo, leve em consideração que o vídeo se trata de "${theme}"`
            : ""
        }
          `,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
  return NextResponse.json(
    { summary: completion.choices[0].message.content },
    { status: 200 }
  );
}
