require("dotenv").config();
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});
(async () => {
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: "avatars/public/fe86cecc-09de-406e-a26a-6a869c7cd7c2.png",
      })
    );
    console.log("ContentType", res.ContentType);
    let chunks = [];
    for await (const c of res.Body) chunks.push(c);
    const buf = Buffer.concat(chunks);
    console.log("Size", buf.length);
    console.log("Head", buf.slice(0, 16).toString("hex"));
  } catch (e) {
    console.error("Error", e);
  }
})();
