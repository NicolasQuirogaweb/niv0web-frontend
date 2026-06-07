export const Spinner = ({ size = 20 }) => (
  <span
    style={{
      display: "inline-block",
      width: size, height: size,
      border: "2px solid #333",
      borderTopColor: "#7c6ff0",
      borderRadius: "50%",
      animation: "spinnerRotate 0.6s linear infinite",
      verticalAlign: "middle",
    }}
  />
);

export const Skeleton = ({ width = "100%", height = 20, mb = 8 }) => (
  <div
    style={{
      width, height, borderRadius: 4,
      background: "linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)",
      backgroundSize: "200% 100%",
      animation: "skeletonShimmer 1.5s ease-in-out infinite",
      marginBottom: mb,
    }}
  />
);

export const SkeletonCard = () => (
  <div style={{ background: "#111", border: "1px solid #222", borderRadius: 6, padding: 14, marginBottom: 12 }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Skeleton width={60} height={60} mb={0} />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height={16} mb={6} />
        <Skeleton width="90%" height={12} mb={4} />
        <Skeleton width="30%" height={12} />
      </div>
    </div>
  </div>
);

export const SkeletonLine = () => (
  <div style={{ background: "#111", border: "1px solid #222", borderRadius: 6, padding: 12, marginBottom: 8 }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Skeleton width={36} height={36} mb={0} borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="40%" height={14} mb={4} />
        <Skeleton width="25%" height={12} />
      </div>
    </div>
  </div>
);

export const SpinnerStyles = () => (
  <style>{`
    @keyframes spinnerRotate { to { transform: rotate(360deg); } }
    @keyframes skeletonShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `}</style>
);
