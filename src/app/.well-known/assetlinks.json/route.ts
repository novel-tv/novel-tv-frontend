import { NextResponse } from "next/server";

// Served at https://www.novel-network.com/.well-known/assetlinks.json —
// Android checks this before trusting the app's intent-filter
// (mobile/android/app/src/main/AndroidManifest.xml) to open links like
// /dashboard or /reset-password in the Novel TV app instead of a browser.
// A route handler (rather than a static file under public/) guarantees the
// right content-type on Vercel for this exact path.
//
// The fingerprint below is the Flutter *debug* keystore's (android/app's
// release build type still signs with the debug key — see
// android/app/build.gradle.kts, "Signing with the debug keys for now").
// Once a real release keystore (or Google Play App Signing) is used for
// published builds, add that certificate's SHA256 fingerprint as another
// entry in this array — Play re-signs the app with its own key by default,
// so the fingerprint that ships to users is Play's, not this one.
export function GET() {
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.noveltv.novel_tv",
        sha256_cert_fingerprints: [
          "B7:0F:BA:F9:FB:33:CA:2D:C5:E5:D2:7A:86:7F:ED:C4:89:EF:65:B4:6F:6A:A5:3E:A6:B8:72:16:E8:A9:4A:AE",
        ],
      },
    },
  ]);
}
