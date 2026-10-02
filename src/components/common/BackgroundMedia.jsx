const IMAGE_EXTENSION = /\.(jpe?g|jfif|png|webp|gif|avif)(\?|$)/i;

export const BackgroundMedia = ({ src }) => {
  if (!src) return <div className="background-fallback" />;

  if (IMAGE_EXTENSION.test(src)) {
    return <img src={src} alt="" className="background-video" />;
  }

  return (
    <video className="background-video" autoPlay loop muted playsInline>
      <source src={src} type="video/mp4" />
    </video>
  );
};
