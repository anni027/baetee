import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json(
    { message: "Commission bids are disabled until email delivery is connected." },
    { status: 503 }
  );
}
