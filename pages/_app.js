// pages/_app.js
import "../styles/main.css";
import 'react-phone-input-2/lib/style.css';
import '../styles/components/forum.module.css';
import { ForumProvider } from '../src/context/ForumContext';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <ForumProvider>
      {getLayout(<Component {...pageProps} />)}
    </ForumProvider>
  );
}

export default MyApp;