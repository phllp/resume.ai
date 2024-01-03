import { NextRequest, NextResponse } from "next/server";
import { GenerateTranscriptionUsecaseImpl } from "@/usecases/generate-transcription/usecase";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const videoId = data.get("videoId") as unknown as string;
  const theme = data.get("theme") as unknown as string;

  try {
    const generateTranscriptionUsecase = new GenerateTranscriptionUsecaseImpl();
    const transcription = await generateTranscriptionUsecase.execute({
      videoId,
      theme,
    });
    return NextResponse.json({ transcription: transcription }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
