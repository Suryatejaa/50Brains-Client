'use client';

import Link from 'next/link';
import { useState } from 'react';

const teamMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Founder & CEO',
    bio: 'Former Google executive with 10+ years in creator economy and marketplace platforms.',
    image: '/team/alex.jpg',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    twitter: 'https://twitter.com/alexjohnson'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'CTO & Co-founder',
    bio: 'Ex-Meta engineer specializing in scalable platforms and AI-driven matching systems.',
    image: '/team/sarah.jpg',
    linkedin: 'https://linkedin.com/in/sarahchen',
    github: 'https://github.com/sarahchen'
  },
  {
    id: 3,
    name: 'Marcus Williams',
    role: 'Head of Creator Relations',
    bio: 'Former YouTube partner manager with deep connections in the creator community.',
    image: '/team/marcus.jpg',
    linkedin: 'https://linkedin.com/in/marcuswilliams',
    instagram: 'https://instagram.com/marcuswilliams'
  },
  {
    id: 4,
    name: 'Emma Davis',
    role: 'VP of Product',
    bio: 'Product strategy expert from Fiverr and Upwork, focused on marketplace optimization.',
    image: '/team/emma.jpg',
    linkedin: 'https://linkedin.com/in/emmadavis'
  }
];

const milestones = [
  {
    year: '2023',
    title: 'Company Founded',
    description: 'Started with a vision to revolutionize the creator economy',
    icon: '🚀'
  },
  {
    year: '2023',
    title: 'Beta Launch',
    description: 'Launched beta platform with 100+ creators and brands',
    icon: '🎯'
  },
  {
    year: '2024',
    title: 'Series A Funding',
    description: 'Raised $5M to scale platform and expand team',
    icon: '💰'
  },
  {
    year: '2024',
    title: '10K+ Users',
    description: 'Reached 10,000+ active users across all categories',
    icon: '👥'
  },
  {
    year: '2025',
    title: 'Global Expansion',
    description: 'Expanding to international markets and new creator categories',
    icon: '🌍'
  }
];

const values = [
  {
    title: 'Creator First',
    description: 'Everything we build puts creators and their success at the center.',
    icon: '🎨'
  },
  {
    title: 'Transparency',
    description: 'Open communication, fair pricing, and honest business practices.',
    icon: '🔍'
  },
  {
    title: 'Innovation',
    description: 'Constantly pushing boundaries to improve the creator experience.',
    icon: '💡'
  },
  {
    title: 'Community',
    description: 'Building lasting relationships and fostering collaboration.',
    icon: '🤝'
  },
  {
    title: 'Quality',
    description: 'Maintaining high standards in everything we do.',
    icon: '⭐'
  },
  {
    title: 'Growth',
    description: 'Empowering creators and brands to reach their full potential.',
    icon: '📈'
  }
];

const stats = [
  { label: 'Active Creators', value: '25,000+', icon: '🎨' },
  { label: 'Brands & Companies', value: '5,000+', icon: '🏢' },
  { label: 'Projects Completed', value: '100,000+', icon: '✅' },
  { label: 'Total Earnings', value: '$50M+', icon: '💰' }
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'story' | 'team' | 'values' | 'careers'>('story');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-heading mb-6 text-5xl font-bold">
                About 50BraIns
              </h1>
              <p className="text-muted text-xl max-w-3xl mx-auto leading-relaxed">
                We're building the future of the creator economy by connecting talented creators, 
                influencers, and brands in a transparent, fair, and innovative marketplace.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="card-glass p-3 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              {[
                { key: 'story', label: 'Our Story', icon: '📖' },
                { key: 'team', label: 'Meet the Team', icon: '👥' },
                { key: 'values', label: 'Our Values', icon: '💎' },
                { key: 'careers', label: 'Careers', icon: '🚀' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Sections */}
            {activeTab === 'story' && (
              <div className="space-y-12">
                {/* Mission Statement */}
                <div className="card-glass p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Our Mission
                  </h2>
                  <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
                    To democratize the creator economy by providing a transparent, efficient, and fair platform 
                    where creators can showcase their talents, brands can find perfect matches, and everyone can 
                    thrive in the digital economy.
                  </p>
                </div>

                {/* The Problem */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="card-glass p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      🚫 The Problem We Solve
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Creators struggle to find quality opportunities and fair compensation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Brands waste time and money on ineffective influencer partnerships</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Lack of transparency in pricing and performance metrics</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Complex contract negotiations and payment processes</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card-glass p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      ✅ Our Solution
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>AI-powered matching system for perfect brand-creator fits</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Transparent performance analytics and ROI tracking</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Streamlined project management and communication tools</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Secure payment processing with escrow protection</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Timeline */}
                <div className="card-glass p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                    Our Journey
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
                    <div className="space-y-8">
                      {milestones.map((milestone, index) => (
                        <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                          <div className="flex-1"></div>
                          <div className="relative z-10 w-8 h-8 bg-white border-4 border-blue-500 rounded-none flex items-center justify-center">
                            <span className="text-xs">{milestone.icon}</span>
                          </div>
                          <div className="flex-1 ml-4 md:ml-0">
                            <div className={`card-glass p-4 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg font-bold text-blue-600">{milestone.year}</span>
                                <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                              </div>
                              <p className="text-gray-600 text-sm">{milestone.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    We're a passionate group of entrepreneurs, engineers, and creator economy experts 
                    committed to building the future of digital collaboration.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="card-glass p-3">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white text-2xl font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                          <p className="text-brand-primary font-medium mb-2">{member.role}</p>
                          <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                          
                          <div className="flex space-x-3">
                            {member.linkedin && (
                              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:text-blue-700 transition-colors">
                                💼
                              </a>
                            )}
                            {member.twitter && (
                              <a href={member.twitter} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-400 hover:text-blue-500 transition-colors">
                                🐦
                              </a>
                            )}
                            {member.github && (
                              <a href={member.github} target="_blank" rel="noopener noreferrer"
                                 className="text-gray-700 hover:text-gray-800 transition-colors">
                                💻
                              </a>
                            )}
                            {member.instagram && (
                              <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                                 className="text-pink-600 hover:text-pink-700 transition-colors">
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
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    These values guide everything we do, from product decisions to how we treat our community.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {values.map((value, index) => (
                    <div key={index} className="card-glass p-3 text-center">
                      <div className="text-4xl mb-4">{value.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="card-glass p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Join Our Mission?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Whether you're a creator looking for opportunities or a brand seeking talent, 
                    we'd love to have you as part of our community.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Team</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    We're always looking for passionate individuals who want to help shape the future of the creator economy.
                  </p>
                </div>

                {/* Open Positions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      title: 'Senior Full Stack Developer',
                      department: 'Engineering',
                      location: 'Remote / San Francisco',
                      type: 'Full-time',
                      description: 'Build scalable platform features and optimize performance.'
                    },
                    {
                      title: 'Creator Relations Manager',
                      department: 'Community',
                      location: 'Remote / New York',
                      type: 'Full-time',
                      description: 'Build relationships with top creators and develop partnerships.'
                    },
                    {
                      title: 'Product Marketing Manager',
                      department: 'Marketing',
                      location: 'Remote / Los Angeles',
                      type: 'Full-time',
                      description: 'Drive user acquisition and brand awareness strategies.'
                    },
                    {
                      title: 'Data Scientist',
                      department: 'Data & Analytics',
                      location: 'Remote / San Francisco',
                      type: 'Full-time',
                      description: 'Improve our matching algorithms and user recommendations.'
                    }
                  ].map((job, index) => (
                    <div key={index} className="card-glass p-3">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{job.department}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{job.type}</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">{job.location}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <Link href="/contact" className="btn-primary-sm">
                        Apply Now
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="card-glass p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Work With Us?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏠</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Remote First</h4>
                      <p className="text-gray-600 text-sm">Work from anywhere in the world</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">💰</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Competitive Pay</h4>
                      <p className="text-gray-600 text-sm">Top-tier salaries and equity</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏥</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Great Benefits</h4>
                      <p className="text-gray-600 text-sm">Health, dental, vision coverage</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">📚</div>
                      <h4 className="font-semibold text-gray-900 mb-1">Growth Focused</h4>
                      <p className="text-gray-600 text-sm">Learning budget and conferences</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="text-center mt-16">
              <div className="card-glass p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Questions About 50BraIns?
                </h3>
                <p className="text-gray-600 mb-6">
                  We'd love to hear from you. Reach out with any questions or feedback.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact" className="btn-primary">
                    Contact Us
                  </Link>
                  <Link href={"/help/faq" as any} className="btn-secondary">
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
