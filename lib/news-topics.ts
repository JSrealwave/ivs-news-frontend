export const NEWS_TOPICS = ["LPR", "VMS", "Edge", "Policy", "Other"] as const;

export type NewsTopic = (typeof NEWS_TOPICS)[number];

export const NEWS_TOPIC_FILTERS = ["All", ...NEWS_TOPICS] as const;

export type NewsTopicFilter = (typeof NEWS_TOPIC_FILTERS)[number];

/** First match wins. Replace this function when a stored tag exists. */
const TOPIC_TERMS: { topic: Exclude<NewsTopic, "Other">; terms: string[] }[] = [
  {
    topic: "LPR",
    terms: [
      "lpr",
      "alpr",
      "flock",
      "license plate",
      "license-plate",
      "plate",
      "vigilant",
      "autovu",
      "genetec autovu",
      "plate reader",
      "plate readers",
    ],
  },
  {
    topic: "VMS",
    terms: [
      "synology dva",
      "axis camera station",
      "march networks",
      "nl search",
      "video wall",
      "vsaas",
      "vms",
      "nvr",
      "forensic",
      "ambient",
      "genetec",
      "milestone",
    ],
  },
  {
    topic: "Edge",
    terms: [
      "camera sdk",
      "edge box",
      "dragonwing",
      "qualcomm",
      "imsdk",
      "jetson",
      "ambarella",
      "silicon",
      "soc",
    ],
  },
  {
    topic: "Policy",
    terms: [
      "flock contract",
      "santa barbara",
      "ai act",
      "desantis",
      "hawley",
      "biometrics",
      "privacy",
      "ndaa",
      "council",
      "tempe",
      "cancel",
      "city",
    ],
  },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function haystackHasTerm(haystack: string, term: string): boolean {
  const needle = term.toLowerCase();
  if (needle.includes(" ")) {
    return haystack.includes(needle);
  }
  const pattern = new RegExp(`\\b${escapeRegExp(needle)}\\b`, "i");
  return pattern.test(haystack);
}

/**
 * Buyer-topic heuristic on headline + domain. First match in
 * LPR → VMS → Edge → Policy wins. Do not pass Key point / Why-it-matters;
 * those belong on the brief permalink.
 */
export function classifyNewsTopic(...parts: (string | null | undefined)[]): NewsTopic {
  const haystack = parts
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .toLowerCase();

  if (!haystack.trim()) return "Other";

  for (const { topic, terms } of TOPIC_TERMS) {
    if (terms.some((term) => haystackHasTerm(haystack, term))) {
      return topic;
    }
  }
  return "Other";
}
