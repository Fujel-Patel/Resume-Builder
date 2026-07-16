"use client"

type ProfileImageProps = {
  photoUrl?: string
  fullName: string
  size?: number
  borderRadius?: number | string
  bgColor?: string
  textColor?: string
  fontSize?: number
}

function getInitials(name: string): string {
  return (name || "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function ProfileImage({
  photoUrl, fullName, size = 64, borderRadius = "50%", bgColor = "#6B7280", textColor = "#ffffff", fontSize = 22,
}: ProfileImageProps) {
  return (
    <div style={{ width: size, height: size, borderRadius, backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {photoUrl ? (
        <img src={photoUrl} alt={fullName || "Profile"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ color: textColor, fontSize, fontWeight: 600, fontFamily: "Inter, sans-serif", lineHeight: 1 }}>{getInitials(fullName)}</span>
      )}
    </div>
  )
}
