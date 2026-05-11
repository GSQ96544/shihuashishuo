let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.value;
  }

  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error("BAIDU_OCR_API_KEY or BAIDU_OCR_SECRET_KEY not configured");
  }

  const res = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error(`Baidu auth failed: ${res.status}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Baidu auth: no access_token in response");
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 2592000) * 1000,
  };

  return cachedToken.value;
}

export async function recognizeText(imageBase64: string): Promise<string> {
  // Strip data URL prefix for Baidu API
  const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const token = await getAccessToken();
  const res = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        image: pureBase64,
        language_type: "CHN_ENG",
        detect_direction: "true",
        paragraph: "true",
      }).toString(),
    }
  );

  if (!res.ok) {
    throw new Error(`Baidu OCR failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.error_code) {
    throw new Error(`Baidu OCR error ${data.error_code}: ${data.error_msg}`);
  }

  const words = data.words_result?.map((w: { words: string }) => w.words) || [];
  return words.join("\n");
}
