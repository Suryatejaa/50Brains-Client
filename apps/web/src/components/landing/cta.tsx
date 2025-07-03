export function CTA() {
  return (
    <section className="from-primary-600 to-primary-700 bg-gradient-to-r py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          Ready to Transform Your Creative Journey?
        </h2>
        <p className="text-primary-100 mx-auto mb-8 max-w-2xl text-xl">
          Join thousands of creators and brands who are already building their
          success on 50BraIns.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button className="btn-outline-white">Start as Creator</button>
          <button className="btn-outline-white">I'm a Brand</button>
        </div>
        <p className="text-primary-200 mt-6 text-sm">
          Free to start • No credit card required • Join in 30 seconds
        </p>
      </div>
    </section>
  );
}
