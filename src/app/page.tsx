"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { VideoInputForm } from "@/components/video-input-form";
import { Github } from "lucide-react";
import { use, useRef, useState } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState<string>();
  const [transcription, setTranscription] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [summary, setSummary] = useState<string>();
  const themeRef = useRef<HTMLInputElement>(null);

  const handleTranscription = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    console.log("transcribing video");
    console.log(`video id: ${videoId}`);

    const theme = themeRef.current?.value;

    const data = new FormData();
    data.set("videoId", videoId as string);
    data.set("theme", theme as string);

    console.log(data);

    const res = await fetch("/api/transcription", {
      method: "POST",
      body: data,
    });

    const jsonData = await res.json();

    setTranscription(jsonData.transcription);
  };

  const handleDescription = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    console.log("describing video");
    console.log(`video id: ${videoId}`);

    const theme = themeRef.current?.value;

    const data = new FormData();
    data.set("videoId", videoId as string);
    data.set("theme", theme as string);

    console.log(data);

    const res = await fetch("/api/description", {
      method: "POST",
      body: data,
    });

    const jsonData = await res.json();

    setDescription(jsonData.description);
  };

  const handleSummary = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    console.log("summarizing video");
    console.log(`video id: ${videoId}`);

    const theme = themeRef.current?.value;

    const data = new FormData();
    data.set("videoId", videoId as string);
    data.set("theme", theme as string);

    console.log(data);

    const res = await fetch("/api/summary", {
      method: "POST",
      body: data,
    });

    const jsonData = await res.json();

    setSummary(jsonData.summary);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* header */}
      <section className="flex items-start">
        <div className="px-6 py-3 flex justify-between  border-b min-w-full bg-primary">
          <div className="flex items-center justify-center ">
            <h1 className="text-xl font-bold text-white">resume.me</h1>

            <span className="text-sm text-muted-foreground ml-4">
              Crie resumos consisos sobre vídeos e obtenha insights relevantes.
            </span>
          </div>
          <a href="https://github.com/phllp/resume.me" target="_blank">
            <Button variant={"outline"} className="mx-2">
              <Github className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>
      <main className="flex-1  flex gap-6">
        <aside className="w-96 space-y-6 border-r-2 shadow-xl bg-primary-foreground">
          {/* upload area */}
          <section className="flex flex-col  items-center justify-center w-full">
            {/* <h2>Faça o upload de um arquivo</h2> */}
            <div className="items-center justify-center w-full mx-4">
              <VideoInputForm
                setVideoId={setVideoId}
                setTranscription={setTranscription}
              />
              <Separator orientation="horizontal" className="my-2" />

              <div className="mx-2 gap-2">
                <Label htmlFor="theme" className="text-md">
                  Qual é o tema do vídeo?
                </Label>
                <Input
                  ref={themeRef}
                  id="theme"
                  placeholder="Ex: Aula de História, Palestra sobre IA..."
                  className="h-8"
                />
              </div>

              {/* <Button className="my-4 h-10" onClick={handleTranscription}>
                Gerar Resumo
              </Button> */}
            </div>
          </section>
        </aside>

        {/* insights area */}
        <section className="m-4 flex flex-col gap-4 items-center w-full">
          <Card className="shadow-lg w-full h-fit">
            <CardHeader>
              <CardTitle> Transcrição </CardTitle>
              <CardDescription>A transcrição literal do vídeo</CardDescription>
            </CardHeader>

            <CardContent>
              <Textarea
                disabled={true}
                value={transcription}
                className="h-[150px]"
              ></Textarea>
            </CardContent>

            <CardFooter></CardFooter>
          </Card>
          <div className="w-full flex gap-4">
            <Card className="shadow-lg w-1/2 h-fit">
              <CardHeader>
                <CardTitle> Descrição </CardTitle>
                <CardDescription>
                  Descrição objetiva do que se trata o vídeo
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Textarea
                  disabled={true}
                  value={description}
                  className="h-[150px]"
                ></Textarea>
              </CardContent>

              <CardFooter>
                <Button onClick={handleDescription}>Gerar</Button>
              </CardFooter>
            </Card>
            <Card className="shadow-lg w-1/2 h-fit">
              <CardHeader>
                <CardTitle> Resumo </CardTitle>
                <CardDescription>
                  O resumo em si, com os pontos mais importantes do vídeo
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Textarea
                  disabled={true}
                  value={summary}
                  className="h-[150px]"
                ></Textarea>
              </CardContent>

              <CardFooter>
                <Button onClick={handleSummary}>Gerar</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
