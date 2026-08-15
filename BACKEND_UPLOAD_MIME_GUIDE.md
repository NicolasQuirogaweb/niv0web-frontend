# Backend: allow image uploads (including .jfif) on the catalog "background" field

## Context

The admin panel has a "background" field on beats/loops catalogs (`backgroundVideo` in the data model — name unchanged) that, until now, was meant to only hold a background video. The frontend has been updated to also accept static images there (any catalog can now have a video **or** an image as its background), specifically to unblock `.jfif` files that admins want to use.

Diagnosis confirmed by testing both upload paths on the frontend:
- **File picker:** now fixed — the frontend's `accept` attribute was `"video/*"` only, filtering `.jfif` out of the OS file picker. It's now `"video/*,image/*,.jfif"`.
- **Drag & drop:** the frontend's drag-and-drop path has **no** client-side type filtering at all — it was already forwarding the file straight to `POST /api/admin/upload`. If a `.jfif` dragged in still failed, that rejection is coming from this backend's upload endpoint, not the frontend.

So this half needs backend changes: `POST /api/admin/upload` (and its batch counterpart, if it shares the same validation) needs to actually accept image files for this use case.

## What needs to change

### 1. Find the file-type validation on the upload endpoint

Locate whatever currently decides which files are accepted — most likely a `multer` `fileFilter` (or an equivalent mimetype/extension whitelist) on the `/api/admin/upload` route. Confirm:
- Is the whitelist global (same allowed types for every upload regardless of `folder`), or scoped per `folder` (e.g., a `folder === "videos"` branch that only allows video mimetypes)? The frontend still sends `folder: "videos"` for this field unchanged, so if there's a per-folder restriction keyed to that name, it needs to also allow images now.

### 2. Accept `.jfif` reliably

`.jfif` is a legacy-but-valid JPEG container. The problem in practice is that different browsers/OS combinations report inconsistent (or missing) `mimetype` values for it — sometimes `image/jpeg`, sometimes `image/pjpeg`, occasionally nothing recognizable at all. **Don't rely on `file.mimetype` alone for this extension.** The robust fix: check the file's **extension** (`.jfif`, `.jpg`, `.jpeg`, `.jpe`) and treat any of those as a JPEG image regardless of what `mimetype` the client reported. If the current filter is mimetype-only, add an extension-based fallback/override specifically for these.

### 3. Set the correct `Content-Type` when storing to Backblaze B2

When uploading a `.jfif` file to B2, make sure the object's `Content-Type` is set to `image/jpeg` (not whatever raw/incorrect mimetype the browser may have reported, and not left blank). This matters for the file to render correctly when the frontend requests it back as an `<img src>`.

### 4. Confirm the returned URL keeps the original extension

The frontend now decides whether to render the background as `<video>` or `<img>` by checking the file extension in the stored URL (regex matching `.jpg/.jpeg/.jfif/.png/.webp/.gif/.avif` → image, anything else → video, same as before). **Please confirm the upload endpoint's response URL preserves the original file extension** (e.g., `.../background-abc123.jfif` or `.../background-abc123.jpg`, not an extension-less key). If the storage key generation strips extensions or renames to something generic, let the frontend know — a different approach (e.g., returning a `mediaType` field alongside the URL) would be needed instead.

## Not in scope

- No changes to the audio-file upload path or any other `folder` value — this is scoped to wherever background-video/image uploads land.
- No schema/field renames — the data field stays `backgroundVideo` on both ends; only what file types are accepted into it changes.
