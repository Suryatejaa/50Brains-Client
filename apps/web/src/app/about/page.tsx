'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BusinessRoadmap } from '@/components/landing/BusinessRoadmap';
import {
  RocketLaunchIcon,
  MapPinIcon as TargetIcon,
  CurrencyDollarIcon,
  UsersIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
  UserGroupIcon as HandshakeIcon,
  StarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  BookOpenIcon,
  SparklesIcon as GemIcon,
} from '@heroicons/react/24/outline';

const teamMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Founder & CEO',
    bio: 'Former Google executive with 10+ years in creator economy and marketplace platforms.',
    image: '/team/alex.jpg',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    twitter: 'https://twitter.com/alexjohnson',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'CTO & Co-founder',
    bio: 'Ex-Meta engineer specializing in scalable platforms and AI-driven matching systems.',
    image: '/team/sarah.jpg',
    linkedin: 'https://linkedin.com/in/sarahchen',
    github: 'https://github.com/sarahchen',
  },
  {
    id: 3,
    name: 'Marcus Williams',
    role: 'Head of Creator Relations',
    bio: 'Former YouTube partner manager with deep connections in the creator community.',
    image: '/team/marcus.jpg',
    linkedin: 'https://linkedin.com/in/marcuswilliams',
    instagram: 'https://instagram.com/marcuswilliams',
  },
  {
    id: 4,
    name: 'Emma Davis',
    role: 'VP of Product',
    bio: 'Product strategy expert from Fiverr and Upwork, focused on marketplace optimization.',
    image: '/team/emma.jpg',
    linkedin: 'https://linkedin.com/in/emmadavis',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'Company Founded',
    description: 'Started with a vision to revolutionize the creator economy',
    icon: RocketLaunchIcon,
  },
  {
    year: '2023',
    title: 'Beta Launch',
    description: 'Launched beta platform with 100+ creators and brands',
    icon: TargetIcon,
  },
  {
    year: '2024',
    title: 'Series A Funding',
    description: 'Raised $5M to scale platform and expand team',
    icon: CurrencyDollarIcon,
  },
  {
    year: '2024',
    title: '10K+ Users',
    description: 'Reached 10,000+ active users across all categories',
    icon: UsersIcon,
  },
  {
    year: '2025',
    title: 'Global Expansion',
    description:
      'Expanding to international markets and new creator categories',
    icon: GlobeAltIcon,
  },
];

const values = [
  {
    title: 'Creator First',
    description:
      'Everything we build puts creators and their success at the center.',
    icon: PaintBrushIcon,
  },
  {
    title: 'Transparency',
    description:
      'Open communication, fair pricing, and honest business practices.',
    icon: MagnifyingGlassIcon,
  },
  {
    title: 'Innovation',
    description:
      'Constantly pushing boundaries to improve the creator experience.',
    icon: LightBulbIcon,
  },
  {
    title: 'Community',
    description: 'Building lasting relationships and fostering collaboration.',
    icon: HandshakeIcon,
  },
  {
    title: 'Quality',
    description: 'Maintaining high standards in everything we do.',
    icon: StarIcon,
  },
  {
    title: 'Growth',
    description:
      'Empowering creators and brands to reach their full potential.',
    icon: ChartBarIcon,
  },
];

const stats = [
  { label: 'Active Creators', value: '25,000+', icon: PaintBrushIcon },
  { label: 'Brands & Companies', value: '5,000+', icon: BuildingOfficeIcon },
  { label: 'Projects Completed', value: '100,000+', icon: CheckCircleIcon },
  { label: 'Total Earnings', value: '$50M+', icon: CurrencyDollarIcon },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<
    'story' | 'team' | 'values' | 'careers'
  >('story');

  return (
    <div className="font-inter min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Hero Section */}
            <div className="mb-16 text-center">
              <h1 className="text-heading mb-6 text-5xl font-semibold tracking-tight">
                About 50BraIns
              </h1>
              <p className="text-muted mx-auto max-w-3xl text-xl font-normal leading-relaxed">
                We're building the future of the creator economy by connecting
                talented creators, influencers, and brands in a transparent,
                fair, and innovative marketplace.
              </p>
            </div>

            {/* Stats Section */}
            <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="card-glass p-6 text-center">
                    <div className="mb-3 flex justify-center">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mb-2 text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Business Roadmap */}
            <div className="mb-16">
              <BusinessRoadmap />
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8 flex flex-wrap justify-center border-b border-gray-200">
              {[
                { key: 'story', label: 'Our Story', icon: BookOpenIcon },
                { key: 'team', label: 'Meet the Team', icon: UsersIcon },
                { key: 'values', label: 'Our Values', icon: GemIcon },
                { key: 'careers', label: 'Careers', icon: RocketLaunchIcon },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Sections */}
            {activeTab === 'story' && (
              <div className="space-y-12">
                {/* Mission Statement */}
                <div className="card-glass p-8">
                  <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">
                    Our Mission
                  </h2>
                  <p className="mx-auto max-w-4xl text-center text-lg leading-relaxed text-gray-700">
                    To democratize the creator economy by providing a
                    transparent, efficient, and fair platform where creators can
                    showcase their talents, brands can find perfect matches, and
                    everyone can thrive in the digital economy.
                  </p>
                </div>

                {/* The Problem */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="card-glass p-8">
                    <h3 className="mb-4 text-2xl font-bold text-gray-900">
                      🚫 The Problem We Solve
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-red-500">•</span>
                        <span>
                          Creators struggle to find quality opportunities and
                          fair compensation
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-red-500">•</span>
                        <span>
                          Brands waste time and money on ineffective influencer
                          partnerships
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-red-500">•</span>
                        <span>
                          Lack of transparency in pricing and performance
                          metrics
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-red-500">•</span>
                        <span>
                          Complex contract negotiations and payment processes
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="card-glass p-8">
                    <h3 className="mb-4 text-2xl font-bold text-gray-900">
                      ✅ Our Solution
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-green-500">•</span>
                        <span>
                          AI-powered matching system for perfect brand-creator
                          fits
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-green-500">•</span>
                        <span>
                          Transparent performance analytics and ROI tracking
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-green-500">•</span>
                        <span>
                          Streamlined project management and communication tools
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="mt-1 text-green-500">•</span>
                        <span>
                          Secure payment processing with escrow protection
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Timeline */}
                <div className="card-glass p-8">
                  <h3 className="mb-8 text-center text-2xl font-bold text-gray-900">
                    Our Journey
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 h-full w-1 transform bg-gradient-to-b from-blue-500 to-purple-600 md:left-1/2 md:-translate-x-1/2"></div>
                    <div className="space-y-8">
                      {milestones.map((milestone, index) => {
                        const IconComponent = milestone.icon;
                        return (
                          <div
                            key={index}
                            className={`flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                          >
                            <div className="flex-1"></div>
                            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-blue-500 bg-white">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4 flex-1 md:ml-0">
                              <div
                                className={`card-glass p-4 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}
                              >
                                <div className="mb-2 flex items-center space-x-2">
                                  <span className="text-lg font-semibold text-blue-600">
                                    {milestone.year}
                                  </span>
                                  <h4 className="font-semibold text-gray-900">
                                    {milestone.title}
                                  </h4>
                                </div>
                                <p className="text-sm font-normal text-gray-600">
                                  {milestone.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-12">
                <div className="mb-8 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-gray-900">
                    Meet Our Team
                  </h2>
                  <p className="mx-auto max-w-2xl text-gray-600">
                    We're a passionate group of entrepreneurs, engineers, and
                    creator economy experts committed to building the future of
                    digital collaboration.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="card-glass p-3">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-none bg-gradient-to-r from-blue-500 to-purple-600 text-2xl font-bold text-white">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 text-xl font-bold text-gray-900">
                            {member.name}
                          </h3>
                          <p className="text-brand-primary mb-2 font-medium">
                            {member.role}
                          </p>
                          <p className="mb-4 text-sm text-gray-600">
                            {member.bio}
                          </p>

                          <div className="flex space-x-3">
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 transition-colors hover:text-blue-700"
                              >
                                💼
                              </a>
                            )}
                            {member.twitter && (
                              <a
                                href={member.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 transition-colors hover:text-blue-500"
                              >
                                🐦
                              </a>
                            )}
                            {member.github && (
                              <a
                                href={member.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 transition-colors hover:text-gray-800"
                              >
                                💻
                              </a>
                            )}
                            {member.instagram && (
                              <a
                                href={member.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 transition-colors hover:text-pink-700"
                              >
                                📸
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-8">
                <div className="mb-8 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-gray-900">
                    Our Core Values
                  </h2>
                  <p className="mx-auto max-w-2xl text-gray-600">
                    These values guide everything we do, from product decisions
                    to how we treat our community.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {values.map((value, index) => {
                    const IconComponent = value.icon;
                    return (
                      <div key={index} className="card-glass p-6 text-center">
                        <div className="mb-4 flex justify-center">
                          <IconComponent className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-gray-900">
                          {value.title}
                        </h3>
                        <p className="font-normal text-gray-600">
                          {value.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Call to Action */}
                <div className="card-glass p-8 text-center">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">
                    Ready to Join Our Mission?
                  </h3>
                  <p className="mx-auto mb-6 max-w-2xl text-gray-600">
                    Whether you're a creator looking for opportunities or a
                    brand seeking talent, we'd love to have you as part of our
                    community.
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link href="/register" className="btn-primary">
                      Get Started Today
                    </Link>
                    <Link href="/contact" className="btn-secondary">
                      Contact Our Team
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'careers' && (
              <div className="space-y-8">
                <div className="mb-8 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-gray-900">
                    Join Our Team
                  </h2>
                  <p className="mx-auto max-w-2xl text-gray-600">
                    We're always looking for passionate individuals who want to
                    help shape the future of the creator economy.
                  </p>
                </div>

                {/* Open Positions */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    {
                      title: 'Senior Full Stack Developer',
                      department: 'Engineering',
                      location: 'Remote / San Francisco',
                      type: 'Full-time',
                      description:
                        'Build scalable platform features and optimize performance.',
                    },
                    {
                      title: 'Creator Relations Manager',
                      department: 'Community',
                      location: 'Remote / New York',
                      type: 'Full-time',
                      description:
                        'Build relationships with top creators and develop partnerships.',
                    },
                    {
                      title: 'Product Marketing Manager',
                      department: 'Marketing',
                      location: 'Remote / Los Angeles',
                      type: 'Full-time',
                      description:
                        'Drive user acquisition and brand awareness strategies.',
                    },
                    {
                      title: 'Data Scientist',
                      department: 'Data & Analytics',
                      location: 'Remote / San Francisco',
                      type: 'Full-time',
                      description:
                        'Improve our matching algorithms and user recommendations.',
                    },
                  ].map((job, index) => (
                    <div key={index} className="card-glass p-3">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-gray-900">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">
                              {job.department}
                            </span>
                            <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                              {job.type}
                            </span>
                            <span className="rounded bg-purple-100 px-2 py-1 text-purple-700">
                              {job.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mb-4 text-gray-600">{job.description}</p>
                      <Link href="/contact" className="btn-primary-sm">
                        Apply Now
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="card-glass p-8">
                  <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    Why Work With Us?
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center">
                      <div className="mb-2 text-3xl">🏠</div>
                      <h4 className="mb-1 font-semibold text-gray-900">
                        Remote First
                      </h4>
                      <p className="text-sm text-gray-600">
                        Work from anywhere in the world
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 text-3xl">💰</div>
                      <h4 className="mb-1 font-semibold text-gray-900">
                        Competitive Pay
                      </h4>
                      <p className="text-sm text-gray-600">
                        Top-tier salaries and equity
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 text-3xl">🏥</div>
                      <h4 className="mb-1 font-semibold text-gray-900">
                        Great Benefits
                      </h4>
                      <p className="text-sm text-gray-600">
                        Health, dental, vision coverage
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 text-3xl">📚</div>
                      <h4 className="mb-1 font-semibold text-gray-900">
                        Growth Focused
                      </h4>
                      <p className="text-sm text-gray-600">
                        Learning budget and conferences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="mt-16 text-center">
              <div className="card-glass p-8">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Questions About 50BraIns?
                </h3>
                <p className="mb-6 text-gray-600">
                  We'd love to hear from you. Reach out with any questions or
                  feedback.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link href="/contact" className="btn-primary">
                    Contact Us
                  </Link>
                  <Link href={'/help/faq' as any} className="btn-secondary">
                    View FAQ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
