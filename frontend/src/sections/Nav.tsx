import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MagneticButton } from '../components/MagneticButton';

const links = ['Features', 'For Lawyers', 'For Clients'];

export const Nav = () => {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 120], [0, 1]);
  const borderColor = useTransform(borderOpacity, (opacity) => `rgba(201, 168, 76, ${opacity * 0.18})`);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => setScrolled(latest > 20));
  }, [scrollY]);

  return (
    <motion.header
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-obsidian/70 backdrop-blur-xl' : 'bg-transparent'}`}
      style={{ borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: borderColor }}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main navigation">
        <a href="#home" className="font-display text-2xl font-semibold tracking-wide text-parchment" aria-label="LexLens home">
          LexLens<span className="text-gold">.</span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-muted transition-colors hover:text-parchment"
            >
              {link}
            </a>
          ))}
          <MagneticButton href="/analyze" variant="ghost" className="min-h-10 px-4 py-2 text-xs">
            Analyze a Contract
          </MagneticButton>
        </div>

        <a href="/analyze" className="border border-gold/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gold lg:hidden">
          Analyze
        </a>
      </nav>
    </motion.header>
  );
};
