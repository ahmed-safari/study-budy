// pages/api/youtubeMetadata.js
import { fetchYouTubeMetadata } from "@/utils/youtube";

export const GET = async (req) => {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");
  //   const { url } = query;s
  if (!url) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing URL parameter",
      }),
      { status: 400 }
    );
  }
  try {
    const metadata = await fetchYouTubeMetadata(url);
    console.log("YouTube metadata:", metadata);
    return new Response(
      JSON.stringify({
        success: true,
        data: metadata,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("An error occurred while fetching YouTube metadata:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
