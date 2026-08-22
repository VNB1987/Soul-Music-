import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

PLAYLIST_ID = "PLedJ9SZ73vniuUjEsj5oPpog0bMWxUbQG"
API_KEY = os.environ["YOUTUBE_API_KEY"]
BASE_DIR = Path("dj-soul")
OUT = BASE_DIR / "catalog-dj-soul.json"
INDEX_OUT = BASE_DIR / "catalog-index.jsonl"
META_OUT = BASE_DIR / "catalog-meta.json"
CHUNKS_DIR = BASE_DIR / "chunks"
POSITIONS_DIR = BASE_DIR / "positions"
CHUNK_SIZE = 50


def get_json(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))


def main():
    items = []
    page_token = None

    while True:
        params = {
            "part": "snippet,contentDetails,status",
            "playlistId": PLAYLIST_ID,
            "maxResults": 50,
            "key": API_KEY,
        }
        if page_token:
            params["pageToken"] = page_token

        url = "https://www.googleapis.com/youtube/v3/playlistItems?" + urllib.parse.urlencode(params)
        payload = get_json(url)

        for row in payload.get("items", []):
            snippet = row.get("snippet", {})
            content = row.get("contentDetails", {})
            status = row.get("status", {})
            resource = snippet.get("resourceId", {})
            video_id = resource.get("videoId") or content.get("videoId")
            thumbs = snippet.get("thumbnails", {})
            thumb = None
            for key in ("maxres", "standard", "high", "medium", "default"):
                if key in thumbs and thumbs[key].get("url"):
                    thumb = thumbs[key]["url"]
                    break

            items.append({
                "playlistItemId": row.get("id"),
                "videoId": video_id,
                "title": snippet.get("title", ""),
                "description": snippet.get("description", ""),
                "position": snippet.get("position"),
                "channelTitle": snippet.get("videoOwnerChannelTitle") or snippet.get("channelTitle"),
                "channelId": snippet.get("videoOwnerChannelId") or snippet.get("channelId"),
                "publishedAt": snippet.get("publishedAt"),
                "privacyStatus": status.get("privacyStatus"),
                "thumbnail": thumb,
                "url": f"https://www.youtube.com/watch?v={video_id}" if video_id else None,
            })

        page_token = payload.get("nextPageToken")
        if not page_token:
            break

    items.sort(key=lambda x: (x["position"] is None, x["position"] if x["position"] is not None else 10**9))
    fetched_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    catalog = {
        "ready": True,
        "playlistId": PLAYLIST_ID,
        "count": len(items),
        "fetchedAt": fetched_at,
        "items": items,
    }

    write_json(OUT, catalog)
    write_json(META_OUT, {
        "ready": True,
        "playlistId": PLAYLIST_ID,
        "count": len(items),
        "fetchedAt": fetched_at,
        "chunkSize": CHUNK_SIZE,
        "chunkCount": (len(items) + CHUNK_SIZE - 1) // CHUNK_SIZE,
        "positionFiles": True,
    })

    with open(INDEX_OUT, "w", encoding="utf-8") as f:
        for item in items:
            f.write(json.dumps(item, ensure_ascii=False, separators=(",", ":")) + "\n")

    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    expected_chunks = set()
    for start in range(0, len(items), CHUNK_SIZE):
        end = min(start + CHUNK_SIZE - 1, len(items) - 1)
        name = f"{start:03d}-{end:03d}.json"
        expected_chunks.add(name)
        write_json(CHUNKS_DIR / name, {
            "playlistId": PLAYLIST_ID,
            "fetchedAt": fetched_at,
            "startPosition": start,
            "endPosition": end,
            "items": items[start:start + CHUNK_SIZE],
        })

    for old_file in CHUNKS_DIR.glob("*.json"):
        if old_file.name not in expected_chunks:
            old_file.unlink()

    POSITIONS_DIR.mkdir(parents=True, exist_ok=True)
    expected_positions = set()
    for item in items:
        position = item.get("position")
        if position is None:
            continue
        name = f"{position:03d}.json"
        expected_positions.add(name)
        write_json(POSITIONS_DIR / name, {
            "playlistId": PLAYLIST_ID,
            "fetchedAt": fetched_at,
            "item": item,
        })

    for old_file in POSITIONS_DIR.glob("*.json"):
        if old_file.name not in expected_positions:
            old_file.unlink()

    print(
        f"Wrote {len(items)} songs to {OUT}, {INDEX_OUT}, "
        f"{len(expected_chunks)} chunks and {len(expected_positions)} position files"
    )


if __name__ == "__main__":
    main()
