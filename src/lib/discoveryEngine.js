export function getDiscoveryStyle(tier) {
  const styles = {
    immortal: {
      border: 'border-purple-600',
      bg: 'bg-purple-600/10',
      text: 'text-purple-300',
      star: '⭐',
      badge: 'bg-purple-600/30 text-purple-300'
    },
    legend: {
      border: 'border-amber-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      star: '🏆',
      badge: 'bg-amber-500/30 text-amber-300'
    },
    gold: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-300',
      star: '💛',
      badge: 'bg-yellow-500/30 text-yellow-300'
    },
    default: {
      border: 'border-blue-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-300',
      star: '✨',
      badge: 'bg-blue-500/30 text-blue-300'
    }
  };
  return styles[tier] || styles.default;
}
