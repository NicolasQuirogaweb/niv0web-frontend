import "./SamplePacks.css";

export const PackCover = ({ title, imageUrl }) =>
  imageUrl ? (
    <img className="pack-cover-image" src={imageUrl} alt={title} />
  ) : (
    <div className="pack-cover-generated" aria-hidden="true">
      <span>{title}</span>
    </div>
  );
