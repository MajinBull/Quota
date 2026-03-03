import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  /**
   * Page type for SEO (reserved for future use)
   * - 'landing': Landing page
   * - 'app': Application page
   */
  page?: 'landing' | 'app';
}

export function SEO({ page: _page = 'landing' }: SEOProps) {
  const { t, i18n } = useTranslation('seo');

  const currentLang = i18n.language;
  const siteUrl = 'https://quota.finance';
  const defaultImage = `${siteUrl}/logo-quota.png`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={currentLang} />
      <title>{t('seo:meta.title')}</title>
      <meta name="title" content={t('seo:meta.title')} />
      <meta name="description" content={t('seo:meta.description')} />
      <meta name="keywords" content={t('seo:meta.keywords')} />
      <meta name="author" content={t('seo:meta.author')} />
      <meta name="language" content={t('seo:meta.language')} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={t('seo:og.title')} />
      <meta property="og:description" content={t('seo:og.description')} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:site_name" content={t('seo:og.siteName')} />
      <meta property="og:locale" content={t('seo:og.locale')} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={t('seo:twitter.title')} />
      <meta property="twitter:description" content={t('seo:twitter.description')} />
      <meta property="twitter:image" content={defaultImage} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="canonical" href={siteUrl} />

      {/* Alternate language versions */}
      <link rel="alternate" hrefLang="it" href={`${siteUrl}?lang=it`} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />
    </Helmet>
  );
}
