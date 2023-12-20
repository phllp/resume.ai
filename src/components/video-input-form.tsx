import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { FileVideo, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@radix-ui/react-label";
import { Badge } from "@/components/ui/badge";

type Status =
  | "waiting"
  | "converting"
  | "transcribing"
  | "uploading"
  | "generating"
  | "success"
  | "error";

const statusBadge = (status: Status) => {
  switch (status) {
    case "waiting":
      return "bg-primary ";
    case "converting":
      return "bg-yellow-600  animate-pulse";
    case "transcribing":
      return "bg-blue-600  animate-pulse";
    case "uploading":
      return "bg-primary  animate-pulse";
    case "generating":
      return "bg-primary  animate-pulse";
    case "success":
      return "bg-green-600 ";
    case "error":
      return "bg-red-600 ";
    default:
      return "bg-primary ";
  }
};

type VideoUploadProps = {
  setVideoId: (id: string) => void;
  setTranscription: (transcription: string) => void;
};

export function VideoInputForm({
  setVideoId,
  setTranscription,
}: VideoUploadProps) {
  const [videoFile, setVideoFile] = useState<File>();
  const [status, setStatus] = useState<Status>("waiting");
  useState<Status>("waiting");
  const [convertProgress, setConvertProgress] = useState<number>(0);

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;

    if (!files) return;

    const selectedFile = files[0];
    setVideoFile(selectedFile);
  };

  const convertVideoToAudio = async (video: File) => {
    const ffMpeg = await getFFmpeg();
    await ffMpeg.writeFile("input.mp4", await fetchFile(video));

    ffMpeg.on("progress", (progress) => {
      setConvertProgress(progress.progress * 100);
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
        setVideoId(jsonData.videoId);
        setConvertProgress(0);
        await handleTranscription(jsonData.videoId);
      }
    } catch (e: any) {
      setStatus("error");
      console.error(e);
    }
  };

  const handleTranscription = async (videoId: string) => {
    console.log("transcribing video");
    console.log(`video id: ${videoId}`);
    setStatus("transcribing");
    // const theme = themeRef.current?.value;
    try {
      const data = new FormData();
      data.set("videoId", videoId as string);

      const res = await fetch("/api/transcription", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const jsonData = await res.json();

        setTranscription(jsonData.transcription);
        setStatus("success");
      } else {
        setStatus("error");
        throw new Error(await res.text());
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
    <form action="" onSubmit={handleVideoUpload} className="m-2">
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
            Selecionar vídeo
            <FileVideo className="w-4 h-4"></FileVideo>
          </>
        )}
      </label>

      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only aspect-video input-file"
        onChange={handleFileSelected}
      />
      <Button type="submit" className="mt-2">
        Carregar Vídeo <Upload className="ml-4 w-4 h-4" />
      </Button>

      <Badge className={`ml-4 text-white  ${statusBadge(status)} `}>
        {status}
      </Badge>

      {status === "converting" && (
        <div className="my-2">
          <Label htmlFor="progress" className="text-sm ">
            convertendo...
          </Label>
          <Progress className="h-2" id="progress" value={convertProgress} />
        </div>
      )}
    </form>
  );
}
