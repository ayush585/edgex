import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const [bottom,setBottom]=useState(130);
  useEffect(() => {
    const toggleVisibility = () => {
      //show button after scrolling 300px
      const scrolled = window.scrollY > 300;
      setVisible(scrolled);
      //check if user is near the footer section
      const windowHeight = window.innerHeight;
      const documentheight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      //adjust the button position : bottom - 20, bottom - 130 near footer
      const nearFooter = scrollTop + windowHeight > documentheight - 300;
      //set button position
      if (scrolled) {
        setBottom(nearFooter ? 130 : 20);
      } else {
        setBottom(130);
      }
    };
    toggleVisibility()
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed right-6 z-50 p-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ bottom: `${bottom}px` }}
    >
      <FaArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
