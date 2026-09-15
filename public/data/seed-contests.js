window.SEED_CONTESTS = [
  { title: "U.S. Senator", party: "Democratic", candidates: ["Jeff Appelhans", "Chris Coons", "E. No-Trump Hansen", "Mary Louve"] },
  { title: "U.S. Senator", party: "Republican", candidates: ["Michael \"Dr. Mike\" Katz", "John Shulli"] },
  { title: "Representative in Congress", party: "Republican", candidates: ["Joseph \"Dr. Joe\" Arminio", "Earl L. Cooper", "John J. Whalen"] },
  { title: "Attorney General", party: "Democratic", candidates: ["Dwayne J. Bensing", "Kathy Jennings", "Patty Rickman"] },
  { title: "State Treasurer", party: "Democratic", candidates: ["Ted Lauzen", "Mike Miller", "Michael Alexander Smith"] },

  { title: "State Senator District 1", party: "Democratic", candidates: ["Adriana Leela Bohm", "Dan Cruce"] },
  { title: "State Senator District 5", party: "Democratic", candidates: ["Shay Frisby", "Ray Seigfried"] },
  { title: "State Senator District 7", party: "Democratic", candidates: ["Jose A. Lopez", "Spiros Mantzavinos"] },
  { title: "State Senator District 9", party: "Democratic", candidates: ["Dawn Briggs", "Jack Walsh"] },
  { title: "State Senator District 12", party: "Democratic", candidates: ["Nicole Poore", "Keonna Watson"] },
  { title: "State Senator District 14", party: "Democratic", candidates: ["Chris Beardsley", "Kyra L. Hoffner"] },

  { title: "State Representative District 1", party: "Democratic", candidates: ["Nnamdi O. Chukwuocha", { name: "Shané Darby", sourceName: "Shane Nicole Darby" }] },
  { title: "State Representative District 2", party: "Democratic", candidates: ["Stephanie T. Bolden", "Michelle H. Booker"] },
  { title: "State Representative District 3", party: "Democratic", candidates: ["Branden Fletcher-Dominguez", "LaDonna Graham", "Yolanda M. McCoy", "Josue O. Ortega"] },
  { title: "State Representative District 6", party: "Democratic", candidates: ["Rachel \"Rae\" Krantz", "Ed Mulvihill", "Ralf Santana"] },
  { title: "State Representative District 8", party: "Democratic", candidates: ["Lissa Brutus", "Sherae'a \"Rae\" Moore", "Matt Powell"] },
  { title: "State Representative District 8", party: "Republican", candidates: ["Watara T.F. Heath", "Gary Taylor"] },
  { title: "State Representative District 9", party: "Democratic", candidates: ["Ayanna Khan-Flowers", "Gemma E. Lowery", "Michelle Wall"] },
  { title: "State Representative District 12", party: "Democratic", candidates: ["Robert F. Bahnsen Jr.", "Krista Griffith"] },
  { title: "State Representative District 16", party: "Democratic", candidates: ["Franklin D. Cooke, Jr.", "Pamela Salaam"] },
  { title: "State Representative District 19", party: "Democratic", candidates: ["Will Imbrie-Moore", "Kim Williams"] },
  { title: "State Representative District 20", party: "Democratic", candidates: ["Alonna Berry", "Ruby Keeler Schaeffer"] },
  { title: "State Representative District 23", party: "Democratic", candidates: ["Luann D'Agostino", "Joe Jasper", "Dave Redlawsk", "Dan Seador"] },
  { title: "State Representative District 27", party: "Democratic", candidates: ["Eric Morrison", "Christopher W. Muntz"] },
  { title: "State Representative District 28", party: "Democratic", candidates: ["William Carson Jr.", "Tyeisha \"Tye\" Grier"] },
  { title: "State Representative District 32", party: "Democratic", candidates: ["Kerri Evelyn Harris", "LaChelle Paul"] },
  { title: "State Representative District 33", party: "Republican", candidates: ["Matt Bucher", "Morgan Hudson"] },
  { title: "State Representative District 36", party: "Republican", candidates: ["Bryan William Shupe", "Patrick Smith"] },
  { title: "State Representative District 41", party: "Republican", candidates: ["John Atkins", "Doug Conaway", "Jacki Slonin"] },

  { title: "New Castle County Council District 3", party: "Democratic", candidates: ["Kira Alejandro", "Kyle R. Grantham"] },
  { title: "New Castle County Council District 4", party: "Democratic", candidates: ["Helena M. Creamer", "Jason Hoover", "Curtis Dauntell Linton"] },
  { title: "New Castle County Council District 5", party: "Democratic", candidates: ["Valerie George", "Syam Kosigi"] },
  { title: "New Castle County Recorder of Deeds", party: "Democratic", candidates: ["Michael E. Kozikowski, Sr.", "David Tackett"] }
].map((contest, index) => ({
  id: `${contest.title}-${contest.party}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  title: contest.title,
  party: contest.party,
  candidates: contest.candidates.map(candidate => ({
    ...(typeof candidate === "string" ? { name: candidate } : candidate),
    votes: 0,
    percentage: 0
  })),
  seedOrder: index
}));
