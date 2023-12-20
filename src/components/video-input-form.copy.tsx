import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { FileVideo, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Status =
  | "waiting"
  | "converting"
  | "uploading"
  | "generating"
  | "success"
  | "error";

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File>();
  const [status, setStatus] = useState<Status>("waiting");

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;

    if (!files) return;

    const selectedFile = files[0];
    setVideoFile(selectedFile);
  };

  const convertVideoToAudio = async (video: File) => {
    console.log("converting audio to video");

    const ffMpeg = await getFFmpeg();
    await ffMpeg.writeFile("input.mp4", await fetchFile(video));

    ffMpeg.on("progress", (progress) => {
      console.log("Convert progress: " + Math.round(progress.progress * 100));
    });

    ffMpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffMpeg.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mpeg" });

    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg",
    });
    console.log(`conversion finished, audio file size: ${audioFile.size}`);

    return audioFile;
  };

  const handleVideoUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!videoFile) return;

    setStatus("converting");

    const audioFile = await convertVideoToAudio(videoFile);

    const data = new FormData();
    data.append("file", audioFile);

    setStatus("uploading");

    try {
      const data = new FormData();
      data.set("file", audioFile);

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        setStatus("error");
        throw new Error(await res.text());
      } else {
        const jsonData = await res.json();

        const transcriptionData = new FormData();
        transcriptionData.set("videoId", jsonData.videoId);

        const transcriptionRes = await fetch("/api/transcription", {
          method: "POST",
          body: transcriptionData,
        });
        setStatus("success");
      }
    } catch (e: any) {
      setStatus("error");
      console.error(e);
    }
  };

  const previewUrl = useMemo(() => {
    if (!videoFile) return null;
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <div className="min-h-[200px]">
      <form
        action=""
        onSubmit={handleVideoUpload}
        className="flex h-full"
        style={{ height: "100%" }}
      >
        <div className="flex h-[100%]">
          <label
            htmlFor="video"
            className="relative flex border rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
          >
            {previewUrl ? (
              <video
                src={previewUrl}
                controls={false}
                className="pointer-events-none absolute inset-0"
              ></video>
            ) : (
              <>
                Carregar vídeo
                <FileVideo className="w-4 h-4"></FileVideo>
              </>
            )}
          </label>

          <div>
            <input
              type="file"
              id="video"
              accept="video/mp4"
              className="sr-only aspect-video input-file"
              onChange={handleFileSelected}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p>Qual é o tema do vídeo?</p>
            <Input
              type="text"
              placeholder="Ex: Aula de História, Palestra sobre IA..."
            />
          </div>
        </div>
        <Button type="submit" className="text-md">
          Carregar Vídeo <Upload className="ml-4 w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
