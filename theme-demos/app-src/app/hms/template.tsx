// Re-mounts on every HMS navigation. The new page fades in quickly (opacity only — no zoom, no slide);
// sidebar and header never move. Off with reduced motion and with My preferences → Reduce motion.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="hms-route hms-page-in h-full">{children}</div>;
}
