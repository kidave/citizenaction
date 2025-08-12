import { useEffect, useState } from 'react';

export default function useWardInfo(wardId) {
  const [wardInfo, setWardInfo] = useState({
    wardName: '',
    convenor: null,
    coConvenor: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/ward/${wardId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setWardInfo({
          wardName: data.wardName || '',
          convenor: data.convenor || null,
          coConvenor: data.coConvenor || null,
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [wardId]);

  return { wardInfo, loading, error };
}