import { NextResponse } from "next/server";

// Served at https://www.novel-network.com/.well-known/apple-app-site-association
// (no file extension — iOS fetches this exact path). iOS checks this
// before trusting the "Associated Domains" entitlement
// (mobile/ios/Runner/Runner.entitlements) to open links like /dashboard or
// /reset-password in the Novel TV app instead of Safari.
//
// TODO: "TEAMID" below is a placeholder — replace it with the real Apple
// Developer Team ID (Apple Developer > Membership) before this does
// anything on iOS. appID must be exactly "{TeamID}.{BundleID}" — the
// bundle ID is com.noveltv.novelTv (mobile/ios/Runner.xcodeproj).
export function GET() {
  return NextResponse.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: "TEAMID.com.noveltv.novelTv",
          paths: ["/dashboard", "/pricing", "/reset-password", "/contact-us"],
        },
      ],
    },
  });
}
