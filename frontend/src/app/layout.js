
export const metadata = {
  title: "Pico-Weather",
  description: "See real-time data straight from Pico weather station!",
};

import 'bootstrap/dist/css/bootstrap.min.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="dark">
      <body >{children}</body>
    </html>
  );
}
