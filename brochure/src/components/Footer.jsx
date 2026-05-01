'use client';
import React from 'react';
import { IoLogoGooglePlaystore } from "react-icons/io5";
import { FaApple, FaWhatsapp, FaFacebook, FaInstagram, FaPinterest, FaYoutube } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { Container } from '@mui/material';
import { whatsappUrl } from '@/lib/constants';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  
  const socialIcons = [
    { href: "https://www.facebook.com/AnneCreations.HB", icon: <FaFacebook size={22} /> },
    { href: "https://www.instagram.com/annecreations.hb", icon: <FaInstagram size={22} /> },
    { href: "https://in.pinterest.com/Annecreationshb9/", icon: <FaPinterest size={22} /> },
    { href: "https://www.youtube.com/@annecreationHB/", icon: <FaYoutube size={22} /> },
    { href: "https://www.whatsapp.com/channel/0029VaE0dx99Bb60W0dWpv2o", icon: <FaWhatsapp size={22} /> },
  ];

  return (
    <footer className="w-full overflow-hidden mt-20 font-[600] text-[var(--secondary)]">
      <div className="bg-[var(--primary)] py-10 px-4">
        <Container>
          <div className="flex w-full flex-col lg:flex-row flex-wrap justify-between items-center text-[var(--secondary)] gap-8 text-center lg:text-left">
            
            {/* Column 1: Logo & Store Links (Reduced) */}
            <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-start gap-4">
              <img src="/assets/logo.svg" alt="Anne Creations Logo" className="w-[100px] h-auto max-w-full" />
              <p className="text-sm text-white max-w-sm">
                Premium Embroidery Designs for all your needs. Luxury digital collections.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a href="#" className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card-bg)] rounded-md">
                    <FaApple size={24} color="var(--secondary)" />
                    <div className="text-xs">
                      <p className="text-[10px]">Download on the</p>
                      <p className="text-[14px] font-bold">App Store</p>
                    </div>
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.embroidery.annecreations&hl=en-US" target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card-bg)] rounded-md">
                    <IoLogoGooglePlaystore size={24} color="var(--secondary)" />
                    <div className="text-xs">
                      <p className="text-[10px]">Get it on</p>
                      <p className="text-[14px] font-bold">Play Store</p>
                    </div>
                </a>
              </div>
            </div>

            {/* Column 2: Simplified Contact & Follow Us */}
            <div className="w-full lg:w-[45%]">
              <h3 className="font-bold text-lg mb-4 text-[var(--brand-accent)]">{t('footer.contact_us', 'Contact Us')}</h3>
              <ul className="space-y-4 text-md text-white flex flex-col items-center lg:items-start">
                <li className="flex items-center gap-2">
                  <FaWhatsapp size={22} color="var(--brand-accent)" />
                  <a href={whatsappUrl} target="_blank" className="hover:underline font-bold">+91 995191 6767</a>
                </li>
                <li className="flex items-center gap-2">
                  <MdOutlineEmail size={22} color="var(--brand-accent)" /> 
                  <a href="mailto:support@annecreationshb.com" className="hover:underline font-bold">support@annecreationshb.com</a>
                </li>
                <li className="flex gap-4 mt-2">
                  {socialIcons.map((item, index) => (
                    <a key={index} href={item.href} target="_blank" className="hover:opacity-75 transition">
                      {React.cloneElement(item.icon, { color: 'var(--brand-accent)' })}
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-[var(--primary)] py-4 border-t border-[rgba(255,255,255,0.15)]">
        <Container>
          <div className="flex justify-center items-center text-sm text-white/70">
            <span>© 2025 Anne Creations. Digital Brochure Experience.</span>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
