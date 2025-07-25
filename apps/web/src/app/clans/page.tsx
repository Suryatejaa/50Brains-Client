'use client';

export default function ClansPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-0">
        <div className="content-container py-1">
          {/* Clans Header */}
          <div className="mb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">Clans</h1>
                <p className="text-muted">
                  Join creative teams and collaborate on amazing projects
                </p>
              </div>
              <button className="btn-primary px-2 py-2">Create Clan</button>
            </div>
          </div>

          {/* My Clans Section */}
          <div className="mb-2">
            <h2 className="text-heading mb-2 text-xl font-semibold">
              My Clans
            </h2>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {/* Active Clan */}
              <div className="card-glass border-brand-primary/30 bg-brand-light-blue/5 border-2 p-2">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-none">
                      <span className="text-xl">🎨</span>
                    </div>
                    <div>
                      <h3 className="text-heading font-semibold">
                        Creative Collective
                      </h3>
                      <p className="text-muted text-sm">Head • 12 members</p>
                    </div>
                  </div>
                  <span className="bg-success/10 text-success rounded-none px-2 py-1 text-xs font-medium">
                    Active
                  </span>
                </div>
                <p className="text-muted mb-4 text-sm">
                  A diverse group of content creators specializing in lifestyle
                  and tech content.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-muted text-xs">
                    <span>🏆 Gold Tier • ⭐ 4.9 rating</span>
                  </div>
                  <button className="btn-secondary px-4 py-2 text-sm">
                    Manage
                  </button>
                </div>
              </div>

              {/* Member Clan */}
              <div className="card-glass p-2">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-brand-light-blue/20 flex h-12 w-12 items-center justify-center rounded-none">
                      <span className="text-xl">📸</span>
                    </div>
                    <div>
                      <h3 className="text-heading font-semibold">
                        Photo Studios Pro
                      </h3>
                      <p className="text-muted text-sm">Member • 8 members</p>
                    </div>
                  </div>
                  <span className="bg-success/10 text-success rounded-none px-2 py-1 text-xs font-medium">
                    Active
                  </span>
                </div>
                <p className="text-muted mb-4 text-sm">
                  Professional photography clan focusing on brand and product
                  shoots.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-muted text-xs">
                    <span>💎 Platinum Tier • ⭐ 5.0 rating</span>
                  </div>
                  <button className="btn-ghost px-4 py-2 text-sm">View</button>
                </div>
              </div>

              {/* Create New Clan Card */}
              <div className="card-glass border-brand-border hover:border-brand-primary/50 hover:bg-brand-light-blue/5 cursor-pointer border-2 border-dashed transition-all duration-200">
                <div className="text-center pb-2">
                  <div className="bg-brand-light-blue/20 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-none">
                    <span className="text-xl">➕</span>
                  </div>
                  <h3 className="text-heading mb-2 font-semibold">
                    Create New Clan
                  </h3>
                  <p className="text-muted mb-2 text-sm">
                    Start your own creative team and collaborate with talented
                    creators
                  </p>
                  <button className="btn-primary px-2 py-2 text-sm">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Discover Clans */}
          <div className="mb-2">
            <div className="mb-2 flex flex-col lg:flex-row md:flex-row gap-1 items-left justify-between">
              <h2 className="text-heading text-xl font-semibold">
                Discover Clans
              </h2>
              <div className="flex flex-col lg:flex-row md:flex-row gap-1 items-left justify-between">
                <input
                  type="text"
                  placeholder="Search clans..."
                  className="input w-full lg:w-64 md:w-64"
                />
                <select className="input w-auto">
                  <option>All Categories</option>
                  <option>Content Creation</option>
                  <option>Video Production</option>
                  <option>Photography</option>
                  <option>Design</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((clan) => (
                <div
                  key={clan}
                  className="card-glass hover:bg-brand-light-blue/5 p-2 transition-all duration-200"
                >
                  <div className="mb-4 flex items-start space-x-4">
                    <div className="from-brand-primary/20 to-brand-light-blue/20 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br">
                      <span className="text-2xl">
                        {['🎬', '🎨', '📱', '🎵', '📸', '✨'][clan - 1]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-heading mb-1 text-lg font-semibold">
                            {
                              [
                                'Video Creators Hub',
                                'Design Collective',
                                'Mobile Content Pro',
                                'Audio Creators',
                                'Photo Masters',
                                'Creative Innovators',
                              ][clan - 1]
                            }
                          </h3>
                          <div className="text-muted flex items-center space-x-4 text-sm">
                            <span>{15 + clan * 3} members</span>
                            <span>⭐ {4.5 + clan * 0.1}</span>
                            <span>
                              {
                                [
                                  'Gold',
                                  'Platinum',
                                  'Silver',
                                  'Gold',
                                  'Diamond',
                                  'Platinum',
                                ][clan - 1]
                              }{' '}
                              Tier
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="bg-success/10 text-success mb-2 rounded-none px-2 py-1 text-xs font-medium">
                            Recruiting
                          </span>
                          <span className="text-muted text-xs">
                            {clan * 2} active gigs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted mb-4 text-sm">
                    A collaborative team of creative professionals specializing
                    in high-quality content creation for brands and social media
                    platforms.
                  </p>

                  {/* Skills */}
                  <div className="mb-2 flex flex-wrap gap-2">
                    {[
                      ['Video Editing', 'Motion Graphics', 'Storytelling'],
                      ['UI Design', 'Branding', 'Illustration'],
                      ['Mobile Apps', 'Social Media', 'TikTok'],
                      ['Podcasting', 'Music Production', 'Sound Design'],
                      ['Photography', 'Retouching', 'Studio Work'],
                      ['Innovation', 'Strategy', 'Creative Direction'],
                    ][clan - 1].map((skill) => (
                      <span
                        key={skill}
                        className="bg-brand-soft border-brand-border text-body rounded-none border px-2 py-1 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((member) => (
                          <div
                            key={member}
                            className="bg-brand-light-blue/20 border-brand-base flex h-8 w-8 items-center justify-center rounded-none border-2"
                          >
                            <span className="text-xs">👤</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-muted text-xs">
                        +{12 + clan} more
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-ghost px-4 py-2 text-sm">
                        View Details
                      </button>
                      <button className="btn-primary px-4 py-2 text-sm">
                        Request to Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clan Benefits */}
          <div className="card-glass p-2 text-center">
            <h2 className="text-heading mb-2 text-2xl font-bold">
              Why Join a Clan?
            </h2>
            <p className="text-muted mx-auto mb-2 max-w-2xl">
              Collaborate with talented creators, share resources, and take on
              bigger projects together
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                {
                  icon: '🤝',
                  title: 'Collaboration',
                  description:
                    'Work together on complex projects and share expertise',
                },
                {
                  icon: '💰',
                  title: 'Higher Earnings',
                  description:
                    'Access to premium gigs and better negotiating power',
                },
                {
                  icon: '🏆',
                  title: 'Reputation Boost',
                  description:
                    'Build credibility through verified team achievements',
                },
              ].map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="mb-3 text-4xl">{benefit.icon}</div>
                  <h3 className="text-heading mb-2 font-semibold">
                    {benefit.title}
                  </h3>
                  <p className="text-muted text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
