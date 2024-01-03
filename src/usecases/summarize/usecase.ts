import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

type Params = {
  videoId: string;
  theme: string;
};

export interface GenerateSummaryUsecase {
  execute(param: Params): Promise<string>;
}

export class GenerateSummaryUsecaseImpl implements GenerateSummaryUsecase {
  async execute({ videoId, theme }: Params): Promise<string> {
    const transcription = await this.getVideoTranscription(videoId);
    const summary = await this.genereateSummary(transcription, theme);
    return summary!;
  }

  private async getVideoTranscription(videoId: string) {
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });
    if (!video) {
      throw Error("No video found");
    }
    if (!video.transcription) {
      throw Error("No transcription found");
    }
    return video.transcription;
  }

  private async genereateSummary(transcription: string, theme: string) {
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
            "${transcription}"
          
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
    console.log("summary completion");
    console.log(completion.choices[0]);
    return completion.choices[0].message.content;
  }
}
