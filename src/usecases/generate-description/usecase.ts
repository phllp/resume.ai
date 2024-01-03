import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

type Params = {
  videoId: string;
  theme: string;
};

export interface GenerateDescriptionUsecase {
  execute(param: Params): Promise<string>;
}

export class GenerateDescriptionUsecaseImpl
  implements GenerateDescriptionUsecase
{
  async execute({ videoId, theme }: Params): Promise<string> {
    const transcription = await this.getVideoTranscription(videoId);
    const description = await this.generateDescription(transcription, theme);
    return description!;
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

  private async generateDescription(transcription: string, theme: string) {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Você está encarregado de analisar a transcrição de um vídeo, e extrair as informações solicitadas a partir disso.",
        },
        {
          role: "user",
          content: `Em poucas frases, de forma sucinta e objetiva, qual é a descrição do conteúdo do vídeo representado pela seguinte transcrição:  
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
      max_tokens: 130,
    });

    console.log("description completion");
    console.log(completion.choices[0]);
    return completion.choices[0].message.content;
  }
}
