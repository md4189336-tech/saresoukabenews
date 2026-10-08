/**
 * Réseaux sociaux officiels de Saré Soukabé Info / Saré Soukabé TV.
 * Source unique des URLs : ne jamais recopier une URL ailleurs dans le code.
 */

export type SocialNetwork = {
  key: "facebook" | "youtube";
  name: string;
  handle: string;
  url: string;
  description: string;
};

export const SOCIAL_LINKS: SocialNetwork[] = [
  {
    key: "facebook",
    name: "Facebook",
    handle: "Saré Soukabé Info",
    url: "https://www.facebook.com/share/19hY4N8poL/",
    description:
      "Les actualités de Kolda, les photos et les annonces du Fouladou au fil de la journée.",
  },
  {
    key: "youtube",
    name: "YouTube",
    handle: "@saresoukabetv",
    url: "https://youtube.com/@saresoukabetv?si=xWvSStDMbjpTXKxj",
    description:
      "Les reportages, interviews et vidéos de Saré Soukabé TV, à voir et à revoir.",
  },
];
