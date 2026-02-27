'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IntakeSurvey from './components/IntakeSurvey';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const profile = localStorage.getItem('fitcoach_profile');
    if (profile) {
      router.replace('/dashboard');
    }
  }, [router]);

  return <IntakeSurvey />;
}
