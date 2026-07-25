import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    body: `Felix Network ("we", "us", or "our") operates the Felix Network Progressive Web App (the "App"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the App. By using the App you agree to the collection and use of information as described in this policy.`,
  },
  {
    title: "2. Information We Collect",
    body: `We collect the following categories of information:\n\n• **Account Information**: username, email address, and password (stored as a secure hash).\n• **Profile Data**: display name and profile picture you choose to upload.\n• **Usage Data**: pages viewed, ads watched, rewards earned, and feature interactions.\n• **Device & Technical Data**: browser type, operating system, IP address, and time zone — collected automatically when you use the App.\n• **Referral Data**: referral codes used at registration and referrals made by your account.`,
  },
  {
    title: "3. How We Use Your Information",
    body: `We use your information to:\n\n• Create and manage your account.\n• Deliver and improve the App's core functionality (watching ads, earning coins, referrals).\n• Prevent fraud and enforce our Terms of Service.\n• Send important service notices and security alerts.\n• Analyse usage trends to improve the App.\n• Comply with legal obligations.`,
  },
  {
    title: "4. Advertising",
    body: `Felix Network may serve third-party advertisements (including via Google AdMob or similar networks). These ad networks may use cookies, device identifiers, or similar technologies to deliver personalised ads based on your interests. We do not control these third parties' privacy practices. You may opt out of personalised advertising through your device settings or the ad network's opt-out tools.`,
  },
  {
    title: "5. Cookies & Tracking Technologies",
    body: `We use HttpOnly cookies to maintain your login session securely. We do not use persistent tracking cookies for marketing purposes. Third-party ad providers may place their own cookies or SDKs subject to their own policies.`,
  },
  {
    title: "6. Sharing Your Information",
    body: `We do not sell your personal data. We may share information with:\n\n• **Service Providers**: trusted partners who help operate our infrastructure (e.g., hosting, database, CDN providers).\n• **Ad Partners**: anonymised or aggregated data for advertising optimisation.\n• **Legal Authorities**: when required by law, court order, or to protect the rights and safety of Felix Network and its users.`,
  },
  {
    title: "7. Data Retention",
    body: `We retain your account data for as long as your account is active. If you delete your account, your personal data (profile, history, transaction records) is permanently deleted from our systems within 30 days, except where retention is required by law.`,
  },
  {
    title: "8. Security",
    body: `We implement industry-standard security measures including HTTPS encryption, HttpOnly cookies, and hashed passwords. However, no internet transmission or electronic storage is 100% secure. We cannot guarantee absolute security.`,
  },
  {
    title: "9. Children's Privacy",
    body: `Felix Network is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal data, please contact us so we can take appropriate action.`,
  },
  {
    title: "10. Your Rights",
    body: `Depending on your jurisdiction you may have the right to:\n\n• Access the personal data we hold about you.\n• Request correction of inaccurate data.\n• Request deletion of your account and associated data.\n• Object to or restrict certain processing activities.\n• Lodge a complaint with a supervisory authority.\n\nTo exercise these rights, contact us via our Telegram support channel.`,
  },
  {
    title: "11. International Transfers",
    body: `Your information may be transferred to and processed in countries other than your own. We take appropriate steps to ensure your data is protected in accordance with this Privacy Policy wherever it is processed.`,
  },
  {
    title: "12. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last Updated" date at the top of this page. Continued use of the App after changes constitutes acceptance of the revised policy.`,
  },
  {
    title: "13. Contact Us",
    body: `If you have questions about this Privacy Policy or our data practices, please contact us via our official Telegram support channel:\nhttps://t.me/CashFlowRewardsHub`,
  },
];

function renderBody(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("• ")) {
      const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, (_m, p1) => `<strong>${p1}</strong>`);
      return (
        <li key={i} className="text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
      );
    }
    if (line === "") return <br key={i} />;
    const content = line.replace(/\*\*(.*?)\*\*/g, (_m, p1) => `<strong>${p1}</strong>`);
    return <p key={i} className="text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-xl mx-auto p-4 pt-12 pb-28 min-h-screen">
      {/* Back */}
      <Link href="/dashboard">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">Back to Dashboard</span>
        </button>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-2"
      >
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Privacy Policy</h1>
      </motion.div>
      <p className="text-xs text-muted-foreground mb-8 ml-[52px]">Last Updated: July 25, 2026</p>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-5 rounded-2xl"
          >
            <h2 className="font-display font-bold text-foreground mb-3">{section.title}</h2>
            <ul className="space-y-1.5">{renderBody(section.body)}</ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
