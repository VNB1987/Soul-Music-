import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

PLAYLIST_ID = "PLedJ9SZ73vniuUjEsj5oPpog0bMWxUbQG"
API_KEY = os.environ["YOUTUBE_API_KEY"]
OUT = "dj-soul/catalog-dj-soul.json"


def get_json(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


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
    catalog = {
        "ready": True,
        "playlistId": PLAYLIST_ID,
        "count": len(items),
        "fetchedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "items": items,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Wrote {len(items)} songs to {OUT}")


if __name__ == "__main__":
    main()
