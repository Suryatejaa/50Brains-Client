import { TrendingUp, Building, Users2 } from 'lucide-react';
import { UserRole } from '../../lib/user-api';

// Enhanced role selection options with icons and descriptions
export const AVAILABLE_ROLES = [
  {
    value: UserRole.INFLUENCER,
    label: 'Influencer',
    icon: TrendingUp,
    description: 'Content creator, social media influencer',
    color: 'purple',
  },
  {
    value: UserRole.BRAND,
    label: 'Brand',
    icon: Building,
    description: 'Company, agency, or brand representative',
    color: 'blue',
  },
  {
    value: UserRole.CREW,
    label: 'Crew',
    icon: Users2,
    description: 'Creative professional, freelancer',
    color: 'green',
  },
];

// Content categories for influencers
export const CONTENT_CATEGORIES = [
  'Fashion & Style',
  'Beauty & Skincare',
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Lifestyle',
  'Technology',
  'Gaming',
  'Music & Entertainment',
  'Art & Design',
  'Photography',
  'Business & Finance',
  'Education',
  'Parenting & Family',
  'Home & Decor',
  'Automotive',
  'Sports',
  'Comedy & Humor',
  'News & Politics',
  'Science & Nature',
  'Books & Literature',
];

// Industries for brands
export const INDUSTRIES = [
  'Technology',
  'Fashion & Retail',
  'Food & Beverage',
  'Health & Wellness',
  'Entertainment',
  'Finance',
  'Education',
  'Travel & Tourism',
  'Automotive',
  'Real Estate',
  'Sports',
  'Beauty & Cosmetics',
  'E-commerce',
  'Media & Publishing',
  'Gaming',
  'Sustainability',
  'Healthcare',
  'Consulting',
  'Manufacturing',
  'Non-Profit',
];

// Crew skills categories
export const CREW_SKILLS = [
  'Video Editing',
  'Photography',
  'Graphic Design',
  'Content Writing',
  'Social Media Management',
  'Animation',
  'Web Development',
  'UI/UX Design',
  'Copywriting',
  'SEO',
  'Digital Marketing',
  'Brand Strategy',
  'Project Management',
  'Voice Over',
  'Music Production',
  'Illustration',
  'Motion Graphics',
  '3D Modeling',
  'Sound Design',
  'Live Streaming',
];

// Company types for brands
export const COMPANY_TYPES = [
  'STARTUP',
  'SME',
  'ENTERPRISE',
  'AGENCY',
  'NONPROFIT',
];

// Experience levels
export const EXPERIENCE_LEVELS = ['ENTRY', 'INTERMEDIATE', 'SENIOR', 'EXPERT'];

// Availability options
export const AVAILABILITY_OPTIONS = [
  'FULL_TIME',
  'PART_TIME',
  'FREELANCE',
  'CONTRACT',
];
