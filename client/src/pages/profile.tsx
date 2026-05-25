import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";
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

const profileSchema = z.object({
  firstName:   z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
  lastName:    z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
  displayName: z.string().max(60, "Max 60 characters").optional().or(z.literal("")),
  phone:       z.string().max(20, "Max 20 characters").optional().or(z.literal("")),
  username:    z.string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email:       z.string().email("Enter a valid email address"),
});

type ProfileForm = z.infer<typeof profileSchema>;

function InitialsAvatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const cls = size === "lg"
    ? "w-20 h-20 text-2xl"
    : "w-10 h-10 text-sm";

  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30`}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName:   "",
      lastName:    "",
      displayName: "",
      phone:       "",
      username:    "",
      email:       "",
    },
  });

  // Populate form when user data arrives
  useEffect(() => {
    if (user) {
      form.reset({
        firstName:   user.firstName   ?? "",
        lastName:    user.lastName    ?? "",
        displayName: user.displayName ?? "",
        phone:       user.phone       ?? "",
        username:    user.username    ?? "",
        email:       user.email       ?? "",
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      apiRequest("PATCH", "/api/profile", {
        ...data,
        firstName:   data.firstName   || undefined,
        lastName:    data.lastName    || undefined,
        displayName: data.displayName || undefined,
        phone:       data.phone       || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated!",
        description: "Your details have been saved successfully.",
      });
    },
    onError: async (err: any) => {
      let msg = "Failed to save changes. Please try again.";
      try {
        const body = await err.json?.();
        if (body?.message) msg = body.message;
      } catch {}
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileForm) => updateMutation.mutate(data);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayLabel = user.displayName || user.firstName
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username
    : user.username;

  const usdtValue = (user.coins / 1000).toFixed(2);
  const totalUsdtValue = (user.totalEarned / 1000).toFixed(2);

  return (
    <div className="max-w-xl mx-auto p-4 pt-8 pb-28">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/">
          <button
            data-testid="button-back-profile"
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal details</p>
        </div>
      </div>

      {/* Avatar + name card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card rounded-3xl p-5 mb-5 flex items-center gap-4"
      >
        <InitialsAvatar name={displayLabel} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-lg leading-tight truncate">{displayLabel}</p>
          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Pencil className="w-4 h-4 text-primary" />
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="font-bold text-sm">{user.coins.toLocaleString()} <span className="text-muted-foreground font-normal">coins</span></p>
            <p className="text-[10px] text-muted-foreground">≈ ${usdtValue} USDT</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="font-bold text-sm">{user.totalEarned.toLocaleString()} <span className="text-muted-foreground font-normal">coins</span></p>
            <p className="text-[10px] text-muted-foreground">≈ ${totalUsdtValue} USDT</p>
          </div>
        </div>
      </div>

      {/* KYC notice */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-blue-400/15 mb-5">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your profile details are used for{" "}
          <span className="font-semibold text-foreground">KYC verification</span> and{" "}
          <span className="font-semibold text-foreground">withdrawal processing</span>.
          Keep them accurate and up to date.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
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
                        className="pl-9 rounded-xl bg-secondary/50 border-white/10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
                        className="pl-9 rounded-xl bg-secondary/50 border-white/10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Display name */}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                  Display Name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="How you appear in the app"
                      data-testid="input-display-name"
                      className="pl-9 rounded-xl bg-secondary/50 border-white/10"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                  Username <span className="text-rose-400">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="your_username"
                      data-testid="input-username"
                      className="pl-9 rounded-xl bg-secondary/50 border-white/10"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                  Email Address <span className="text-rose-400">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      data-testid="input-email"
                      className="pl-9 rounded-xl bg-secondary/50 border-white/10"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground uppercase tracking-widest">
                  Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+91 98765 43210"
                      data-testid="input-phone"
                      className="pl-9 rounded-xl bg-secondary/50 border-white/10"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Save button */}
          <Button
            type="submit"
            data-testid="button-save-profile"
            disabled={updateMutation.isPending}
            className="w-full rounded-2xl h-12 text-base font-semibold mt-2"
          >
            {updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </span>
            ) : updateMutation.isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>

          {updateMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl px-4 py-3"
              data-testid="status-profile-saved"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profile updated successfully. Changes are live across the app.
            </motion.div>
          )}
        </form>
      </Form>

      {/* KYC link */}
      <div className="mt-6">
        <Link href="/kyc">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">KYC Verification</p>
              <p className="text-xs text-muted-foreground mt-0.5">Complete identity verification to unlock withdrawals</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:text-foreground transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
