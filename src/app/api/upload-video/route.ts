import { NextRequest, NextResponse } from "next/server";
import { UploadVideoUseCaseImpl } from "@/usecases/upload-video/usecase";

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.formData();

  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const uploadVideoUseCase = new UploadVideoUseCaseImpl();
    const video = await uploadVideoUseCase.execute(file);

    return NextResponse.json(
      { success: true, videoId: video.id },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
