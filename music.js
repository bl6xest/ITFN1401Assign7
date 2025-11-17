 const lastfmKey = "28b7f17111c95632922f4503507306ff";
const username = "bl6xest";

async function getLastFMNowPlaying() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${lastfmKey}&format=json&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    const container = document.getElementById("lastfm-tracks");
    if (!container) return;

    container.innerHTML = ""; // clear old content

    if (!data.recenttracks || !data.recenttracks.track || data.recenttracks.track.length === 0) {
        container.innerHTML = "<p>No track found</p>";
        return;
    }

    const track = data.recenttracks.track[0];
    const isNowPlaying = track["@attr"] && track["@attr"].nowplaying === "true";
    const trackName = track.name;
    const artistName = track.artist["#text"];
    const albumName = track.album["#text"];
    const coverArt = track.image && track.image.length ? track.image[track.image.length-1]["#text"] : "";

    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
            ${coverArt ? `<img src="${coverArt}" width="80" style="border-radius:10px;">` : ""}
            <div>
                <p><strong>${trackName}</strong> by ${artistName}</p>
                <p><em>${albumName}</em> ${isNowPlaying ? "🎵 Now Playing" : ""}</p>
            </div>
        </div>
    `;
}

// Run immediately and refresh every 15 seconds
getLastFMNowPlaying();
setInterval(getLastFMNowPlaying, 15000);
