/* Prototype company data. Topics are general preparation areas, not verified company interview questions. */
window.C2C_CATEGORIES = [
  "All", "Product & Software", "IT Services", "Finance & Banking",
  "Consulting & Analytics", "Engineering & Technology", "Logistics & Supply Chain"
];

window.C2C_COMPANIES = [
  { id: "accenture", name: "Accenture", category: "IT Services", roles: "Associate software, analyst",
    logo: "https://www.google.com/s2/favicons?domain=accenture.com&sz=128",
    blurb: "General preparation areas for IT services roles.",
    topics: ["Cognitive", "Technical MCQs", "Communication"] },
  { id: "barclays", name: "Barclays", category: "Finance & Banking", roles: "Technology, analyst",
    logo: "https://www.google.com/s2/favicons?domain=barclays.com&sz=128",
    blurb: "General preparation areas for technology roles in banking.",
    topics: ["Aptitude", "Programming", "Finance basics"] },
  { id: "impetus", name: "Impetus", category: "IT Services", roles: "Software engineering, data",
    logo: "https://www.google.com/s2/favicons?domain=impetus.com&sz=128",
    blurb: "General preparation areas for software and data engineering roles.",
    topics: ["DSA", "Databases", "Programming"] },
  { id: "quantiphi", name: "Quantiphi", category: "Consulting & Analytics", roles: "Data, ML, analytics",
    logo: "https://www.google.com/s2/favicons?domain=quantiphi.com&sz=128",
    blurb: "General preparation areas for data and analytics roles.",
    topics: ["SQL", "Statistics", "Python"] },
  { id: "tata-technologies", name: "Tata Technologies", category: "Engineering & Technology", roles: "Engineering, software",
    logo: "https://www.google.com/s2/favicons?domain=tatatechnologies.com&sz=128",
    blurb: "General preparation areas for engineering and software roles.",
    topics: ["CS fundamentals", "Aptitude", "Programming"] },
  { id: "zs-associates", name: "ZS Associates", category: "Consulting & Analytics", roles: "Analyst, business technology",
    logo: "https://www.google.com/s2/favicons?domain=zs.com&sz=128",
    blurb: "General preparation areas for analytical and consulting-style roles.",
    topics: ["Aptitude", "Case thinking", "SQL"] },
  { id: "forma-ai", name: "Forma.ai", category: "Product & Software", roles: "Software and analytics",
    logo: "https://www.google.com/s2/favicons?domain=forma.ai&sz=128",
    blurb: "General preparation topics for software and analytical roles.",
    topics: ["Problem solving", "SQL", "Programming"] },
  { id: "dhl", name: "DHL", category: "Logistics & Supply Chain", roles: "Technology, operations analytics",
    logo: "https://www.google.com/s2/favicons?domain=dhl.com&sz=128",
    blurb: "General preparation areas for technology and analytics roles in logistics.",
    topics: ["Aptitude", "Problem solving", "Data basics"] }
];

/* Curated external learning material. Topic tags are normalized by company-detail.js. */
window.C2C_RESOURCES = [
  {
    id: "indiabix-aptitude", title: "Quantitative aptitude practice", provider: "IndiaBix",
    description: "Practise quantitative aptitude questions with answers and explanations.",
    url: "https://www.indiabix.com/aptitude/questions-and-answers/", topics: ["aptitude"]
  },
  {
    id: "indiabix-reasoning", title: "Logical reasoning practice", provider: "IndiaBix",
    description: "Work through reasoning questions to build structured problem-solving skills.",
    url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/", topics: ["cognitive"]
  },
  {
    id: "gfg-dsa", title: "Learn data structures and algorithms", provider: "GeeksforGeeks",
    description: "Review core data structures and algorithmic techniques with guided explanations.",
    url: "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/", topics: ["dsa", "problem solving"]
  },
  {
    id: "hackerrank-algorithms", title: "Algorithm coding practice", provider: "HackerRank",
    description: "Practise algorithmic problems in an interactive coding environment.",
    url: "https://www.hackerrank.com/domains/algorithms", topics: ["dsa", "problem solving"]
  },
  {
    id: "freecodecamp", title: "Programming learning paths", provider: "freeCodeCamp",
    description: "Follow guided coding lessons and projects to strengthen programming fundamentals.",
    url: "https://www.freecodecamp.org/learn/", topics: ["programming"]
  },
  {
    id: "python-tutorial", title: "The Python tutorial", provider: "Python documentation",
    description: "Learn Python syntax, data structures, modules and core language concepts.",
    url: "https://docs.python.org/3/tutorial/", topics: ["python", "programming"]
  },
  {
    id: "sqlbolt", title: "Interactive SQL lessons", provider: "SQLBolt",
    description: "Learn SQL queries and relational database basics through short interactive lessons.",
    url: "https://sqlbolt.com/", topics: ["sql", "databases", "data basics"]
  },
  {
    id: "gfg-cs", title: "Computer science fundamentals", provider: "GeeksforGeeks",
    description: "Review common computer science subjects and foundational concepts.",
    url: "https://www.geeksforgeeks.org/computer-science-subjects-gq/", topics: ["cs fundamentals", "technical mcqs", "databases"]
  },
  {
    id: "khan-statistics", title: "Statistics and probability", provider: "Khan Academy",
    description: "Study foundational statistics, probability and data interpretation.",
    url: "https://www.khanacademy.org/math/statistics-probability", topics: ["statistics", "data basics"]
  },
  {
    id: "kaggle-learn", title: "Practical data learning", provider: "Kaggle Learn",
    description: "Explore short lessons in data skills, Python and related analytical topics.",
    url: "https://www.kaggle.com/learn", topics: ["python", "statistics", "data basics"]
  },
  {
    id: "british-council", title: "English communication practice", provider: "British Council LearnEnglish",
    description: "Practise English skills that can help with clear communication.",
    url: "https://learnenglish.britishcouncil.org/", topics: ["communication"]
  },
  {
    id: "khan-finance", title: "Economics and finance learning", provider: "Khan Academy",
    description: "Explore introductory finance and economics concepts for general background knowledge.",
    url: "https://www.khanacademy.org/economics-finance-domain", topics: ["finance basics"]
  },
  {
    id: "case-interview", title: "Case interview preparation", provider: "CaseInterview.com",
    description: "Review general approaches to structuring and solving case-style problems.",
    url: "https://www.caseinterview.com/", topics: ["case thinking"]
  }
];
