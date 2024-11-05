const categories: Record<
  | 'Social Butterfly'
  | 'Famous Peacock'
  | 'Wise Owl'
  | 'Sleepy Sloth'
  | 'Busy Bee'
  | 'Curious Cat'
  | 'Social Spider',
  { trait: string; emoji: string }
> = {
  'Social Butterfly': {
    trait:
      "You're fluttering from conversation to conversation, pollinating discussions with your replies.",
    emoji: '🦋',
  },
  'Famous Peacock': {
    trait:
      'You love showcasing your own thoughts, strutting through threads with self-assured elegance.',
    emoji: '🦚',
  },
  'Wise Owl': {
    trait: "You're the one starting thoughtful discussions, sharing wisdom from your perch.",
    emoji: '🦉',
  },
  'Sleepy Sloth': {
    trait: 'Minimal movement through the social jungle, just hanging around occasionally.',
    emoji: '🦥',
  },
  'Busy Bee': {
    trait: 'Always working to connect the hive, buzzing between different conversations.',
    emoji: '🐝',
  },
  'Curious Cat': {
    trait: 'Poking your whiskers into every interesting conversation you find.',
    emoji: '🐱',
  },
  'Social Spider': {
    trait: 'Weaving complex webs of conversations, connecting multiple threads together.',
    emoji: '🕷️',
  },
}

const specialties: Record<
  'Artist' | 'Connector' | 'Explorer' | 'Conversationalist',
  { trait: string }
> = {
  Artist: {
    trait:
      'Your visual creativity shines through in every post, painting the digital canvas with images and videos.',
  },
  Connector: {
    trait:
      'You excel at bridging conversations across the platform, creating a web of interconnected discussions.',
  },
  Explorer: {
    trait:
      'Always venturing beyond, bringing external knowledge and resources to enrich conversations.',
  },
  Conversationalist: {
    trait: 'Your strength lies in pure dialogue, weaving words into meaningful exchanges.',
  },
}

export function determineCategory(args: {
  nbPostStared: number
  nbPostRepliesToAStartedOne: number
  nbPostRepliesToOthers: number
  kindOfEmbed: {
    kind: string
    count: number
  }[]
}): { title: string; traits: string; emoji: string } {
  const { nbPostStared, nbPostRepliesToAStartedOne, nbPostRepliesToOthers, kindOfEmbed } = args

  const totalReplies = nbPostRepliesToAStartedOne + nbPostRepliesToOthers
  const totalInteractions = nbPostStared + totalReplies
  const totalTotal = totalReplies + totalInteractions

  const nbPostStaredRatio = nbPostStared / totalInteractions
  const nbPostRepliesToAStartedOneRatio = nbPostRepliesToAStartedOne / totalInteractions
  const nbPostRepliesToOthersRatio = nbPostRepliesToOthers / totalInteractions

  let linkInside = 0
  let linkOutside = 0
  let art = 0

  for (const embed of kindOfEmbed) {
    if (embed.kind.includes('link to other post')) {
      linkInside += embed.count
    } else if (embed.kind.includes('link to outside')) {
      linkOutside += embed.count
    } else if (embed.kind.includes('image') || embed.kind.includes('video')) {
      art += embed.count
    }
  }

  const artRatio = art / totalTotal
  const linkInsideRatio = linkInside / totalTotal
  const linkOutsideRatio = linkOutside / totalTotal

  // console.log(`artRatio`, artRatio)
  // console.log(`linkInsideRatio`, linkInsideRatio)
  // console.log(`linkOutsideRatio`, linkOutsideRatio)

  let animalBase: keyof typeof categories
  if (totalInteractions < 10) {
    animalBase = 'Sleepy Sloth'
  } else if (
    nbPostRepliesToAStartedOneRatio > 0.4 &&
    nbPostRepliesToAStartedOneRatio > nbPostRepliesToOthersRatio
  ) {
    animalBase = 'Famous Peacock'
  } else if (nbPostRepliesToOthersRatio > 0.5 && nbPostStaredRatio < 0.2) {
    animalBase = 'Social Butterfly'
  } else if (nbPostStaredRatio > 0.4 && nbPostStared > totalReplies * 0.8) {
    animalBase = 'Wise Owl'
  } else if (nbPostRepliesToOthersRatio > 0.5 && nbPostStaredRatio < 0.5) {
    animalBase = 'Curious Cat'
  } else if (nbPostRepliesToOthersRatio > 0.4 && nbPostStaredRatio > 0.3) {
    animalBase = 'Busy Bee'
  } else {
    animalBase = 'Social Spider'
  }

  // Then determine specialty
  let specialty: keyof typeof specialties
  if (linkInsideRatio > 0.1) {
    specialty = 'Connector'
  } else if (artRatio > 0.07) {
    specialty = 'Artist'
  } else if (linkInsideRatio > 0.05) {
    specialty = 'Connector'
  } else if (linkOutsideRatio > 0.06) {
    specialty = 'Explorer'
  } else {
    specialty = 'Conversationalist'
  }

  // Combine title and traits
  const title = `The ${animalBase} ${specialty}`
  const traits = `${categories[animalBase].trait} ${specialties[specialty].trait}`

  return {
    title,
    traits,
    emoji: categories[animalBase].emoji,
  }
}
