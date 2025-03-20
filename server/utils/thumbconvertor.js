const sharp = require("sharp");
//const fs = require("fs");
//const ffmpeg = require("fluent-ffmpeg");

async function thumbnailImage(base64Data, width = 150, height = 150) {
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Image, "base64");

  try {
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(width, height)
      .toBuffer();

    return `data:image/png;base64,${thumbnailBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Error createing image thumbnail", err);
    return null;
  }
}

/*async function thumbnailVideo(
  base64Data,
  time = "00:00:01",
  width = 150,
  height = 150
) {
  const base64Video = base64Data.replace(/^data:video\/\w+;base64,/, "");
  const videoBuffer = Buffer.from(base64Video, "base64");

  const tempVideoPath = "./Temp/temp_video.mp4";
  const tempThumbnailPath = "./Temp/temp_video.png";
  fs.writeFileSync(tempVideoPath, videoBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg(tempThumbnailPath)
      .screenshot({
        timestamps: [time],
        filename: tempThumbnailPath,
        folder: "./",
        size: `${width}x${height}`,
      })
      .on("end", async () => {
        const thumbnailBuffer = fs.readFile(tempThumbnailPath);
        const thumbnailBase64 = `data:image/png;base64,${thumbnailBuffer}`;

        fs.unlinkSync(tempThumbnailPath);
        fs.unlinkSync(tempVideoPath);

        resolve(thumbnailBase64);
      })
      .on("error", (err) => {
        console.error("Error creating video thumbnail", err);
        reject(null);
      });
  });
}*/

module.exports = { thumbnailImage };
