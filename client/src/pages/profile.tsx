import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  AtSign,
  Pencil,
  Coins,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Globe,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Upload,
  X,
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserAvatar, compressAvatar } from "@/components/user-avatar";

// ── Schemas ────────────────────────────────────────────────────────────────

const publicSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  displayName: z.string().max(60, "Max 60 characters").optional().or(z.literal("")),
});

const privateSchema = z.object({
  firstName: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
  lastName:  z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
  email:     z.string().email("Enter a valid email address"),
  phone:     z.string().max(20, "Max 20 digits").optional().or(z.literal("")),
});

type PublicForm  = z.infer<typeof publicSchema>;
type PrivateForm = z.infer<typeof privateSchema>;

// ── Success banner ──────────────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2.5 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl px-4 py-3"
      data-testid="status-profile-saved"
    >
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      {message}
    </motion.div>
  );
}

// ── Section header ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconClass,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="font-display font-bold text-base leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [publicSaved, setPublicSaved]   = useState(false);
  const [privateSaved, setPrivateSaved] = useState(false);
  const [showEmail, setShowEmail]       = useState(false);
  const [showPhone, setShowPhone]       = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaved, setAvatarSaved]     = useState(false);

  // ── Forms ──────────────────────────────────────────────────────────────

  const publicForm = useForm<PublicForm>({
    resolver: zodResolver(publicSchema),
    defaultValues: { username: "", displayName: "" },
  });

  const privateForm = useForm<PrivateForm>({
    resolver: zodResolver(privateSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (!user) return;
    publicForm.reset({
      username:    user.username    ?? "",
      displayName: user.displayName ?? "",
    });
    privateForm.reset({
      firstName: user.firstName ?? "",
      lastName:  user.lastName  ?? "",
      email:     user.email     ?? "",
      phone:     user.phone     ?? "",
    });
  }, [user]); // eslint-disable-line

  // ── Cache helpers ──────────────────────────────────────────────────────

  const buildPayload = (overrides: Partial<PublicForm & PrivateForm>) => ({
    username:    publicForm.getValues("username"),
    displayName: publicForm.getValues("displayName") || undefined,
    firstName:   privateForm.getValues("firstName")  || undefined,
    lastName:    privateForm.getValues("lastName")   || undefined,
    email:       privateForm.getValues("email"),
    phone:       privateForm.getValues("phone")      || undefined,
    ...overrides,
  });

  const applyToCache = (patch: Partial<typeof user>) => {
    queryClient.setQueryData(
      [api.auth.me.path],
      (old: typeof user) => old ? { ...old, ...patch } : old
    );
  };

  // ── Avatar mutation ────────────────────────────────────────────────────

  const avatarMutation = useMutation({
    mutationFn: async (dataUrl: string) => {
      const res = await apiRequest("PATCH", "/api/profile/avatar", { avatarUrl: dataUrl });
      return res.json();
    },
    onSuccess: (updated) => {
      applyToCache({ avatarUrl: updated.avatarUrl });
      setAvatarPreview(null);
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 4000);
      toast({ title: "Profile picture updated!", description: "Your new photo is live across the app." });
    },
    onError: async (err: any) => {
      let msg = "Failed to upload photo. Please try again.";
      try { const b = await err?.response?.json?.(); if (b?.message) msg = b.message; } catch {}
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const compressed = await compressAvatar(file);
      setAvatarPreview(compressed);
    } catch (err: any) {
      toast({ title: "Image error", description: err.message || "Could not process image.", variant: "destructive" });
    }
  };

  const handleAvatarSave = () => {
    if (avatarPreview) avatarMutation.mutate(avatarPreview);
  };

  const handleAvatarCancel = () => setAvatarPreview(null);

  // ── Public profile mutation ────────────────────────────────────────────

  const publicMutation = useMutation({
    mutationFn: async (data: PublicForm) => {
      const payload = buildPayload(data);
      const res = await apiRequest("PATCH", "/api/profile", payload);
      return res.json();
    },
    onSuccess: (updated) => {
      applyToCache({ username: updated.username, displayName: updated.displayName });
      publicForm.reset({
        username:    updated.username    ?? "",
        displayName: updated.displayName ?? "",
      });
      setPublicSaved(true);
      setTimeout(() => setPublicSaved(false), 4000);
      toast({ title: "Public profile updated!", description: "Changes are live across the app." });
    },
    onError: async (err: any) => {
      let msg = "Failed to save. Please try again.";
      try { const b = await err?.response?.json?.(); if (b?.message) msg = b.message; } catch {}
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  // ── Private details mutation ───────────────────────────────────────────

  const privateMutation = useMutation({
    mutationFn: async (data: PrivateForm) => {
      const payload = buildPayload(data);
      const res = await apiRequest("PATCH", "/api/profile", payload);
      return res.json();
    },
    onSuccess: (updated) => {
      applyToCache({
        firstName: updated.firstName,
        lastName:  updated.lastName,
        email:     updated.email,
        phone:     updated.phone,
      });
      privateForm.reset({
        firstName: updated.firstName ?? "",
        lastName:  updated.lastName  ?? "",
        email:     updated.email     ?? "",
        phone:     updated.phone     ?? "",
      });
      setPrivateSaved(true);
      setTimeout(() => setPrivateSaved(false), 4000);
      toast({ title: "Private details saved!", description: "Your verification info is up to date." });
    },
    onError: async (err: any) => {
      let msg = "Failed to save. Please try again.";
      try { const b = await err?.response?.json?.(); if (b?.message) msg = b.message; } catch {}
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  // ── Loading state ──────────────────────────────────────────────────────

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayLabel = user.displayName
    || [user.firstName, user.lastName].filter(Boolean).join(" ")
    || user.username;

  const usdtValue      = (user.coins / 1000).toFixed(2);
  const totalUsdtValue = (user.totalEarned / 1000).toFixed(2);

  const previewUser = { ...user, avatarUrl: avatarPreview ?? user.avatarUrl };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-xl mx-auto p-4 pt-8 pb-28">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <button
            data-testid="button-back-profile"
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account details</p>
        </div>
      </div>

      {/* ── Avatar + identity card ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-5 mb-5"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          data-testid="input-avatar-file"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-5">
          {/* Clickable avatar */}
          <div className="relative shrink-0">
            <UserAvatar user={previewUser} size="xl" ring />

            {/* Preview badge */}
            {avatarPreview && (
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center">
                <span className="text-[8px] font-bold text-black">!</span>
              </div>
            )}

            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-change-avatar"
              disabled={avatarMutation.isPending}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30"
              aria-label="Change profile picture"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="font-display font-bold text-xl leading-tight truncate"
              data-testid="text-display-name"
            >
              {displayLabel}
            </p>
            <p className="text-sm text-muted-foreground truncate" data-testid="text-username">
              @{user.username}
            </p>
            {user.firstName && user.lastName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {user.firstName} {user.lastName}
              </p>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Change photo
            </button>
          </div>
        </div>

        {/* Preview panel — shown when user picks a new image */}
        <AnimatePresence>
          {avatarPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-amber-400/25 bg-amber-400/5 rounded-2xl p-3.5 flex items-center gap-3">
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-amber-400/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-400">Preview — not saved yet</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Tap Save Photo to apply your new profile picture.</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    onClick={handleAvatarSave}
                    disabled={avatarMutation.isPending}
                    data-testid="button-save-avatar"
                    className="h-7 px-3 text-xs rounded-xl"
                  >
                    {avatarMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-3 h-3 mr-1" /> Save
                      </>
                    )}
                  </Button>
                  <button
                    onClick={handleAvatarCancel}
                    data-testid="button-cancel-avatar"
                    className="h-7 px-3 text-xs rounded-xl bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar saved confirmation */}
        <AnimatePresence>
          {avatarSaved && !avatarPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              <SuccessBanner message="Profile picture updated! Visible across the entire app." />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Balance</p>
            <p className="font-bold text-sm leading-tight">{user.coins.toLocaleString()} coins</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-card rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Earned</p>
            <p className="font-bold text-sm leading-tight">{user.totalEarned.toLocaleString()} coins</p>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION A — PUBLIC PROFILE
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-5 mb-4 border border-primary/10"
      >
        <SectionHeader
          icon={Globe}
          title="Public Profile"
          subtitle="Visible to other users in the app"
          iconClass="bg-primary/10 text-primary"
        />

        <Form {...publicForm}>
          <form
            onSubmit={publicForm.handleSubmit((d) => publicMutation.mutate(d))}
            className="space-y-4"
          >
            {/* Username */}
            <FormField
              control={publicForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                    Username <span className="text-rose-400 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="your_username"
                        data-testid="input-username"
                        className="pl-9 rounded-xl bg-secondary/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Display name */}
            <FormField
              control={publicForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                    Display Name
                    <span className="ml-1.5 text-[10px] text-muted-foreground font-normal normal-case tracking-normal">(shown in app instead of username)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="e.g. John D."
                        data-testid="input-display-name"
                        className="pl-9 rounded-xl bg-secondary/50 border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              data-testid="button-save-public"
              disabled={publicMutation.isPending}
              className="w-full rounded-2xl h-11 font-semibold"
            >
              {publicMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </span>
              ) : "Save Public Profile"}
            </Button>

            <AnimatePresence>
              {publicSaved && (
                <SuccessBanner message="Public profile updated instantly — no refresh needed." />
              )}
            </AnimatePresence>
          </form>
        </Form>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION B — PRIVATE VERIFICATION DETAILS
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-3xl p-5 mb-4 border border-blue-400/10"
      >
        <SectionHeader
          icon={Lock}
          title="Private Verification Details"
          subtitle="Only visible to you — used for KYC & withdrawals"
          iconClass="bg-blue-400/10 text-blue-400"
        />

        {/* KYC notice */}
        <div className="flex items-start gap-2.5 bg-blue-400/5 border border-blue-400/15 rounded-xl px-3.5 py-3 mb-4">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Accurate details are required for{" "}
            <span className="text-foreground font-semibold">identity verification</span> before
            you can withdraw your earnings.
          </p>
        </div>

        <Form {...privateForm}>
          <form
            onSubmit={privateForm.handleSubmit((d) => privateMutation.mutate(d))}
            className="space-y-4"
          >
            {/* First / Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={privateForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="John"
                          data-testid="input-first-name"
                          className="pl-9 rounded-xl bg-secondary/50 border-white/10 focus:border-primary/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={privateForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Doe"
                          data-testid="input-last-name"
                          className="pl-9 rounded-xl bg-secondary/50 border-white/10 focus:border-primary/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={privateForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                    Email Address <span className="text-rose-400 ml-0.5">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showEmail ? "text" : "email"}
                        placeholder="you@example.com"
                        data-testid="input-email"
                        className="pl-9 pr-10 rounded-xl bg-secondary/50 border-white/10 focus:border-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmail((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={privateForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                    Phone Number
                    <span className="ml-1.5 text-[10px] text-muted-foreground font-normal normal-case tracking-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPhone ? "text" : "tel"}
                        placeholder="+91 98765 43210"
                        data-testid="input-phone"
                        className="pl-9 pr-10 rounded-xl bg-secondary/50 border-white/10 focus:border-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhone((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              data-testid="button-save-private"
              disabled={privateMutation.isPending}
              variant="outline"
              className="w-full rounded-2xl h-11 font-semibold border-blue-400/30 hover:border-blue-400/60 hover:bg-blue-400/5"
            >
              {privateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </span>
              ) : "Save Verification Details"}
            </Button>

            <AnimatePresence>
              {privateSaved && (
                <SuccessBanner message="Verification details saved securely." />
              )}
            </AnimatePresence>
          </form>
        </Form>
      </motion.div>

      {/* ── KYC shortcut ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/kyc">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors group border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Complete KYC Verification</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Identity verification required before withdrawals
              </p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:text-foreground transition-colors" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
