const WORD_DICTIONARY = new Set([

    // Pronouns
    "i", "me", "my", "mine", "you", "your", "yours", "he", "him", "his",
    "she", "her", "hers", "it", "its", "we", "us", "our", "ours",
    "they", "them", "their", "theirs", "who", "whom", "whose",
    "which", "that", "this", "these", "those",

    // Articles & Determiners
    "a", "an", "the", "some", "any", "each", "every", "either", "neither",
    "few", "many", "much", "more", "most", "other", "another", "such",

    // Conjunctions
    "and", "or", "but", "because", "although", "though", "while",
    "whereas", "if", "unless", "until", "since", "so",

    // Prepositions
    "in", "on", "at", "by", "with", "about", "against", "between",
    "into", "through", "during", "before", "after", "above",
    "below", "to", "from", "up", "down", "over", "under",
    "again", "further", "then", "once", "of", "off", "out",

    // Auxiliary / Common Verbs
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having",
    "do", "does", "did", "doing",
    "can", "could", "will", "would", "shall", "should",
    "may", "might", "must",

    // Frequent Action Verbs
    "make", "makes", "made", "making",
    "take", "takes", "took", "taken", "taking",
    "get", "gets", "got", "getting",
    "go", "goes", "went", "gone", "going",
    "come", "comes", "came", "coming",
    "see", "saw", "seen", "seeing",
    "know", "knows", "knew", "known", "knowing",
    "think", "thinks", "thought", "thinking",
    "give", "gives", "gave", "given", "giving",
    "find", "finds", "found", "finding",
    "tell", "tells", "told", "telling",
    "work", "works", "worked", "working",
    "try", "tries", "tried", "trying",
    "leave", "leaves", "left", "leaving",
    "call", "calls", "called", "calling",
    "need", "needs", "needed", "needing",
    "feel", "feels", "felt", "feeling",
    "become", "becomes", "became", "becoming",

    // Common Nouns
    "time", "year", "people", "way", "day", "man", "woman", "child",
    "world", "life", "hand", "part", "place", "case", "point",
    "company", "group", "problem", "fact", "home", "room", "area",
    "money", "story", "issue", "side", "kind", "head", "house",
    "service", "friend", "father", "mother", "family", "student",
    "school", "college", "office", "country", "city", "community",

    // Question Words
    "what", "when", "where", "why", "how", "which", "who",

    // Adjectives
    "good", "new", "first", "last", "long", "great", "little",
    "own", "other", "old", "right", "big", "high", "different",
    "small", "large", "next", "early", "young", "important",
    "few", "public", "bad", "same", "able",

    // Adverbs
    "very", "really", "quickly", "slowly", "well", "here", "there",
    "now", "today", "tomorrow", "yesterday", "always", "never",
    "sometimes", "often", "usually", "again", "almost", "already",

    // Tech / Modern Words
    "computer", "internet", "browser", "keyboard", "extension",
    "software", "hardware", "application", "system", "server",
    "client", "network", "data", "database", "model", "ai",
    "machine", "learning", "python", "javascript", "code",
    "program", "project", "engineering", "developer", "design",
    "technology", "mobile", "website", "cloud",

    // Conversation Words
    "hello", "hi", "hey", "yes", "no", "okay", "please", "thanks",
    "thank", "welcome", "sorry", "sure", "alright", "fine",

    // Extra Useful Everyday Words
    "start", "end", "open", "close", "read", "write", "create",
    "delete", "update", "check", "send", "receive", "play",
    "watch", "listen", "talk", "speak", "run", "move",
    "build", "plan", "change", "help", "understand",
    "remember", "forget", "learn", "teach"

]);
