import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Fin del mes "AAAA-MM": hasta ahí se anuncia un disco que todavía no tiene día.
const endOfMonth = (month) => {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m, 1);
};

const useNow = (enabled) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => setNow(Date.now()), MINUTE);
    return () => clearInterval(id);
  }, [enabled]);
  return now;
};

/**
 * Aviso del próximo disco (ADR 0009). Los datos están en src/content/about.js y se
 * completan de a poco: con solo el mes dice "sale en noviembre"; con el día suma
 * la fecha y una cuenta regresiva; con tapa y link de pre-save los muestra. Cuando
 * sale, el aviso desaparece y el disco aparece solo en la discografía.
 */
export const UpcomingRelease = ({ release }) => {
  const { t, i18n } = useTranslation();
  const date = release?.releaseDate ? new Date(release.releaseDate) : null;
  const now = useNow(Boolean(date));

  if (!release) return null;
  const until = date ?? endOfMonth(release.month);
  if (now >= until.getTime()) return null;

  const [year, month] = release.month.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat(i18n.language, { month: "long" }).format(new Date(year, month - 1, 15));
  const left = date ? date.getTime() - now : 0;
  const parts = [
    [Math.floor(left / DAY), "d"],
    [Math.floor((left % DAY) / HOUR), "h"],
    [Math.floor((left % HOUR) / MINUTE), "m"],
  ];

  return (
    <section className="upcoming" aria-label={t("about.upcoming.kicker")}>
      <div className="upcoming-art" aria-hidden={!release.coverUrl}>
        {release.coverUrl ? (
          <img src={release.coverUrl} alt={release.title} />
        ) : (
          <span className="upcoming-shadow" />
        )}
        <span className="upcoming-disc" aria-hidden="true" />
      </div>
      <div className="upcoming-info">
        <p className="upcoming-kicker">{t("about.upcoming.kicker")}</p>
        <h2 className="upcoming-title">{release.title}</h2>
        <p className="upcoming-when">
          {date
            ? t("about.upcoming.onDate", {
                date: new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "long" }).format(date),
              })
            : t("about.upcoming.inMonth", { month: monthName })}
        </p>
        {date && (
          <p className="upcoming-countdown" role="timer" aria-live="off">
            {parts.map(([value, unit]) => (
              <span key={unit}>
                <b>{value}</b> {unit}
              </span>
            ))}
          </p>
        )}
        {release.presaveUrl && (
          <a className="upcoming-presave" href={release.presaveUrl} target="_blank" rel="noopener noreferrer">
            {t("about.upcoming.presave")}
          </a>
        )}
      </div>
    </section>
  );
};
