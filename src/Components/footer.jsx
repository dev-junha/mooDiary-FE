// src/components/Footer.jsx
import React from 'react';

function Footer() {
  const LinkItem = ({ href = "#", text }) => (
    <li>
      <a href={href} className="text-white text-xs font-normal hover:opacity-80 whitespace-nowrap">
        {text}
      </a>
    </li>
  );

  const Column = ({ title, links }) => (
    <div className="footer-column flex flex-col">
      <h4 className="font-normal text-sm mb-5 whitespace-nowrap">{title}</h4>
      <ul className="footer-list list-none p-0 m-0 flex flex-col gap-4">
        {links.map((link) => (
          <LinkItem key={link} text={link} />
        ))}
      </ul>
    </div>
  );

  return (
    // style.css의 .footer 스타일
    <footer className="relative w-full h-[373px] bg-button-primary-bg text-white py-10 px-11 md:px-22 box-border flex justify-center items-center font-default shrink-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-3xl text-center md:text-left">
        <Column title="Product" links={["Recents", "Bookmark", "Write", "Edit", "Today's emotion", "Recommendation"]} />
        <Column title="Information" links={["Profile", "Developers", "Information"]} />
        <Column title="Company" links={["Moodiary"]} />
        <Column title="Subscribe" links={["more details"]} />
      </div>
    </footer>
  );
}

export default Footer;