import { prisma } from "@/lib/prisma";
import { ReadStream, createReadStream } from "fs";
import { openai } from "@/lib/openai";

type Params = {
  videoId: string;
  theme: string;
};

export interface GenerateTranscriptionUsecase {
  execute(param: Params): Promise<string>;
}

export class GenerateTranscriptionUsecaseImpl
  implements GenerateTranscriptionUsecase
{
  async execute({ videoId, theme }: Params): Promise<string> {
    console.log("transcription started");

    const prompt = "Gere a transcrição exata do audio.";
    const audioReadStream = await this.getAudioFile(videoId);
    const transcription = await this.generateTranscription(audioReadStream);
    const saved = await this.saveTranscription(videoId, transcription);
    return saved.transcription!;
  }

  private async getAudioFile(videoId: string) {
    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });
    if (!video) {
      throw Error("No video found");
      //   return NextResponse.json({ error: "No video found" }, { status: 400 });
    }

    const audioReadStream = createReadStream(video.path);

    if (!audioReadStream) {
      throw new Error("No file provided");
      //   return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    return audioReadStream;
  }

  private async generateTranscription(audioReadStream: ReadStream) {
    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "pt",
      response_format: "json",
    });
    console.log(response);
    const transcription = response.text;
    return transcription;
  }

  private async saveTranscription(videoId: string, transcription: string) {
    return await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription: transcription,
      },
    });
  }
}
