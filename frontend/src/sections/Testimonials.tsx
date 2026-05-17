import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: 'LexLens turns first-pass contract review into a fifteen-minute exercise. I still make the legal call, but the risk map saves hours before I even open my markup.',
    name: 'Ananya Krishnan, Corporate Lawyer',
  },
  {
    quote: 'I finally understood my investor agreement before sending it to counsel. The plain-English notes helped me ask sharper questions and negotiate with confidence.',
    name: 'Rohan Mehta, Startup Founder',
  },
  {
    quote: 'We review employment contracts at scale. LexLens helps our HR team spot unusual clauses before they reach approval and keeps our process consistent.',
    name: 'Priya Sharma, HR Manager',
  },
];

export const Testimonials = () => {
  return (
    <section className="section-shell bg-obsidian">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="will-change-transform"
        >
          <h2 className="font-display text-5xl font-semibold tracking-[-0.03em] text-parchment md:text-7xl">
            Entered Into Evidence.
          </h2>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-5 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {testimonials.map((item, index) => (
            <motion.figure
              key={item.name}
              className="h-full border border-parchment/10 bg-coal/70 p-7 will-change-transform"
              variants={{
                hidden: { opacity: 0, x: 120 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
                },
              }}
            >
                <motion.div
                  className="font-display text-7xl leading-none text-gold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18, delay: index * 0.2 + 0.12 }}
                >
                  “
                </motion.div>
                <blockquote className="mt-2 text-lg leading-8 text-parchment/88">{item.quote}</blockquote>
                <figcaption className="mt-8 font-display text-xl italic text-gold">{item.name}</figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
