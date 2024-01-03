import { GenerateSummaryUsecaseImpl } from "@/usecases/summarize/usecase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const videoId = data.get("videoId") as unknown as string;
  const theme = data.get("theme") as unknown as string;

  try {
    const generateSummaryUsecase = new GenerateSummaryUsecaseImpl();
    const summary = await generateSummaryUsecase.execute({ videoId, theme });

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
