export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // TEMP FAKE RESPONSE
  return res.status(200).json({
    success: true,
    message: "Image received successfully",
  });
}
