import { GenerateDescriptionUsecaseImpl } from "@/usecases/generate-description/usecase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const videoId = data.get("videoId") as unknown as string;
  const theme = data.get("theme") as unknown as string;

  try {
    const generateDescriptionUsecase = new GenerateDescriptionUsecaseImpl();
    const description = await generateDescriptionUsecase.execute({
      videoId,
      theme,
    });

    return NextResponse.json({ description }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
