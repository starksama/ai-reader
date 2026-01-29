// Mock Local Content (MLC) for testing without URL parsing

export interface MockArticle {
  id: string;
  title: string;
  byline: string;
  siteName: string;
  excerpt: string;
  url: string;
  wordCount: number;
  paragraphs: {
    id: string;
    index: number;
    text: string;
    html: string;
  }[];
}

export const mockArticles: MockArticle[] = [
  {
    id: 'great-work',
    title: 'How to Do Great Work',
    byline: 'Paul Graham',
    siteName: 'paulgraham.com',
    excerpt: 'If you collected lists of techniques for doing great work in a lot of different fields, what would the intersection look like?',
    url: 'http://www.paulgraham.com/greatwork.html',
    wordCount: 850,
    paragraphs: [
      {
        id: 'p-0',
        index: 0,
        text: 'If you collected lists of techniques for doing great work in a lot of different fields, what would the intersection look like? I decided to find out by making it.',
        html: 'If you collected lists of techniques for doing great work in a lot of different fields, what would the intersection look like? I decided to find out by making it.',
      },
      {
        id: 'p-1',
        index: 1,
        text: 'Ambitious people are often wrong about what they want to work on. Part of the reason we\'re drawn to the wrong things is that we misunderstand what working on something actually consists of.',
        html: 'Ambitious people are often wrong about what they want to work on. Part of the reason we\'re drawn to the wrong things is that we misunderstand what working on something actually consists of.',
      },
      {
        id: 'p-2',
        index: 2,
        text: 'The first step is to decide what to work on. The work you choose needs to have three qualities: it has to be something you have a natural aptitude for, that you have a deep interest in, and that offers scope to do great work.',
        html: 'The first step is to decide what to work on. The work you choose needs to have three qualities: it has to be something you have a natural aptitude for, that you have a deep interest in, and that offers scope to do great work.',
      },
      {
        id: 'p-3',
        index: 3,
        text: 'In practice you don\'t have to worry much about the third criterion. Ambitious people are if anything already too conservative about it. So all you need to do is find something you have an aptitude for and great interest in.',
        html: 'In practice you don\'t have to worry much about the third criterion. Ambitious people are if anything already too conservative about it. So all you need to do is find something you have an aptitude for and great interest in.',
      },
      {
        id: 'p-4',
        index: 4,
        text: 'That sounds straightforward, but it\'s often quite difficult. When you\'re young you don\'t know what you\'re good at or what different kinds of work are like. Some kinds of work you end up doing may not even exist yet.',
        html: 'That sounds straightforward, but it\'s often quite difficult. When you\'re young you don\'t know what you\'re good at or what different kinds of work are like. Some kinds of work you end up doing may not even exist yet.',
      },
      {
        id: 'p-5',
        index: 5,
        text: 'The way to figure out what to work on is by working. If you\'re not sure what to work on, guess. But pick something and get going. You\'ll probably guess wrong some of the time, but that\'s fine.',
        html: 'The way to figure out what to work on is by working. If you\'re not sure what to work on, guess. But pick something and get going. You\'ll probably guess wrong some of the time, but that\'s fine.',
      },
      {
        id: 'p-6',
        index: 6,
        text: 'It\'s good to have a habit of working on your own projects. Don\'t let "work" mean something that other people tell you to do. If you do manage to do great work one day, it will probably be on a project of your own.',
        html: 'It\'s good to have a habit of working on your own projects. Don\'t let "work" mean something that other people tell you to do. If you do manage to do great work one day, it will probably be on a project of your own.',
      },
      {
        id: 'p-7',
        index: 7,
        text: 'Four steps: choose a field, learn enough to get to the frontier, notice gaps, and explore promising ones. This is how practically everyone who\'s done great work has done it.',
        html: 'Four steps: choose a field, learn enough to get to the frontier, notice gaps, and explore promising ones. This is how practically everyone who\'s done great work has done it.',
      },
    ],
  },
  {
    id: 'fermi-paradox',
    title: 'The Fermi Paradox',
    byline: 'Tim Urban',
    siteName: 'Wait But Why',
    excerpt: 'Everyone feels something when they\'re in a really good stargazing spot on a clear night.',
    url: 'https://waitbutwhy.com/2014/05/fermi-paradox.html',
    wordCount: 720,
    paragraphs: [
      {
        id: 'p-0',
        index: 0,
        text: 'Everyone feels something when they\'re in a really good stargazing spot on a clear night and they look up and see this. Some people stick with the traditional awe experience, some ## freak out about aliens.',
        html: 'Everyone feels something when they\'re in a really good stargazing spot on a clear night and they look up and see this. Some people stick with the traditional awe experience, some freak out about aliens.',
      },
      {
        id: 'p-1',
        index: 1,
        text: 'The observable universe is about 90 billion light years in diameter. There are at least 100 billion galaxies, each containing 100-400 billion stars. That means there are roughly 10^24 stars in the observable universe.',
        html: 'The observable universe is about 90 billion light years in diameter. There are at least 100 billion galaxies, each containing 100-400 billion stars. That means there are roughly 10<sup>24</sup> stars in the observable universe.',
      },
      {
        id: 'p-2',
        index: 2,
        text: 'For every grain of sand on every beach on Earth, there are 10,000 stars out there. The Milky Way alone contains an estimated 100-400 billion stars and roughly that same number of planets.',
        html: 'For every grain of sand on every beach on Earth, there are 10,000 stars out there. The Milky Way alone contains an estimated 100-400 billion stars and roughly that same number of planets.',
      },
      {
        id: 'p-3',
        index: 3,
        text: 'Scientists believe there could be 10 billion Earth-like planets in the Milky Way alone. If even a tiny percentage of those developed life, and a tiny percentage of those developed intelligent life, there should be thousands of intelligent civilizations in our galaxy.',
        html: 'Scientists believe there could be 10 billion Earth-like planets in the Milky Way alone. If even a tiny percentage of those developed life, and a tiny percentage of those developed intelligent life, there should be thousands of intelligent civilizations in our galaxy.',
      },
      {
        id: 'p-4',
        index: 4,
        text: 'So where is everybody? This is the Fermi Paradox. The apparent contradiction between the lack of evidence for extraterrestrial civilizations and the high probability that such civilizations exist.',
        html: 'So where is everybody? This is the Fermi Paradox. The apparent contradiction between the lack of evidence for extraterrestrial civilizations and the high probability that such civilizations exist.',
      },
      {
        id: 'p-5',
        index: 5,
        text: 'There are many possible explanations. Maybe intelligent life is extremely rare. Maybe civilizations destroy themselves before they can spread. Maybe we\'re being observed but not contacted. Maybe the universe is too vast.',
        html: 'There are many possible explanations. Maybe intelligent life is extremely rare. Maybe civilizations destroy themselves before they can spread. Maybe we\'re being observed but not contacted. Maybe the universe is too vast.',
      },
    ],
  },
];

export function getMockArticle(id: string): MockArticle | undefined {
  return mockArticles.find(a => a.id === id);
}

export function getMockArticleByUrl(url: string): MockArticle | undefined {
  return mockArticles.find(a => a.url.includes(url) || url.includes(a.id));
}
