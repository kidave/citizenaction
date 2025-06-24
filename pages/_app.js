import "../styles/main.css";
import 'react-phone-input-2/lib/style.css';

function MyApp({ Component, pageProps }) {
  // Optionally allow pages to disable layout
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
