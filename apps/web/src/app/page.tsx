import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/layout/footer';
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  return null;
}
