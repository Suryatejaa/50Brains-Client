export function Features() {
  const features = [
    {
      title: 'Creator Marketplace',
      description:
        'Find verified influencers and content creators for your brand campaigns with advanced filtering.',
      icon: '🎨',
      color: 'text-brand-primary',
    },
    {
      title: 'Team Collaboration',
      description:
        'Form professional teams (Clans) for larger projects and shared success with role-based management.',
      icon: '👥',
      color: 'text-success',
    },
    {
      title: 'Reputation System',
      description:
        'Build your professional reputation with our comprehensive scoring and tier system.',
      icon: '⭐',
      color: 'text-warning',
    },
    {
      title: 'Credit System',
      description:
        'Boost your visibility and unlock premium features with our flexible credit system.',
      icon: '💎',
      color: 'text-reputation-diamond',
    },
  ];

  return (
    <section className="page-container">
      <div className="content-container section-spacing">
        <div className="mb-16 text-center">
          <h2 className="text-heading mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted mx-auto max-w-3xl text-xl lg:text-2xl">
            Our glassmorphism-powered platform provides all the tools and
            features you need to thrive in the modern creator economy.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-glass hover:bg-brand-light-blue/10 group p-8 text-center transition-all duration-300"
            >
              {/* 🎯 Feature Icon with Glassmorphism */}
              <div
                className={`mb-6 text-5xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}
              >
                {feature.icon}
              </div>

              {/* 📝 Feature Title */}
              <h3 className="text-heading mb-4 text-xl font-semibold">
                {feature.title}
              </h3>

              {/* 💬 Feature Description */}
              <p className="text-muted text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* ✨ Hover Effect Indicator */}
              <div className="bg-brand-primary mt-6 h-1 w-0 rounded-none transition-all duration-300 group-hover:w-full"></div>
            </div>
          ))}
        </div>

        {/* 🔮 Additional Feature Highlights */}
        <div className="mt-20 grid gap-3 md:grid-cols-3">
          <div className="card-soft p-3 text-center">
            <div className="text-brand-primary mb-2 text-2xl font-bold">
              50K+
            </div>
            <div className="text-muted text-sm">Active Creators</div>
          </div>
          <div className="card-soft p-3 text-center">
            <div className="text-brand-primary mb-2 text-2xl font-bold">
              $10M+
            </div>
            <div className="text-muted text-sm">Creator Earnings</div>
          </div>
          <div className="card-soft p-3 text-center">
            <div className="text-brand-primary mb-2 text-2xl font-bold">
              99.9%
            </div>
            <div className="text-muted text-sm">Platform Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
