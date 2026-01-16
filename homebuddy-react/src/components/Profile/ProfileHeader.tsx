import SplitText from "../SplitText";
import AnimatedContent from "../AnimatedContent";

const ProfileHeader = () => (
  <div className="max-w-4xl">
    <SplitText
      text="MY PROFILE"
      className="text-4xl md:text-6xl lg:text-8xl font-bold text-white mb-6 md:mb-8 leading-[0.9] tracking-tighter"
      delay={100}
      duration={0.6}
      ease="power3.out"
      splitType="chars"
      from={{ opacity: 0, y: 50 }}
      to={{ opacity: 1, y: 0 }}
    />
    <AnimatedContent delay={0.4} distance={30}>
      <div className="h-1 w-16 md:w-24 bg-[#8B4513] mb-6 md:mb-8"></div>
      <p className="text-base md:text-xl text-gray-300 max-w-lg leading-relaxed">
        Manage your account, view order history, and make changes to
        your credentials.
      </p>
    </AnimatedContent>
  </div>
);

export default ProfileHeader;
