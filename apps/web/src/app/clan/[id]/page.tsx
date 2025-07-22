'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ClanMember {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string;
  role: string;
  joinedAt: string;
  skills: string[];
  reputation: number;
  completedProjects: number;
  isOwner: boolean;
  isAdmin: boolean;
}

interface ClanProject {
  id: string;
  title: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget: number;
  deadline: string;
  membersInvolved: string[];
  completionPercentage: number;
}

interface ClanDetail {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  size: number;
  maxMembers: number;
  isPublic: boolean;
  requirements: string[];
  skills: string[];
  language: string;
  timezone: string;
  createdAt: string;
  owner: ClanMember;
  stats: {
    activeProjects: number;
    completedProjects: number;
    totalEarnings: number;
    averageRating: number;
    successRate: number;
  };
  members: ClanMember[];
  recentProjects: ClanProject[];
  joinRequests?: number;
  canJoin: boolean;
  userMembership?: {
    status: 'member' | 'pending' | 'none';
    role?: string;
  };
}

interface PageProps {
  params: { id: string };
}

export default function ClanDetailPage({ params }: PageProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'projects' | 'requirements'>('overview');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    loadClanDetail();
  }, [params.id]);

  const loadClanDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/clan/${params.id}`);
      
      if (response.success) {
        setClan(response.data as ClanDetail);
      } else {
        setError('Clan not found');
      }
    } catch (error: any) {
      if (error.status === 404) {
        notFound();
      } else {
        setError(error.message || 'Failed to load clan details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClan = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login' as any);
      return;
    }

    try {
      setJoinLoading(true);
      
      const response = await apiClient.post(`/api/clan/${params.id}/join`);
      
      if (response.success) {
        // Refresh clan data to show updated membership
        loadClanDetail();
      } else {
        alert('Failed to join clan. Please try again.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to join clan');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveClan = async () => {
    if (confirm('Are you sure you want to leave this clan?')) {
      try {
        const response = await apiClient.post(`/api/clan/${params.id}/leave`);
        
        if (response.success) {
          loadClanDetail();
        } else {
          alert('Failed to leave clan. Please try again.');
        }
      } catch (error: any) {
        alert(error.message || 'Failed to leave clan');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const getStatusBadge = (status: ClanProject['status']) => {
    const badges = {
      planning: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    
    return `px-2 py-1 rounded text-xs font-medium ${badges[status]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="card-glass p-3">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <div className="card-glass p-3">
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-red-100 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {error || 'Clan not found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The clan you're looking for doesn't exist or has been removed.
                  </p>
                </div>
                
                <Link href="/clans/browse" className="btn-primary">
                  Browse Other Clans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Link href="/clans/browse" className="hover:text-brand-primary">
                Clans
              </Link>
              <span>›</span>
              <span className="text-gray-900">{clan.name}</span>
            </nav>

            {/* Header */}
            <div className="card-glass p-3 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {clan.name}
                    </h1>
                    {!clan.isPublic && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-none text-sm font-medium">
                        Private
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {clan.category}
                    </span>
                    <span>📍 {clan.timezone}</span>
                    <span>🗣️ {clan.language}</span>
                    <span>📅 Created {formatDate(clan.createdAt)}</span>
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-4">
                    {clan.description}
                  </p>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <p className="text-2xl font-bold text-gray-900">{clan.size}/{clan.maxMembers}</p>
                      <p className="text-sm text-gray-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <p className="text-2xl font-bold text-green-600">{formatEarnings(clan.stats.totalEarnings)}</p>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <p className="text-2xl font-bold text-blue-600">{clan.stats.completedProjects}</p>
                      <p className="text-sm text-gray-600">Completed Projects</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <div className="flex justify-center mb-1">
                        {renderStars(clan.stats.averageRating)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {clan.stats.averageRating.toFixed(1)} Rating
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                  {clan.userMembership?.status === 'member' ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-green-600">
                        <span>✓</span>
                        <span className="font-medium">You're a member</span>
                      </div>
                      <button
                        onClick={handleLeaveClan}
                        className="btn-ghost w-full"
                      >
                        Leave Clan
                      </button>
                      {(clan.userMembership.role === 'admin' || clan.owner.id === user?.id) && (
                        <Link href={`/clan/${clan.id}/manage` as any} className="btn-secondary w-full text-center">
                          Manage Clan
                        </Link>
                      )}
                    </div>
                  ) : clan.userMembership?.status === 'pending' ? (
                    <div className="text-center">
                      <div className="flex items-center space-x-2 text-yellow-600 mb-2">
                        <span>⏳</span>
                        <span className="font-medium">Request Pending</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your join request is being reviewed
                      </p>
                    </div>
                  ) : clan.canJoin && clan.size < clan.maxMembers ? (
                    <button
                      onClick={handleJoinClan}
                      disabled={joinLoading}
                      className="btn-primary w-full"
                    >
                      {joinLoading ? 'Joining...' : 'Join Clan'}
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-600 font-medium">Clan Full</p>
                      <p className="text-sm text-gray-600">
                        No spots available
                      </p>
                    </div>
                  )}
                  
                  <button className="btn-ghost w-full">
                    Share Clan
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-8 border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'members', label: `Members (${clan.size})` },
                  { id: 'projects', label: `Projects (${clan.stats.activeProjects})` },
                  { id: 'requirements', label: 'Requirements' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* About */}
                    <div className="card-glass p-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Clan</h3>
                      <p className="text-gray-700 whitespace-pre-line">
                        {clan.longDescription || clan.description}
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="card-glass p-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {clan.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-none text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="card-glass p-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                      {clan.recentProjects.length === 0 ? (
                        <p className="text-gray-600">No recent projects</p>
                      ) : (
                        <div className="space-y-4">
                          {clan.recentProjects.map((project) => (
                            <div key={project.id} className="border border-gray-200 rounded-none p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{project.title}</h4>
                                <span className={getStatusBadge(project.status)}>
                                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Budget:</span> {formatEarnings(project.budget)}
                                </div>
                                <div>
                                  <span className="font-medium">Deadline:</span> {formatDate(project.deadline)}
                                </div>
                                <div>
                                  <span className="font-medium">Progress:</span> {project.completionPercentage}%
                                </div>
                              </div>
                              
                              {project.status === 'active' && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-none h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-none transition-all" 
                                      style={{ width: `${project.completionPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="card-glass p-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Clan Members</h3>
                    <div className="space-y-4">
                      {clan.members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-none">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white font-semibold">
                            {member.profilePicture ? (
                              <img 
                                src={member.profilePicture} 
                                alt="Member" 
                                className="w-12 h-12 rounded-none object-cover"
                              />
                            ) : (
                              (member.firstName || member.displayName || 'U')[0]?.toUpperCase()
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">
                                {member.displayName || 
                                 `${member.firstName || ''} ${member.lastName || ''}`.trim() || 
                                 'Anonymous User'}
                              </h4>
                              {member.isOwner && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                  👑 Owner
                                </span>
                              )}
                              {member.isAdmin && !member.isOwner && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  Admin
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <p className="capitalize">{member.role}</p>
                              <p>Joined {formatDate(member.joinedAt)} • {member.completedProjects} projects completed</p>
                            </div>
                            
                            {member.skills.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {member.skills.slice(0, 3).map((skill) => (
                                  <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                                {member.skills.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    +{member.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              ⭐ {member.reputation.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Reputation</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="card-glass p-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Projects</h3>
                    {clan.recentProjects.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">📋</span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h4>
                        <p className="text-gray-600 mb-4">
                          This clan hasn't started any projects yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clan.recentProjects.map((project) => (
                          <div key={project.id} className="border border-gray-200 rounded-none p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                              <span className={getStatusBadge(project.status)}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                              <div>
                                <span className="text-gray-600">Budget:</span>
                                <div className="font-semibold text-green-600">{formatEarnings(project.budget)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Deadline:</span>
                                <div className="font-medium">{formatDate(project.deadline)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Progress:</span>
                                <div className="font-medium">{project.completionPercentage}%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Team Size:</span>
                                <div className="font-medium">{project.membersInvolved.length} members</div>
                              </div>
                            </div>
                            
                            {project.status === 'active' && (
                              <div className="mb-3">
                                <div className="w-full bg-gray-200 rounded-none h-3">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-none transition-all" 
                                    style={{ width: `${project.completionPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {project.membersInvolved.slice(0, 5).map((memberId, index) => {
                                  const member = clan.members.find(m => m.id === memberId);
                                  return (
                                    <div key={memberId} className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                      {member?.profilePicture ? (
                                        <img 
                                          src={member.profilePicture} 
                                          alt="Member" 
                                          className="w-8 h-8 rounded-none object-cover"
                                        />
                                      ) : (
                                        (member?.firstName || 'U')[0]?.toUpperCase()
                                      )}
                                    </div>
                                  );
                                })}
                                {project.membersInvolved.length > 5 && (
                                  <div className="w-8 h-8 bg-gray-400 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                    +{project.membersInvolved.length - 5}
                                  </div>
                                )}
                              </div>
                              
                              <button className="btn-ghost-sm">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="card-glass p-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Joining Requirements</h3>
                    {clan.requirements.length === 0 ? (
                      <p className="text-gray-600">No specific requirements</p>
                    ) : (
                      <ul className="space-y-3">
                        {clan.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Clan Leader */}
                  <div className="card-glass p-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Clan Leader</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-none flex items-center justify-center text-white font-semibold">
                        {clan.owner.profilePicture ? (
                          <img 
                            src={clan.owner.profilePicture} 
                            alt="Owner" 
                            className="w-12 h-12 rounded-none object-cover"
                          />
                        ) : (
                          (clan.owner.firstName || clan.owner.displayName || 'U')[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {clan.owner.displayName || 
                           `${clan.owner.firstName || ''} ${clan.owner.lastName || ''}`.trim() || 
                           'Anonymous User'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ⭐ {clan.owner.reputation.toLocaleString()} reputation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="card-glass p-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-semibold text-green-600">
                          {clan.stats.successRate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Projects</span>
                        <span className="font-semibold text-blue-600">
                          {clan.stats.activeProjects}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg. Rating</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(clan.stats.averageRating)}
                          <span className="text-sm text-gray-600">
                            ({clan.stats.averageRating.toFixed(1)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Join Requests (for admins) */}
                  {clan.userMembership?.status === 'member' && 
                   (clan.owner.id === user?.id || clan.members.find(m => m.id === user?.id)?.isAdmin) && 
                   clan.joinRequests && clan.joinRequests > 0 && (
                    <div className="card-glass p-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h3>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-brand-primary mb-2">
                          {clan.joinRequests}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          Join requests waiting for approval
                        </p>
                        <Link 
                          href={`/clan/${clan.id}/manage/requests` as any} 
                          className="btn-primary w-full text-center"
                        >
                          Review Requests
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
