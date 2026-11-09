import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { PAGE_BACKGROUNDS } from "../../content/backgrounds";

// Imagen que acompaña un link compartido (WhatsApp, Instagram, X): la foto del home.
export const SHARE_IMAGE = PAGE_BACKGROUNDS.homeLogued.poster;

export const SEO = ({ title, description }) => {
  const { t } = useTranslation();
  const siteName = t("seo.siteName");
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || t("seo.fallbackDesc")} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || t("seo.fallbackDesc")} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={SHARE_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={SHARE_IMAGE} />
    </Helmet>
  );
};
