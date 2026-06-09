import "./globals.css";

export const metadata = {
  title: "G Wedding Planner — Kuwait",
  description:
    "Plan your dream wedding in Kuwait — browse halls, salons, florists, photographers and more, all in one elegant place.",
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%92%90%3C/text%3E%3C/svg%3E",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    // i18n.js updates lang/dir on the client based on the saved language.
    // Fonts are loaded via @import at the top of globals.css.
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
