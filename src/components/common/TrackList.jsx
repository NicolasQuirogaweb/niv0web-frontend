import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AudioPlayer } from "./AudioPlayer";
import { downloadFile } from "../../utils/download";
import "./AudioPlayer.css";

// Lista de pistas con reproductor y descarga. La usan las playlists de beats,
// de loops y los sample packs: solo cambia de dónde vienen los items.
export const TrackList = ({ tracks, fallbackName = "track", showArtist = false }) => {
  const { t } = useTranslation();
  const [playingSrc, setPlayingSrc] = useState(null);
  const [failedId, setFailedId] = useState(null);

  const handleDownload = async (track) => {
    setFailedId(null);
    try {
      await downloadFile(track.audioFile, `${track.title || fallbackName}.mp3`);
    } catch {
      setFailedId(track._id);
    }
  };

  return (
    <div className="beat-list">
      {tracks.map((track, i) => (
        <div key={track._id} className="beat-card">
          <div className="beat-card-left">
            <span className="beat-number">{i + 1}</span>
            <div className="beat-card-info">
              <p className="beat-title">{track.title}</p>
              {showArtist && track.artist && <p className="beat-artist">{track.artist}</p>}
              {failedId === track._id && (
                <p role="alert" className="beat-artist" style={{ color: "#ef9a9a" }}>
                  {t("playlist.downloadError")}
                </p>
              )}
            </div>
          </div>
          {track.audioFile && (
            <div className="beat-card-right">
              <AudioPlayer src={track.audioFile} onPlay={setPlayingSrc} playingId={playingSrc} />
              <button
                type="button"
                onClick={() => handleDownload(track)}
                className="btn-download"
                aria-label={`${t("playlist.download")} ${track.title}`}
              >
                <img src="/images/icons/download-solid.svg" alt="" className="download-icon" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
