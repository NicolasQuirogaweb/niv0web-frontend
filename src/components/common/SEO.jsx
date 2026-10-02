import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

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
      <meta name="twitter:card" content="summary" />
    </Helmet>
  );
};
