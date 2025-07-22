export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Content Creator',
      content:
        "50BraIns transformed my freelance career. I've found amazing brand partnerships and built a strong professional network.",
      avatar: 'SJ',
    },
    {
      name: 'Marcus Chen',
      role: 'Brand Manager',
      content:
        'The quality of creators on this platform is outstanding. Our campaign ROI has increased by 300% since we started using 50BraIns.',
      avatar: 'MC',
    },
    {
      name: 'Team Digital',
      role: 'Creative Clan',
      content:
        "As a team, we've been able to take on larger projects and share our success. The clan system is a game-changer.",
      avatar: 'TD',
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Trusted by Creators & Brands
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            See what our community has to say about their experience on
            50BraIns.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card">
              <p className="mb-6 italic text-gray-600">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className="bg-primary-600 mr-4 flex h-12 w-12 items-center justify-center rounded-none font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
