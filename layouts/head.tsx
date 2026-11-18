import React from "react";
import NextHead from "next/head";

import { siteConfig } from "@/config/site";

export const Head = () => {
  return (
    <NextHead>
      <title>{siteConfig.name}</title>
      <meta key="title" content={siteConfig.name} property="og:title" />
      <meta content={siteConfig.description} property="og:description" />
      <meta content={siteConfig.description} name="description" />
      <meta
        key="viewport"
        content="viewport-fit=cover, width=device-width, initial-scale=1"
        name="viewport"
      />
      <link href="/favicon.ico" rel="icon" sizes="32x32" />
      <link href="/icon-32.png" rel="icon" sizes="32x32" type="image/png" />
      <link href="/icon-192.png" rel="icon" sizes="192x192" type="image/png" />
      <link
        href="/apple-touch-icon.png"
        rel="apple-touch-icon"
        sizes="180x180"
      />
      <link href="/site.webmanifest" rel="manifest" />
      <meta content="Vertretungsplan" name="apple-mobile-web-app-title" />
      <meta content="yes" name="mobile-web-app-capable" />
      <meta content="#0a0a0a" name="theme-color" />
    </NextHead>
  );
};
