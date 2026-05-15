'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  useEffect(() => { router.replace(`/projects/${id}/documents`); }, [id, router]);
  return null;
}
