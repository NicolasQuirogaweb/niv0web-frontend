import { useState, useEffect } from "react";

export const useResponsiveWidth = (small = 200, large = 400, breakpoint = 600) => {
  const [width, setWidth] = useState(
    window.innerWidth < breakpoint ? small : large
  );

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth < breakpoint ? small : large);
    };
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [small, large, breakpoint]);

  return width;
};
