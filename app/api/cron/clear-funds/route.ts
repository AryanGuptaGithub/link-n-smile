import { withCORS } from "@/lib/cors";
import { LedgerService } from "@/lib/services/ledger-service";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.method === 'OPTIONS') {
    return withCORS(new NextResponse(null));
  }

  try {
    // In production, this should be protected by a secret token in headers
    // const authHeader = req.headers.get("Authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) ...

    await connectDB();
    await LedgerService.clearPendingFunds();

    return withCORS(NextResponse.json({ success: true, message: "Funds clearing processed" }));
  } catch (error) {
    console.error("Clearing worker error:", error);
    return withCORS(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
  }
}
