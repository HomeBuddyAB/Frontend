import React from 'react';
import { gsap } from 'gsap';

interface MenuItemProps {
  link: string;
  text: string;
  image: string;
  price?: string;
}

interface FlowingMenuProps {
  items?: MenuItemProps[];
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({ items = [] }) => {
  return (
    <div className="w-full h-full overflow-hidden">
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem key={idx} {...item} />
        ))}
      </nav>
    </div>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ link, text, image, price }) => {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);
  const marqueeContentRef = React.useRef<HTMLDivElement>(null);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  // 1. Setup the Infinite Loop
  React.useLayoutEffect(() => {
    if (!marqueeContentRef.current) return;

    const tl = gsap.to(marqueeContentRef.current, {
      xPercent: -50, // Moves exactly half the total width (the length of one set)
      repeat: -1,
      duration: 15,
      ease: "linear",
    });

    return () => {
      tl.kill();
    };
  }, []);

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ): 'top' | 'bottom' => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist =
      Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }).to(
      marqueeInnerRef.current,
      {
        y: edge === 'top' ? '101%' : '-101%',
      }
    );
  };

  // 2. Create the content block (One set of items)
  // Using shrink-0 to prevent flex compression
  const contentBlock = React.useMemo(() => {
    return Array.from({ length: 4 }).map((_, idx) => (
      <React.Fragment key={idx}>
        <div className='flex flex-col gap-4'>
          <span className="text-[#060010] uppercase font-normal text-3xl leading-[1.2] whitespace-nowrap shrink-0">
            {text}
          </span>
          <p className="text-[#060010] uppercase font-semibold text-2xl leading-[1.2] whitespace-nowrap shrink-0">
            {price}
          </p>
        </div>
        <div
          className="w-[200px] h-[10vh] rounded-[50px] bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${image})` }}
        />
      </React.Fragment >
    ));
  }, [text, image]);

  return (
    <div
      className="flex-1 relative overflow-hidden text-center shadow-[0_-8px_0_0_#171010]"
      ref={itemRef}
    >
      <a
        className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-white text-[4vh] hover:text-[#060010] focus:text-white focus-visible:text-[#060010]"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </a>

      {/* Marquee Curtain */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none bg-white translate-y-[101%]"
        ref={marqueeRef}
      >
        <div className="h-full w-full" ref={marqueeInnerRef}>
          {/* 3. The Fix: 
              - 'w-fit' allows it to grow as wide as needed (no overlapping).
              - 'flex-nowrap' prevents wrapping to new lines.
              - 'gap' handles the spacing cleanly between ALL items (including the loop point).
           */}
          <div
            ref={marqueeContentRef}
            className="flex items-center h-full w-fit will-change-transform flex-nowrap gap-[3vw] px-[1.5vw]"
          >
            {/* Set 1 */}
            {contentBlock}
            {/* Set 2 (Duplicate for seamless loop) */}
            {contentBlock}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowingMenu;