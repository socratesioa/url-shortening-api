export async function handler(event) {
  try {
    const { url } = JSON.parse(event.body);
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No URL provided" }),
      };
    }

    const apiKey = process.env.REBRANDLY_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server missing API key" }),
      };
    }

    const body = {
      destination: url,
      domain: { fullName: "rebrand.ly" },
    };

    const response = await fetch("https://api.rebrandly.com/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: result.message || "Error from Rebrandly",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ shortUrl: result.shortUrl }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
}
