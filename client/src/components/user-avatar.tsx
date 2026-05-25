interface AvatarUser {
  username: string;
  displayName?: string | null;
  firstName?: string | null;
  avatarUrl?: string | null;
}

const SIZE_MAP = {
  xs:  "w-7 h-7 text-[10px]",
  sm:  "w-9 h-9 text-xs",
  md:  "w-10 h-10 text-sm",
  lg:  "w-16 h-16 text-xl",
  xl:  "w-24 h-24 text-3xl",
} as const;

interface UserAvatarProps {
  user: AvatarUser;
  size?: keyof typeof SIZE_MAP;
  className?: string;
  ring?: boolean;
}

export function UserAvatar({ user, size = "md", className = "", ring = false }: UserAvatarProps) {
  const name = user.displayName || user.firstName || user.username;
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const base = `${SIZE_MAP[size]} rounded-full shrink-0 ${ring ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : ""} ${className}`;

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={name}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${base} bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold shadow-sm`}
    >
      {initials}
    </div>
  );
}

// Client-side image compression via canvas — no external library needed
export async function compressAvatar(file: File, maxPx = 400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select an image file."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Image must be under 8 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image."));
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width  * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        // Approx size check (~150 KB compressed)
        if (dataUrl.length > 220_000) {
          // Try lower quality
          resolve(canvas.toDataURL("image/jpeg", 0.65));
        } else {
          resolve(dataUrl);
        }
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
