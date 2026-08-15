# Production incident: file uploads failing (401/500) — root cause found

## What the Render log actually shows

The stack trace is **not** related to this app's session/JWT auth at all. It's the backend's own outgoing call to Backblaze B2 failing:

```
GET https://api.backblazeb2.com/b2api/v2/b2_authorize_account
Authorization: Basic base64(applicationKeyId:applicationKey)

response.status: 401
response.data: { code: 'unauthorized', message: '', status: 401 }
uploadContext: { fileName: '1786822192074-uevj-rnb.jfif', key: 'videos/1786822192074-uevj-rnb.jfif', attempts: 3 }
```

`b2_authorize_account` is the very first call the B2 SDK makes to exchange your Application Key ID + Application Key for a session auth token. Backblaze is rejecting those credentials outright (not a scoping/permissions issue on a specific bucket — this is the account-level handshake itself failing). `attempts: 3` confirms the backend retried three times against B2 and gave up every time before returning an error to the client.

**This is why the frontend saw both a 401 and a 500**: your upload handler, unable to authenticate with B2, ends up sending an error response back to the client — and at least one of those responses appears to relay B2's raw `401` straight through to the frontend instead of translating it into your own app's error format. The frontend's axios interceptor treats *any* 401 as "the user's session expired" and kicks off its own token-refresh flow, which is a red herring here — nothing is wrong with the user's session. This is unrelated to the `.jfif` upload-type change; the timing was coincidental.

## What to fix

1. **Check the Application Key in the Backblaze B2 dashboard** (Account → App Keys): confirm the Key ID + Application Key currently set as environment variables on Render still exist and are active. A key can stop working if it was deleted, regenerated, or set with an expiration that passed.
2. **If in doubt, generate a fresh Application Key** in B2 and update the corresponding environment variables on Render, then restart/redeploy the service so it picks up the new values.
3. **Check for copy/paste corruption** in the Render env vars (trailing whitespace, a stray newline, a truncated value) — a very common cause of "credentials look right but still get 401."
4. **Confirm the key's capabilities/bucket scope** still match what the app needs (e.g., `listFiles`, `writeFiles`, `readFiles` on the correct bucket) — though a 401 at `b2_authorize_account` specifically means the *credentials themselves* are rejected, not that they lack a scope (a scope problem would normally show up as 403 on a later call, not 401 here).

## Recommended hardening (not blocking, but worth doing while you're in there)

Don't let B2 401s (or any upstream/storage-provider error) pass through to the client as a 401. Translate storage-layer failures into a 500 (or 502/503 "upstream storage unavailable") in your upload route's error handling. A raw 401 from a third-party dependency looks, from the frontend's perspective, identical to *this app's own* session having expired — which is exactly the confusing symptom reported (an unnecessary token-refresh attempt firing off a real upload failure).

## Not related to this incident

- No frontend code changes are needed for this — `src/services/api.js` was re-verified and is sending the session cookie correctly on every request, including uploads.
- The `.jfif`/image-upload changes from `BACKEND_UPLOAD_MIME_GUIDE.md` are not implicated — the failure happens before any file-type validation would even run (it's failing at the B2 account-authorization step, which happens for every upload regardless of file type).

## How to verify the fix

- Backend: confirm `b2_authorize_account` returns 200 in your own logs after updating the credentials.
- From the admin panel in production, upload an image, a video, and a `.jfif` file — all three should succeed with no 401/500.
