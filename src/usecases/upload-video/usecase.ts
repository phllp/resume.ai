import { prisma } from "../../lib/prisma";
import path from "node:path";
import { writeFile } from "fs/promises";

import process from "process";
import { Video } from "@prisma/client";

import { existsSync } from "fs";

export interface UploadVideoUseCase {
  execute(file: File): Promise<Video>;
}

export class UploadVideoUseCaseImpl implements UploadVideoUseCase {
  //   constructor(videoRepository, videoUploader) {
  //     this.videoRepository = videoRepository;
  //     this.videoUploader = videoUploader;
  //   }
  async execute(file: File) {
    const { fileUploadName, uploadDestination } = await this.saveFile(file);
    const video = await this.saveVideoPrisma(fileUploadName, uploadDestination);
    return video;
  }

  private async saveFile(file: File) {
    const extension = path.extname(file.name);

    if (extension != ".mp3") {
      throw new Error("Invalid input type, please upload a MP3");
    }

    const rootDir = process.cwd();
    const tempFolder = path.resolve(rootDir, "temp");

    const directory = path.dirname(tempFolder);

    if (!existsSync(directory)) {
      throw new Error(`Directory ${directory} does not exist`);
    }

    const timestampAtual = new Date().getTime().toString();
    const fileBasename = path.basename(file.name, extension);
    const fileUploadName = `${fileBasename}-${timestampAtual}${extension}`;
    const uploadDestination = path.resolve(rootDir, "temp", fileUploadName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(uploadDestination, buffer);
    console.log(`open ${uploadDestination} to see the uploaded file`);

    return { uploadDestination, fileUploadName };
  }

  private async saveVideoPrisma(
    fileUploadName: string,
    uploadDestination: string
  ) {
    return await prisma.video.create({
      data: {
        name: fileUploadName,
        path: uploadDestination,
      },
    });
  }
}
