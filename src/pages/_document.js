import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <div id="app-splash" aria-hidden="true">
            <img src="/logo.png" alt="" />
          </div>

          <Main />
          <NextScript />

          <style>{`
            #app-splash {
              position: fixed;
              inset: 0;
              z-index: 2147483647;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
              opacity: 1;
              visibility: visible;
              transition: opacity 180ms ease, visibility 180ms ease;
            }

            #app-splash img {
              width: 112px;
              height: 112px;
              object-fit: contain;
            }

            #app-splash.is-hidden {
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
            }

            @media (prefers-reduced-motion: reduce) {
              #app-splash {
                transition: none;
              }
            }
          `}</style>
        </body>
      </Html>
    );
  }
}
