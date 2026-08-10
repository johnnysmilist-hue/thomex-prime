const badges = [
  { title: "Free Delivery", subtitle: "Free delivery service provide on purchase" },
  { title: "Secure Payments", subtitle: "Top Secure payments services available" },
  { title: "24/7 Support", subtitle: "Our Customer support center available for help" },
];

export default function TrustBadges() {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
      {badges.map((badge) => (
        <div key={badge.title} className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm shrink-0">
            ✓
          </span>
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">{badge.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{badge.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
