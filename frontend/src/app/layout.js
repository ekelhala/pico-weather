
export const metadata = {
  title: "pico-weather Client",
  description: "See real-time data straight from your Pico weather station!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
