'use client';

export default function CreditsPage() {
  return (
    <div className="page-container pb-bottom-nav-safe min-h-screen pt-16">
      <div className="content-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-heading mb-2 text-3xl font-bold">
            Credits & Boosts
          </h1>
          <p className="text-muted">
            Boost your visibility and accelerate your success
          </p>
        </div>

        {/* Current Balance */}
        <div className="card-glass mb-8 p-6 text-center">
          <div className="mb-4 text-4xl">💎</div>
          <h2 className="text-heading mb-2 text-2xl font-bold">
            Current Balance
          </h2>
          <div className="text-accent mb-4 text-4xl font-bold">150 Credits</div>
          <p className="text-muted mb-6">
            Use credits to boost your profile, gigs, or clan visibility
          </p>
          <button className="btn-primary px-8 py-3">
            Purchase More Credits
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Boost Options */}
          <div>
            <h2 className="text-heading mb-6 text-xl font-semibold">
              Boost Your Presence
            </h2>

            <div className="space-y-4">
              {/* Profile Boost */}
              <div className="card-glass p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-lg">
                    <span className="text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-heading mb-2 text-lg font-semibold">
                      Profile Boost
                    </h3>
                    <p className="text-muted mb-4">
                      Increase your profile visibility in search results and
                      recommendations
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">24h</div>
                        <div className="text-muted text-sm">10 credits</div>
                      </div>
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">48h</div>
                        <div className="text-muted text-sm">15 credits</div>
                      </div>
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">7 days</div>
                        <div className="text-muted text-sm">45 credits</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gig Boost */}
              <div className="card-glass p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-lg">
                    <span className="text-xl">💼</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-heading mb-2 text-lg font-semibold">
                      Gig Boost
                    </h3>
                    <p className="text-muted mb-4">
                      Make your gigs stand out in the marketplace with priority
                      placement
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">24h</div>
                        <div className="text-muted text-sm">15 credits</div>
                      </div>
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">48h</div>
                        <div className="text-muted text-sm">25 credits</div>
                      </div>
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">7 days</div>
                        <div className="text-muted text-sm">60 credits</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clan Boost */}
              <div className="card-glass p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-lg">
                    <span className="text-xl">👥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-heading mb-2 text-lg font-semibold">
                      Clan Boost
                    </h3>
                    <p className="text-muted mb-4">
                      Boost your clan's visibility and attract top talent to
                      your team
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">24h</div>
                        <div className="text-muted text-sm">20 credits</div>
                      </div>
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">48h</div>
                        <div className="text-muted text-sm">35 credits</div>
                      </div>
                      <div className="border-brand-border hover:border-brand-primary cursor-pointer rounded-lg border p-3 text-center">
                        <div className="text-heading font-semibold">7 days</div>
                        <div className="text-muted text-sm">80 credits</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Packages & History */}
          <div className="space-y-8">
            {/* Purchase Credits */}
            <div>
              <h2 className="text-heading mb-6 text-xl font-semibold">
                Purchase Credits
              </h2>
              <div className="space-y-4">
                {[
                  { credits: 100, price: 9.99, bonus: 0, popular: false },
                  { credits: 250, price: 19.99, bonus: 25, popular: true },
                  { credits: 500, price: 39.99, bonus: 75, popular: false },
                  { credits: 1000, price: 69.99, bonus: 200, popular: false },
                ].map((package_) => (
                  <div
                    key={package_.credits}
                    className={`
                        card-glass cursor-pointer border p-4 transition-all duration-200
                        ${
                          package_.popular
                            ? 'border-brand-primary bg-brand-light-blue/10'
                            : 'border-brand-border hover:border-brand-primary/50'
                        }
                      `}
                  >
                    {package_.popular && (
                      <div className="mb-2 text-center">
                        <span className="bg-brand-primary rounded-full px-3 py-1 text-sm font-medium text-white">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-heading font-semibold">
                          {package_.credits + package_.bonus} Credits
                        </div>
                        {package_.bonus > 0 && (
                          <div className="text-success text-sm">
                            +{package_.bonus} bonus credits
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-heading text-lg font-bold">
                          ${package_.price}
                        </div>
                        <div className="text-muted text-xs">
                          $
                          {(
                            package_.price /
                            (package_.credits + package_.bonus)
                          ).toFixed(3)}{' '}
                          per credit
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Boosts */}
            <div>
              <h2 className="text-heading mb-6 text-xl font-semibold">
                Active Boosts
              </h2>
              <div className="space-y-3">
                <div className="card-glass p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-brand-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                        <span>👤</span>
                      </div>
                      <div>
                        <div className="text-heading font-medium">
                          Profile Boost
                        </div>
                        <div className="text-muted text-sm">
                          Expires in 18 hours
                        </div>
                      </div>
                    </div>
                    <div className="bg-brand-border h-2 w-16 rounded-full">
                      <div className="bg-brand-primary h-2 w-3/4 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="text-muted py-8 text-center text-sm">
                  No other active boosts
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h2 className="text-heading mb-6 text-xl font-semibold">
                Recent Transactions
              </h2>
              <div className="space-y-3">
                {[
                  {
                    type: 'purchase',
                    amount: 100,
                    description: 'Credit purchase',
                    date: '2 days ago',
                  },
                  {
                    type: 'boost',
                    amount: -15,
                    description: 'Gig boost (24h)',
                    date: '3 days ago',
                  },
                  {
                    type: 'boost',
                    amount: -10,
                    description: 'Profile boost (24h)',
                    date: '5 days ago',
                  },
                ].map((transaction, index) => (
                  <div key={index} className="card-glass p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`
                            flex h-8 w-8 items-center justify-center rounded-lg
                            ${
                              transaction.type === 'purchase'
                                ? 'bg-success/20 text-success'
                                : 'bg-brand-primary/20 text-brand-primary'
                            }
                          `}
                        >
                          <span>
                            {transaction.type === 'purchase' ? '+' : '↗'}
                          </span>
                        </div>
                        <div>
                          <div className="text-heading font-medium">
                            {transaction.description}
                          </div>
                          <div className="text-muted text-sm">
                            {transaction.date}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`
                          font-semibold
                          ${transaction.amount > 0 ? 'text-success' : 'text-body'}
                        `}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount} credits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="card-glass mt-16 p-8 text-center">
          <h2 className="text-heading mb-4 text-2xl font-bold">
            How Credits Work
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: '💰',
                title: 'Purchase Credits',
                description:
                  'Buy credit packages at discounted rates with bonus credits',
              },
              {
                icon: '🚀',
                title: 'Boost Your Content',
                description:
                  'Use credits to boost profiles, gigs, or clans for increased visibility',
              },
              {
                icon: '📈',
                title: 'See Results',
                description:
                  'Get more views, applications, and opportunities with boosted content',
              },
            ].map((step) => (
              <div key={step.title}>
                <div className="mb-3 text-4xl">{step.icon}</div>
                <h3 className="text-heading mb-2 font-semibold">
                  {step.title}
                </h3>
                <p className="text-muted text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
