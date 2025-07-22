export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Create Your Profile',
      description:
        'Sign up and build your professional profile showcasing your skills and portfolio.',
    },
    {
      number: 2,
      title: 'Find Opportunities',
      description:
        'Browse the marketplace for gigs, join clans, or post your own projects.',
    },
    {
      number: 3,
      title: 'Collaborate & Deliver',
      description:
        'Work with brands and creators to deliver amazing projects and build your reputation.',
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Get started in just three simple steps and join thousands of
            creators already succeeding on our platform.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary-600 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
