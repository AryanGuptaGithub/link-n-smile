// app/api/vendor/wallet/route.ts
import { withCORS } from "@/lib/cors";
import { connectDB } from "@/lib/db";
import { Wallet } from "@/lib/models/wallet";
import Shop from "@/lib/models/shop";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  if (request.method === 'OPTIONS') {
    return withCORS(new NextResponse(null));
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return withCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    await connectDB();

    const { User } = await import("@/lib/models/user");
    const user = await User.findOne({ email: session.user.email });
    const shop = await Shop.findOne({ ownerId: user?._id });

    if (!shop) return withCORS(NextResponse.json({ error: "Shop not found" }, { status: 404 }));

    const wallet = await Wallet.findOne({ shopId: shop._id, type: "VENDOR" });
    if (!wallet) return withCORS(NextResponse.json({ error: "Wallet not found" }, { status: 404 }));

    return withCORS(NextResponse.json({
      totalBalance: wallet.pendingBalance + wallet.withdrawableBalance,
      pendingBalance: wallet.pendingBalance,
      withdrawableBalance: wallet.withdrawableBalance,
      frozenBalance: wallet.frozenBalance,
      minimumWithdrawalThreshold: wallet.minimumThreshold,
      isFrozen: wallet.status === "FROZEN",
      isClosed: wallet.status === "CLOSED",
      currency: wallet.currency,
      lastReconciledAt: wallet.lastReconciledAt,
    }));

  } catch (error: any) {
    console.error("[Wallet GET]", error);
    return withCORS(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
  }
}