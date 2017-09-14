---
title: Just hack'n
description: Nothing to see here
template: landing.html
head:
    title: Hi
    styles:
      -
        href: style.css
footer:
  companyName: "Copyleft"
logo:
  href: "index.html"
  url: "img/logo.svg"
nav:
  items:
    -
      title: "Home"
      href: "index.html"
    -
      title: "About"
      href: "about.html"
      isActive: true
---

# {{title}} 

And this is the body of the content with the description of 

{{description}} 

inserted by bundlebars and also a partial of 

{{inc apart}}

inserted.
