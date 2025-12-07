import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next"

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      
      {/* 2. Add the component here at the bottom */}
      <Analytics />
    </>
  );
}