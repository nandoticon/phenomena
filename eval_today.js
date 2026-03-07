const fs = require('fs');

const todayContent = fs.readFileSync('src/components/views/TodayView.tsx', 'utf8');
if (!todayContent.includes('import React, { useState, useEffect }')) {
  let newContent = todayContent.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';\n\nfunction MobileAccordion({ title, defaultOpen = false, children }: any) {\n  const [isOpen, setIsOpen] = useState(defaultOpen);\n  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : false);\n\n  useEffect(() => {\n    const handleResize = () => setIsMobile(window.innerWidth <= 900);\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, []);\n\n  if (!isMobile) return <div className=\"accordion-desktop-contents\">{children}</div>;\n\n  return (\n    <div className={`mobile-accordion ${isOpen ? 'open' : ''}`}>\n      <button className=\"accordion-header card\" onClick={() => setIsOpen(!isOpen)}>\n        <h3>{title}</h3>\n        <span className=\"chevron\">{isOpen ? '—' : '+'}</span>\n      </button>\n      {isOpen && <div className=\"accordion-body\">{children}</div>}\n    </div>\n  );\n}");

  fs.writeFileSync('src/components/views/TodayView.tmp.tsx', newContent);
}

