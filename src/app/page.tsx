"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoInputForm } from "@/components/video-input-form";
import { baseURL } from "@/helpers/api";
import axios from "axios";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col  ">
      {/* header */}
      <section className="flex items-start">
        <div className="px-6 py-3 flex items-center  border-b min-w-full shadow-xl">
          <h1 className="text-xl font-bold">Resume.me</h1>

          <div className="flex items-center ml-4">
            <span className="text-sm text-muted-foreground">
              Crie resumos consisos sobre vídeos e obtenha insights relevantes.
            </span>

            {/* <Separator className="h-6" orientation="vertical" /> */}

            <Button variant={"outline"}>
              <Github className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* upload area */}
      <section className="flex flex-col grow items-center justify-center py-8">
        {/* <h2>Faça o upload de um arquivo</h2> */}
        <div className="items-center justify-center">
          <VideoInputForm></VideoInputForm>
        </div>
      </section>
    </main>
  );
}